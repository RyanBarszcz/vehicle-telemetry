from datetime import datetime
from pydantic import BaseModel


class TelemetryPointCreate(BaseModel):
    id: str
    sessionId: str

    timestamp: datetime | None = None

    rpm: int
    speed_mph: float
    throttle_percent: float
    coolant_temp_f: float

    intake_temp_f: float | None = None
    boost_psi: float | None = None
    fuel_level_percent: float | None = None
    battery_voltage: float | None = None


class TelemetryBatchCreate(BaseModel):
    points: list[TelemetryPointCreate]


class TelemetryPointResponse(BaseModel):
    id: str
    session_id: str
    timestamp: datetime

    rpm: int
    speed_mph: float
    throttle_percent: float
    coolant_temp_f: float

    intake_temp_f: float | None
    boost_psi: float | None
    fuel_level_percent: float | None
    battery_voltage: float | None

    class Config:
        from_attributes = True