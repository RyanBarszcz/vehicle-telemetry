from datetime import datetime, timezone
from typing import Any

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
    SessionEndUpdate,
    SessionResponse,
)
from app.schemas.telemetry import TelemetryBatchCreate

router = APIRouter(tags=["Sessions"])


def get_db_user(
    db: Session,
    clerk_id: str,
) -> User:
    user = (
        db.query(User)
        .filter(User.clerk_id == clerk_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not synced",
        )

    return user


def get_accessible_vehicle(
    db: Session,
    user_id: str,
    vehicle_id: str,
) -> Vehicle:
    """
    Returns a vehicle that exists in the user's garage.

    This currently allows any GarageVehicle role to access the vehicle.
    """
    vehicle = (
        db.query(Vehicle)
        .join(
            GarageVehicle,
            GarageVehicle.vehicle_id == Vehicle.id,
        )
        .filter(
            Vehicle.id == vehicle_id,
            GarageVehicle.user_id == user_id,
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found",
        )

    return vehicle


def get_accessible_session(
    db: Session,
    user_id: str,
    session_id: str,
) -> tuple[DrivingSession, Vehicle]:
    """
    Returns a session and its vehicle when the user has garage access.
    """
    result = (
        db.query(DrivingSession, Vehicle)
        .join(
            Vehicle,
            Vehicle.id == DrivingSession.vehicle_id,
        )
        .join(
            GarageVehicle,
            GarageVehicle.vehicle_id == Vehicle.id,
        )
        .filter(
            DrivingSession.id == session_id,
            GarageVehicle.user_id == user_id,
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    session, vehicle = result

    return session, vehicle


def get_vehicle_name(vehicle: Vehicle) -> str:
    fallback_name = " ".join(
        str(value)
        for value in [
            vehicle.year,
            vehicle.make,
            vehicle.model,
            vehicle.trim,
        ]
        if value
    )

    return vehicle.nickname or fallback_name or "Vehicle"


def serialize_session(
    session: DrivingSession,
    vehicle: Vehicle,
) -> dict[str, Any]:
    return {
        "id": session.id,
        "vehicle_id": session.vehicle_id,
        "vehicle_name": get_vehicle_name(vehicle),
        "title": session.title,
        "selected_metrics": session.selected_metrics,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "duration_seconds": session.duration_seconds,
        "distance_miles": session.distance_miles,
        "max_speed_mph": session.max_speed_mph,
        "avg_speed_mph": session.avg_speed_mph,
        "max_rpm": session.max_rpm,
        "created_at": session.created_at,
    }


@router.get(
    "/sessions",
    response_model=list[SessionResponse],
)
def get_user_sessions(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    results = (
        db.query(DrivingSession, Vehicle)
        .join(
            Vehicle,
            Vehicle.id == DrivingSession.vehicle_id,
        )
        .join(
            GarageVehicle,
            GarageVehicle.vehicle_id == Vehicle.id,
        )
        .filter(GarageVehicle.user_id == user.id)
        .order_by(DrivingSession.started_at.desc())
        .all()
    )

    return [
        serialize_session(session, vehicle)
        for session, vehicle in results
    ]


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

    vehicle = get_accessible_vehicle(
        db,
        user.id,
        vehicle_id,
    )

    sessions = (
        db.query(DrivingSession)
        .filter(DrivingSession.vehicle_id == vehicle_id)
        .order_by(DrivingSession.started_at.desc())
        .all()
    )

    return [
        serialize_session(session, vehicle)
        for session in sessions
    ]


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

    vehicle = get_accessible_vehicle(
        db,
        user.id,
        vehicle_id,
    )

    session = DrivingSession(
        vehicle_id=vehicle_id,
        title=data.title,
        selected_metrics=data.selected_metrics,
        started_at=(
            data.started_at
            or datetime.now(timezone.utc).replace(tzinfo=None)
        ),
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

    return serialize_session(session, vehicle)


@router.get(
    "/sessions/{session_id}",
    response_model=SessionResponse,
)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session, vehicle = get_accessible_session(
        db,
        user.id,
        session_id,
    )

    return serialize_session(session, vehicle)


@router.patch(
    "/sessions/{session_id}/end",
    response_model=SessionResponse,
)
def end_session(
    session_id: str,
    data: SessionEndUpdate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session, vehicle = get_accessible_session(
        db,
        user.id,
        session_id,
    )

    if session.ended_at:
        return serialize_session(session, vehicle)

    session.ended_at = (
        datetime.now(timezone.utc)
        .replace(tzinfo=None)
    )

    if data.title is not None:
        session.title = data.title.strip() or None

    session.duration_seconds = data.duration_seconds
    session.distance_miles = data.distance_miles
    session.max_speed_mph = data.max_speed_mph
    session.avg_speed_mph = data.avg_speed_mph
    session.max_rpm = data.max_rpm

    db.commit()
    db.refresh(session)

    return serialize_session(session, vehicle)


@router.post("/sessions/{session_id}/telemetry/batch")
def create_telemetry_batch(
    session_id: str,
    payload: TelemetryBatchCreate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session, _ = get_accessible_session(
        db,
        user.id,
        session_id,
    )

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

    return {
        "uploaded": len(payload.points),
    }