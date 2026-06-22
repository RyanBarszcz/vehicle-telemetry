import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    year = Column(Integer, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    trim = Column(String, nullable=True)

    nickname = Column(String, nullable=True)
    vin = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    garage_users = relationship("GarageVehicle", back_populates="vehicle", cascade="all, delete-orphan")
    sessions = relationship(
    "DrivingSession",
    back_populates="vehicle",
    cascade="all, delete-orphan",
)


class GarageVehicle(Base):
    __tablename__ = "garage_vehicles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False, index=True)

    role = Column(String, nullable=False, default="OWNER")

    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="garage_vehicles")
    vehicle = relationship("Vehicle", back_populates="garage_users")