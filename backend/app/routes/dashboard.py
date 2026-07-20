from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import DrivingSession
from app.models.user import User
from app.models.vehicle import GarageVehicle, Vehicle
from app.core.auth import get_clerk_user_id

router = APIRouter(tags=["Dashboard"])


def get_db_user(db: Session, clerk_id: str) -> User:
    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if not user:
        raise Exception("User not synced")

    return user


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    vehicles = (
        db.query(Vehicle)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(GarageVehicle.user_id == user.id)
        .limit(3)
        .all()
    )

    vehicle_count = (
        db.query(func.count(Vehicle.id))
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(GarageVehicle.user_id == user.id)
        .scalar()
        or 0
    )

    session_count = (
        db.query(func.count(DrivingSession.id))
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(GarageVehicle.user_id == user.id)
        .scalar()
        or 0
    )

    miles_logged = (
        db.query(func.coalesce(func.sum(DrivingSession.distance_miles), 0))
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(GarageVehicle.user_id == user.id)
        .scalar()
        or 0
    )

    recent_sessions = (
        db.query(DrivingSession, Vehicle)
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(GarageVehicle.user_id == user.id)
        .order_by(DrivingSession.started_at.desc())
        .limit(3)
        .all()
    )

    return {
        "vehicle_count": vehicle_count,
        "session_count": session_count,
        "miles_logged": float(miles_logged),
        "active_alert_count": 0,
        "vehicles": [
            {
                "id": vehicle.id,
                "name": vehicle.nickname,
                "year": vehicle.year,
                "make": vehicle.make,
                "model": vehicle.model,
            }
            for vehicle in vehicles
        ],
        "recent_sessions": [
            {
                "id": session.id,
                "title": session.title,
                "vehicle_name": vehicle.nickname,
                "duration_seconds": session.duration_seconds,
                "distance_miles": session.distance_miles,
                "max_speed_mph": session.max_speed_mph,
            }
            for session, vehicle in recent_sessions
        ],
    }