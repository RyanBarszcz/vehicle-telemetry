import os

from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv(
    "DRIVEIQ_API_URL",
    "https://back-end-vehicle-telemetry.vercel.app",
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