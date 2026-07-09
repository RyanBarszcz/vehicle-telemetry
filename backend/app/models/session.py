import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class DrivingSession(Base):
    __tablename__ = "driving_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False, index=True)

    title = Column(String, nullable=False)

    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime, nullable=True)

    duration_seconds = Column(Integer, nullable=False, default=0)

    distance_miles = Column(Float, nullable=True)

    max_speed_mph = Column(Float, nullable=False, default=0)
    avg_speed_mph = Column(Float, nullable=True)

    max_rpm = Column(Integer, nullable=False, default=0)

    # CSV / S3 telemetry storage
    selected_metrics = Column(JSON, nullable=True)

    csv_file_name = Column(String, nullable=True)
    csv_s3_key = Column(String, nullable=True)
    csv_s3_url = Column(String, nullable=True)
    csv_file_size_bytes = Column(Integer, nullable=True)

    sample_count = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    vehicle = relationship("Vehicle", back_populates="sessions")

    # Keep for now so old code/migrations don't break.
    # Later, once CSV/S3 fully replaces DB telemetry rows, we can remove this.
    telemetry_points = relationship(
        "TelemetryPoint",
        back_populates="session",
        cascade="all, delete-orphan",
    )