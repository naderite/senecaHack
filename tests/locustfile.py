from locust import HttpUser, task, between
import datetime
import random


class FitnessApiUser(HttpUser):
    wait_time = between(1, 3)  # pause between requests

    def on_start(self):
        # Authenticate once per user at the start
        response = self.client.post(
            "/token",
            data={"username": "user123", "password": "securepassword"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = None
            self.headers = {}
            print("Failed to authenticate:", response.text)

    @task(2)
    def ingest_heartrate(self):
        if not self.token:
            return
        payload = {
            "user_id": "user123",
            "time": datetime.datetime.utcnow().isoformat(),
            "heart_rate": random.randint(60, 180),
        }
        self.client.post("/ingest/heartrate", json=payload, headers=self.headers)

    @task(2)
    def ingest_calories(self):
        if not self.token:
            return
        payload = {
            "user_id": "user123",
            "time": datetime.datetime.utcnow().isoformat(),
            "calories": round(random.uniform(0.5, 15.0), 2),
        }
        self.client.post("/ingest/calories", json=payload, headers=self.headers)

    @task(2)
    def ingest_steps(self):
        if not self.token:
            return
        payload = {
            "user_id": "user123",
            "time": datetime.datetime.utcnow().isoformat(),
            "steps": random.randint(1, 100),
        }
        self.client.post("/ingest/steps", json=payload, headers=self.headers)

    @task(1)
    def health_check(self):
        self.client.get("/health")
