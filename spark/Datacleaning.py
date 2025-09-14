import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    from_json,
    col,
    lit,
    avg as spark_avg,
    current_timestamp,
    unix_timestamp,
    when,
    to_json,
    struct,
    current_date,
    abs as spark_abs,
    max as spark_max,
)
from pyspark.sql.types import (
    StructType,
    StructField,
    StringType,
    DateType,
    FloatType,
    IntegerType,
)
from pyspark.sql.window import Window

# --- Configuration ---
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9094")
KAFKA_TOPIC_ACTIVITY = os.getenv("KAFKA_TOPIC_ACTIVITY", "activity")
KAFKA_TOPIC_SLEEP = os.getenv("KAFKA_TOPIC_SLEEP", "sleep")
KAFKA_TOPIC_OUTPUT = os.getenv("KAFKA_TOPIC_OUTPUT", "metrics_output")
PRINT_DEBUG = True

if PRINT_DEBUG:
    print("✨ Initializing Spark Session...")
spark = SparkSession.builder.appName(
    "FitnessDataProcessingBatchToKafka_Fallback"
).getOrCreate()
spark.sparkContext.setLogLevel("WARN")
if PRINT_DEBUG:
    print("Spark Session initialized.")

# --- Schemas ---
activity_schema = StructType(
    [
        StructField("user_id", StringType()),
        StructField(
            "date", StringType()
        ),  # expecting ISO date string e.g. "2025-09-14"
        StructField("duration", IntegerType()),
        StructField("heart_rate_avg", IntegerType()),
    ]
)

sleep_schema = StructType(
    [
        StructField("user_id", StringType()),
        StructField("date", StringType()),
        StructField("resting_heart_rate", IntegerType()),
        StructField("deep_sleep", FloatType()),
        StructField("sleep_efficiency", FloatType()),
        StructField("awakenings", IntegerType()),
    ]
)

# --- Read Kafka (batch) ---
if PRINT_DEBUG:
    print(
        f"📖 Reading from Kafka topics in batch mode: {KAFKA_TOPIC_ACTIVITY} and {KAFKA_TOPIC_SLEEP}..."
    )
activity_df = (
    spark.read.format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
    .option("subscribe", KAFKA_TOPIC_ACTIVITY)
    .load()
)

sleep_df = (
    spark.read.format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
    .option("subscribe", KAFKA_TOPIC_SLEEP)
    .load()
)

# --- Parse JSON and cast types ---
parsed_activity = (
    activity_df.selectExpr("CAST(value AS STRING) as json_payload")
    .select(from_json(col("json_payload"), activity_schema).alias("data"))
    .select("data.*")
    .withColumn("date", col("date").cast(DateType()))
    .withColumn("ingest_ts", current_timestamp())
)

parsed_sleep = (
    sleep_df.selectExpr("CAST(value AS STRING) as json_payload")
    .select(from_json(col("json_payload"), sleep_schema).alias("data"))
    .select("data.*")
    .withColumn("date", col("date").cast(DateType()))
    .withColumn("ingest_ts", current_timestamp())
)

# --- First attempt: inner join (strict match on user_id + date) ---
if PRINT_DEBUG:
    print("🤝 Attempting inner join on user_id and date...")
inner_joined = parsed_activity.join(parsed_sleep, ["user_id", "date"], "inner").select(
    parsed_activity["user_id"],
    parsed_activity["date"],
    parsed_activity["duration"],
    parsed_activity["heart_rate_avg"],
    parsed_sleep["resting_heart_rate"],
    parsed_sleep["deep_sleep"],
    parsed_sleep["sleep_efficiency"],
    parsed_sleep["awakenings"],
)


def is_rdd_empty(df):
    try:
        return df.rdd.isEmpty()
    except Exception:
        # fallback: use count (less efficient)
        return df.count() == 0


if not is_rdd_empty(inner_joined):
    if PRINT_DEBUG:
        print("✅ Inner join returned rows. Using inner-joined data.")
    joined_df = inner_joined
