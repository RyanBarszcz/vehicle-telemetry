from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import auth, dashboard, sessions, telemetry, vehicles, session_files

app = FastAPI(title="Vehicle Telemetry API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://telemetry.ryanbarszcz.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(sessions.router)
app.include_router(telemetry.router)
app.include_router(dashboard.router)
app.include_router(session_files.router)

@app.get("/")
def root():
    return {"message": "Vehicle Telemetry API running"}