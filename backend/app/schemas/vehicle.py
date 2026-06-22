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
    trim: str | None
    nickname: str | None
    vin: str | None
    image_url: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True