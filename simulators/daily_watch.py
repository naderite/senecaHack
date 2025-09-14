import os
import json
import logging
import random
from datetime import datetime, date, timedelta

# Confluent Kafka imports
from confluent_kafka import Producer, KafkaException

# Faker for data generation
from faker import Faker

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


# --- Configuration (using environment variables for security) ---
class Settings:
    """
    Kafka and topic settings.
    """

    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv(
        "KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"
    )
    KAFKA_TOPIC_ACTIVITY: str = os.getenv("KAFKA_TOPIC_ACTIVITY", "activity")
    KAFKA_TOPIC_SLEEP: str = os.getenv("KAFKA_TOPIC_SLEEP", "sleep")


settings = Settings()

# Initialize the Faker generator
fake = Faker()


# --- Data Generation Functions (from your provided code) ---
def generate_activity_data(num_entries):
    """
    Generates a list of dictionaries with fake activity data.
    """
    activities = []
    for i in range(num_entries):
        user_id = f"user_{i+1:06d}"
        duration = random.randint(30, 120)  # in minutes
        heart_rate_avg = random.randint(80, 180)
        activity_date = fake.date_between(
            start_date=date.today() - timedelta(days=365), end_date="today"
        )
        activity = {
            "user_id": user_id,
            "date": activity_date.isoformat(),
            "duration": duration,
            "heart_rate_avg": heart_rate_avg,
        }
        activities.append(activity)
    return activities


def generate_sleep_data(num_entries):
    """
    Generates a list of dictionaries with fake sleep data.
    """
    sleep_sessions = []
    sleep_qualities = ["Excellent", "Good", "Fair", "Poor"]
    for i in range(num_entries):
        user_id = f"user_{i+1:06d}"
        sleep_date = fake.date_between(
            start_date=date.today() - timedelta(days=365), end_date="today"
        )
        total_sleep_hours = round(random.uniform(6.0, 9.0), 1)
        deep_sleep = round(total_sleep_hours * random.uniform(0.15, 0.3), 1)

        sleep_quality = random.choice(sleep_qualities)
        if sleep_quality == "Excellent":
            sleep_efficiency = round(random.uniform(95.0, 99.0), 1)
            awakenings = random.randint(0, 2)
        elif sleep_quality == "Good":
            sleep_efficiency = round(random.uniform(85.0, 94.9), 1)
            awakenings = random.randint(1, 5)
        elif sleep_quality == "Fair":
            sleep_efficiency = round(random.uniform(70.0, 84.9), 1)
            awakenings = random.randint(4, 8)
        else:  # Poor
            sleep_efficiency = round(random.uniform(50.0, 69.9), 1)
            awakenings = random.randint(6, 15)

        resting_heart_rate = random.randint(45, 80)

        sleep_session = {
            "user_id": user_id,
            "date": sleep_date.isoformat(),
            "deep_sleep": deep_sleep,
            "sleep_efficiency": sleep_efficiency,
            "awakenings": awakenings,
            "resting_heart_rate": resting_heart_rate,
        }
        sleep_sessions.append(sleep_session)
    return sleep_sessions


# --- Kafka Producer Functions ---
def delivery_report(err, msg):
    """
    Delivery callback for Kafka producer.
    """
    if err is not None:
        logging.error(f"Message delivery failed: {err} (topic={msg.topic()})")
    else:
        logging.info(
            f"Message delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}"
        )


def publish_to_kafka(producer, topic: str, data_list: list) -> int:
    """
    Publishes a list of dictionaries to a Kafka topic.
    Returns the number of messages successfully enqueued.
    """
    if producer is None:
        logging.error("Kafka producer is not initialized.")
        return 0

    success_count = 0
    for data in data_list:
        try:
            # JSON-encode the dictionary
            json_data = json.dumps(data, default=str)
            byte_data = json_data.encode("utf-8")

            # Use user_id as the message key for consistent partitioning
            key = (
                str(data.get("user_id")).encode("utf-8") if "user_id" in data else None
            )

            producer.produce(topic, key=key, value=byte_data, callback=delivery_report)
            success_count += 1

            # Poll the producer periodically to process callbacks and free up local queue
            producer.poll(0)

        except BufferError:
            logging.warning("Local producer queue is full, waiting...")
            producer.poll(1)  # Wait for a second to free up space
            producer.produce(topic, key=key, value=byte_data, callback=delivery_report)
            success_count += 1
        except KafkaException as ke:
            logging.error(f"KafkaException while producing: {ke}")
        except Exception as e:
            logging.error(f"Failed to publish message to Kafka: {e}")

    return success_count


# --- Main Execution Block ---
if __name__ == "__main__":
    # Set the number of entries you want to generate
    NUM_ENTRIES = 10

    # Create producer instance
    producer_conf = {"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS}
    producer = None
    try:
        producer = Producer(producer_conf)
        logging.info("Kafka Producer initialized.")
    except Exception as e:
        logging.error(f"Failed to create Kafka Producer: {e}")
        exit(1)

    try:
        # Generate the data
        logging.info(f"Generating {NUM_ENTRIES} sample activity and sleep data points.")
        activity_data_list = generate_activity_data(NUM_ENTRIES)
        sleep_data_list = generate_sleep_data(NUM_ENTRIES)

        # Publish the data to Kafka
        logging.info("Publishing activity data to Kafka...")
        activity_count = publish_to_kafka(
            producer, settings.KAFKA_TOPIC_ACTIVITY, activity_data_list
        )
        logging.info(f"Published {activity_count} activity messages.")

        logging.info("Publishing sleep data to Kafka...")
        sleep_count = publish_to_kafka(
            producer, settings.KAFKA_TOPIC_SLEEP, sleep_data_list
        )
        logging.info(f"Published {sleep_count} sleep messages.")

    finally:
        # Flush the producer to ensure all messages are delivered
        logging.info("Flushing producer to ensure all messages are delivered...")
        producer.flush(10)
        logging.info("Producer flushed. Script finished.")
