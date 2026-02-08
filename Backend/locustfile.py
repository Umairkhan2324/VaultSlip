"""
Locust load test: health and receipts list.
Run: locust -f locustfile.py --host=http://localhost:8000
Optional: LOAD_TEST_TOKEN env for authenticated /receipts.
"""
import os
from locust import HttpUser, task, between


class ApiUser(HttpUser):
    wait_time = between(0.5, 1.5)

    def on_start(self):
        self.token = os.environ.get("LOAD_TEST_TOKEN", "")

    @task(3)
    def health(self):
        self.client.get("/health")

    @task(1)
    def list_receipts(self):
        if self.token:
            self.client.get(
                "/receipts?skip=0&limit=50",
                headers={"Authorization": f"Bearer {self.token}"},
            )
        else:
            self.client.get("/receipts?skip=0&limit=50")
