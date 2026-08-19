from locust import HttpUser, between, task


class DriveIQUser(HttpUser):
    wait_time = between(0.5, 2)

    @task
    def health_check(self):
        self.client.get("/")