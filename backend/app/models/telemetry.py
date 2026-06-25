import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class TelemetryPoint(Base):
    __tablename__ = "telemetry_points"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    session_id = Column(
        String,
        ForeignKey("driving_sessions.id"),
        nullable=False,
        index=True,
    )

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    rpm = Column(Integer, nullable=False)
    speed_mph = Column(Float, nullable=False)
    throttle_percent = Column(Float, nullable=False)
    coolant_temp_f = Column(Float, nullable=False)

    intake_temp_f = Column(Float, nullable=True)
    boost_psi = Column(Float, nullable=True)
    fuel_level_percent = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)

    session = relationship("DrivingSession", back_populates="telemetry_points")