else:
    # Fallback 1: use activity as base (left join), keep rows that have activity fields
    if PRINT_DEBUG:
        print(
            "⚠️ Inner join returned no rows. Falling back to activity-as-base (left join)."
        )
    if is_rdd_empty(parsed_activity):
        print(
            "⚠️ No activity records present at all. Cannot compute daily_load. Exiting."
        )
        spark.stop()
        raise SystemExit("No activity data to compute daily load.")
    left_joined = (
        parsed_activity.join(parsed_sleep, ["user_id", "date"], "left")
        .select(
            parsed_activity["user_id"],
            parsed_activity["date"],
            parsed_activity["duration"],
            parsed_activity["heart_rate_avg"],
            parsed_sleep["resting_heart_rate"],
            parsed_sleep["deep_sleep"],
            parsed_sleep["sleep_efficiency"],
            parsed_sleep["awakenings"],
        )
        .filter((col("duration").isNotNull()) & (col("heart_rate_avg").isNotNull()))
    )
    if not is_rdd_empty(left_joined):
        if PRINT_DEBUG:
            print(
                "✅ Found activity-based rows with required activity fields. Using these."
            )
        joined_df = left_joined
    else:
        # Extremely rare: parsed_activity exists but none have both duration and heart_rate_avg
        print(
            "⚠️ Activity records exist but none contain both duration and heart_rate_avg. Exiting."
        )
        spark.stop()
        raise SystemExit("Activity rows missing required fields.")

# --- Step: compute daily_load from joined_df (activity-based) ---
daily_metrics = joined_df.withColumn(
    "daily_load", col("duration") * col("heart_rate_avg")
)

# --- Calculate ACWR using calendar-based rolling windows ---
if PRINT_DEBUG:
    print("📊 Calculating ACWR with calendar-based rolling windows...")

metrics_with_ts = daily_metrics.withColumn(
    "date_ts", unix_timestamp(col("date").cast("timestamp"))
)
SECONDS_IN_DAY = 86400
window_spec_acute = (
    Window.partitionBy("user_id")
    .orderBy(col("date_ts"))
    .rangeBetween(-7 * SECONDS_IN_DAY + 1, 0)
)
window_spec_chronic = (
    Window.partitionBy("user_id")
    .orderBy(col("date_ts"))
    .rangeBetween(-28 * SECONDS_IN_DAY + 1, 0)
)

computed_df = (
    metrics_with_ts.withColumn(
        "acute_load", spark_avg("daily_load").over(window_spec_acute)
    )
    .withColumn("chronic_load", spark_avg("daily_load").over(window_spec_chronic))
    .withColumn(
        "ACWR",
        col("acute_load")
        / when(col("chronic_load") > 0, col("chronic_load")).otherwise(lit(1.0)),
    )
    .select("user_id", "date", "acute_load", "chronic_load", "ACWR")
)

# --- Find the first date it can start from (earliest date that has daily_load data) ---
if PRINT_DEBUG:
    print("🔎 Determining the earliest date that can produce results...")
min_date_row = computed_df.selectExpr("min(date) as min_date").collect()
start_date = None
if min_date_row and min_date_row[0] and min_date_row[0]["min_date"] is not None:
    start_date = min_date_row[0]["min_date"]
    if PRINT_DEBUG:
        print(f"First usable date found: {start_date}")
else:
    # As a safety fallback, try to take the earliest date from the activity dataset
    fallback_row = parsed_activity.selectExpr("min(date) as min_date").collect()
    if fallback_row and fallback_row[0] and fallback_row[0]["min_date"] is not None:
        start_date = fallback_row[0]["min_date"]
        if PRINT_DEBUG:
            print(f"Fallback earliest activity date used: {start_date}")

if start_date is None:
    print("⚠️ Could not determine a valid start date to produce results. Exiting.")
    spark.stop()
    raise SystemExit("No valid start date found.")

# Filter computed results to start from that date (inclusive)
output_for_kafka = computed_df.filter(col("date") >= lit(start_date).cast(DateType()))

if is_rdd_empty(output_for_kafka):
    print("⚠️ No computed rows to write after filtering by start_date. Exiting.")
    spark.stop()
    raise SystemExit("No rows to write to Kafka after filtering by start_date.")

# --- Prepare Kafka payload: key=user_id, value=json of metrics ---
kafka_ready = (
    output_for_kafka.withColumn("key", col("user_id").cast("string"))
    .withColumn(
        "value",
        to_json(
            struct(
                col("user_id"),
                col("date"),
                col("acute_load"),
                col("chronic_load"),
                col("ACWR"),
            )
        ),
    )
    .selectExpr("CAST(key AS STRING) as key", "CAST(value AS STRING) as value")
)

if PRINT_DEBUG:
    count = kafka_ready.count()
    print(f"📝 Writing {count} records to Kafka topic: {KAFKA_TOPIC_OUTPUT} ...")

kafka_ready.write.format("kafka").option(
    "kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS
).option("topic", KAFKA_TOPIC_OUTPUT).save()

if PRINT_DEBUG:
    print("✅ Batch write to Kafka complete.")

spark.stop()
