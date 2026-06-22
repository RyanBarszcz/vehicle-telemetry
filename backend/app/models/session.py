import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class DrivingSession(Base):
    __tablename__ = "driving_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False, index=True)

    title = Column(String, nullable=False)

    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)

    duration_seconds = Column(Integer, nullable=False, default=0)

    distance_miles = Column(Float, nullable=True)

    max_speed_mph = Column(Float, nullable=False, default=0)
    avg_speed_mph = Column(Float, nullable=True)

    max_rpm = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    vehicle = relationship("Vehicle", back_populates="sessions")