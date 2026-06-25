from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import DrivingSession
from app.models.telemetry import TelemetryPoint
from app.models.user import User
from app.models.vehicle import GarageVehicle, Vehicle
from app.routes.auth import get_clerk_user_id
from app.schemas.telemetry import TelemetryPointCreate, TelemetryPointResponse

router = APIRouter(tags=["Telemetry"])


def get_db_user(db: Session, clerk_id: str) -> User:
    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not synced")

    return user


def get_owned_session(
    db: Session,
    user_id: str,
    session_id: str,
) -> DrivingSession:
    session = (
        db.query(DrivingSession)
        .join(Vehicle, DrivingSession.vehicle_id == Vehicle.id)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            DrivingSession.id == session_id,
            GarageVehicle.user_id == user_id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.get(
    "/sessions/{session_id}/telemetry",
    response_model=list[TelemetryPointResponse],
)
def get_session_telemetry(
    session_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)
    get_owned_session(db, user.id, session_id)

    points = (
        db.query(TelemetryPoint)
        .filter(TelemetryPoint.session_id == session_id)
        .order_by(TelemetryPoint.timestamp.asc())
        .all()
    )

    return points


@router.post(
    "/sessions/{session_id}/telemetry",
    response_model=TelemetryPointResponse,
)
def create_telemetry_point(
    session_id: str,
    data: TelemetryPointCreate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)
    get_owned_session(db, user.id, session_id)

    point = TelemetryPoint(
        session_id=session_id,
        timestamp=data.timestamp or datetime.now(timezone.utc),
        rpm=data.rpm,
        speed_mph=data.speed_mph,
        throttle_percent=data.throttle_percent,
        coolant_temp_f=data.coolant_temp_f,
        intake_temp_f=data.intake_temp_f,
        boost_psi=data.boost_psi,
        fuel_level_percent=data.fuel_level_percent,
        battery_voltage=data.battery_voltage,
    )

    db.add(point)
    db.commit()
    db.refresh(point)

    return point