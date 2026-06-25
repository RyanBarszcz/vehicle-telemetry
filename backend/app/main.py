from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import auth, sessions, telemetry, vehicles

app = FastAPI(title="Vehicle Telemetry API")

# TODO: Make sure routes are protected with prev stuff

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(sessions.router)
app.include_router(telemetry.router)

@app.get("/")
def root():
    return {"message": "Vehicle Telemetry API running"}