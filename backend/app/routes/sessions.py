from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import DrivingSession
from app.models.telemetry import TelemetryPoint
from app.models.user import User
from app.models.vehicle import GarageVehicle, Vehicle
from app.routes.auth import get_clerk_user_id
from app.schemas.session import (
    SessionCreate,
    SessionResponse,
    SessionEndUpdate,
)
from app.schemas.telemetry import TelemetryBatchCreate

router = APIRouter(tags=["Sessions"])


def get_db_user(db: Session, clerk_id: str) -> User:
    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not synced")

    return user


def get_owned_vehicle(db: Session, user_id: str, vehicle_id: str) -> Vehicle:
    vehicle = (
        db.query(Vehicle)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            Vehicle.id == vehicle_id,
            GarageVehicle.user_id == user_id,
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle


@router.get(
    "/vehicles/{vehicle_id}/sessions",
    response_model=list[SessionResponse],
)
def get_vehicle_sessions(
    vehicle_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)
    get_owned_vehicle(db, user.id, vehicle_id)

    return (
        db.query(DrivingSession)
        .filter(DrivingSession.vehicle_id == vehicle_id)
        .order_by(DrivingSession.started_at.desc())
        .all()
    )


@router.post(
    "/vehicles/{vehicle_id}/sessions",
    response_model=SessionResponse,
)
def create_vehicle_session(
    vehicle_id: str,
    data: SessionCreate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)
    get_owned_vehicle(db, user.id, vehicle_id)

    session = DrivingSession(
        vehicle_id=vehicle_id,
        title=data.title,
        started_at=data.started_at or datetime.utcnow(),
        ended_at=data.ended_at,
        duration_seconds=data.duration_seconds,
        distance_miles=data.distance_miles,
        max_speed_mph=data.max_speed_mph,
        avg_speed_mph=data.avg_speed_mph,
        max_rpm=data.max_rpm,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session = (
        db.query(DrivingSession)
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            DrivingSession.id == session_id,
            GarageVehicle.user_id == user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session

@router.patch("/sessions/{session_id}/end", response_model=SessionResponse)
def end_session(
    session_id: str,
    data: SessionEndUpdate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session = (
        db.query(DrivingSession)
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            DrivingSession.id == session_id,
            GarageVehicle.user_id == user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.ended_at:
        return session

    session.ended_at = datetime.now(timezone.utc).replace(tzinfo=None)

    session.duration_seconds = data.duration_seconds
    session.distance_miles = data.distance_miles
    session.max_speed_mph = data.max_speed_mph
    session.avg_speed_mph = data.avg_speed_mph
    session.max_rpm = data.max_rpm

    db.commit()
    db.refresh(session)

    return session

@router.post("/sessions/{session_id}/telemetry/batch")
def create_telemetry_batch(
    session_id: str,
    payload: TelemetryBatchCreate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session = (
        db.query(DrivingSession)
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            DrivingSession.id == session_id,
            GarageVehicle.user_id == user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    for item in payload.points:
        point = TelemetryPoint(
            id=item.id,
            session_id=session.id,
            timestamp=item.timestamp,
            speed_mph=item.speed_mph,
            rpm=item.rpm,
            throttle_percent=item.throttle_percent,
            coolant_temp_f=item.coolant_temp_f,
            boost_psi=item.boost_psi,
        )

        db.merge(point)

    db.commit()

    return {"uploaded": len(payload.points)}