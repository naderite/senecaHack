#!/usr/bin/env python3
"""
Stream Kafka -> TimescaleDB in realtime.
Consumes messages continuously and inserts immediately into TimescaleDB.
"""

import os
import json
import logging
from datetime import datetime, timezone

from confluent_kafka import Consumer, KafkaError
import psycopg2

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Config ---
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "timescale-stream")
KAFKA_TOPICS = os.getenv("KAFKA_TOPICS", "heartrate,calories,steps").split(",")

PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = int(os.getenv("PG_PORT", "5432"))
PG_DATABASE = os.getenv("PG_DATABASE", "gdp_db")
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "postgres")


# --- DB connection ---
def get_pg_conn():
    return psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DATABASE,
        user=PG_USER,
        password=PG_PASSWORD,
    )


# --- Topic → table mapping ---
INSERT_MAP = {
    "heartrate": ("heartrate_data", ("time", "user_id", "heart_rate")),
    "calories": ("calories_data", ("time", "user_id", "calories")),
    "steps": ("steps_data", ("time", "user_id", "steps")),
}


# --- Parse Kafka message ---
def parse_message(topic: str, raw: bytes):
    obj = json.loads(raw.decode("utf-8"))

    t_raw = obj.get("time") or obj.get("time") or obj.get("timestamp")
    if isinstance(t_raw, (int, float)):
        time = datetime.fromtimestamp(float(t_raw), tz=timezone.utc)
    else:
        tstr = str(t_raw)
        if tstr.endswith("Z"):
            tstr = tstr[:-1] + "+00:00"
        time = datetime.fromisoformat(tstr).astimezone(timezone.utc)

    if topic == "heartrate":
        return ("heartrate_data", (time, obj["user_id"], int(obj["heart_rate"])))
    elif topic == "calories":
        return ("calories_data", (time, obj["user_id"], float(obj["calories"])))
    elif topic == "steps":
        return ("steps_data", (time, obj["user_id"], int(obj["steps"])))
    else:
        raise ValueError(f"Unknown topic {topic}")


# --- Stream processor ---
def main():
    consumer_conf = {
        "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
        "group.id": KAFKA_GROUP_ID,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
    }
    consumer = Consumer(consumer_conf)
    consumer.subscribe(KAFKA_TOPICS)

    conn = get_pg_conn()
    cur = conn.cursor()

    logging.info("📡 Starting Kafka → Timescale stream...")
    try:
        while True:
            msg = consumer.poll(0.5)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                logging.error("Kafka error: %s", msg.error())
                continue

            try:
                table, row = parse_message(msg.topic(), msg.value())
                cols = INSERT_MAP[msg.topic()][1]
                sql = f"""
                    INSERT INTO {table} ({','.join(cols)})
                    SELECT %s, %s, %s
                    WHERE NOT EXISTS (
                        SELECT 1 FROM {table} WHERE time = %s AND user_id = %s
                    );
                """
                cur.execute(sql, row + row[:2])
                conn.commit()
                consumer.commit(message=msg, asynchronous=False)
                logging.info("✅ Streamed to %s: %s", table, row)
            except Exception as e:
                logging.exception("❌ Failed to insert: %s", e)
                conn.rollback()

    except KeyboardInterrupt:
        logging.info("👋 Stopping stream consumer...")
    finally:
        consumer.close()
        conn.close()


if __name__ == "__main__":
    main()
