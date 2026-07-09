from datetime import datetime

from pydantic import BaseModel


class SessionCreate(BaseModel):
    title: str

    selected_metrics: list[str] | None = None

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

    selected_metrics: list[str] | None = None

    started_at: datetime
    ended_at: datetime | None

    duration_seconds: int

    distance_miles: float | None

    max_speed_mph: float
    avg_speed_mph: float | None

    max_rpm: int

    csv_file_name: str | None = None
    csv_s3_key: str | None = None
    csv_s3_url: str | None = None
    csv_file_size_bytes: int | None = None

    sample_count: int | None = None

    created_at: datetime

    class Config:
        from_attributes = True


class SessionEndUpdate(BaseModel):
    title: str | None = None

    duration_seconds: int

    distance_miles: float | None = None

    max_speed_mph: float
    avg_speed_mph: float | None = None

    max_rpm: int