from datetime import datetime
from pydantic import BaseModel
from typing import Optional



class SessionCreate(BaseModel):
    title: str
    started_at: datetime | None = None
    ended_at: datetime | None = None
    duration_seconds: int = 0
    distance_miles: float | None = None
    max_speed_mph: float = 0
    avg_speed_mph: float | None = None
    max_rpm: int = 0


class SessionResponse(BaseModel):
    id: str
    vehicle_id: str
    title: str
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int
    distance_miles: float | None
    max_speed_mph: float
    avg_speed_mph: float | None
    max_rpm: int
    created_at: datetime

    class Config:
        from_attributes = True

class SessionEndUpdate(BaseModel):
    duration_seconds: int
    distance_miles: Optional[float] = None
    max_speed_mph: float
    avg_speed_mph: Optional[float] = None
    max_rpm: int