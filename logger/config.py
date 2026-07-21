import os

from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv(
    "DRIVEIQ_API_URL",
    "http://127.0.0.1:8000",
).rstrip("/")

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "DRIVEIQ_FRONTEND_ORIGINS",
        (
            "http://localhost:3000,"
            "http://127.0.0.1:3000,"
            "https://front-end-vehicle-telemetry.vercel.app,"
            "https://telemetry.ryanbarszcz.com"
        ),
    ).split(",")
    if origin.strip()
]