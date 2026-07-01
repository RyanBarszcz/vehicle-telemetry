from datetime import datetime
from pydantic import BaseModel


class VehicleCreate(BaseModel):
    year: int
    make: str
    model: str
    trim: str | None = None
    nickname: str | None = None
    vin: str | None = None
    image_url: str | None = None


class VehicleUpdate(BaseModel):
    year: int | None = None
    make: str | None = None
    model: str | None = None
    trim: str | None = None
    nickname: str | None = None
    vin: str | None = None
    image_url: str | None = None


class VehicleResponse(BaseModel):
    id: str
    year: int
    make: str
    model: str
    trim: str | None = None
    nickname: str | None = None
    vin: str | None = None
    image_url: str | None = None

    session_count: int = 0
    last_session_at: datetime | None = None
    max_rpm: int | None = None
    max_speed_mph: float | None = None
    total_distance_miles: float | None = None

    class Config:
        from_attributes = True