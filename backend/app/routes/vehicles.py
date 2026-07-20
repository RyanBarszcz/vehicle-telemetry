from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.session import DrivingSession

from app.database import get_db
from app.models.user import User
from app.models.vehicle import GarageVehicle, Vehicle
from app.core.auth import get_clerk_user_id
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


def get_db_user(db: Session, clerk_id: str) -> User:
    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not synced")

    return user


@router.get("/", response_model=list[VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    rows = (
        db.query(
            Vehicle,
            func.count(DrivingSession.id).label("session_count"),
            func.max(DrivingSession.started_at).label("last_session_at"),
            func.max(DrivingSession.max_rpm).label("max_rpm"),
            func.max(DrivingSession.max_speed_mph).label("max_speed_mph"),
            func.coalesce(func.sum(DrivingSession.distance_miles), 0).label(
                "total_distance_miles"
            ),
        )
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .outerjoin(DrivingSession, DrivingSession.vehicle_id == Vehicle.id)
        .filter(GarageVehicle.user_id == user.id)
        .group_by(Vehicle.id)
        .all()
    )

    return [
        {
            **vehicle.__dict__,
            "session_count": session_count,
            "last_session_at": last_session_at,
            "max_rpm": max_rpm,
            "max_speed_mph": max_speed_mph,
            "total_distance_miles": total_distance_miles,
        }
        for (
            vehicle,
            session_count,
            last_session_at,
            max_rpm,
            max_speed_mph,
            total_distance_miles,
        ) in rows
    ]

@router.post("/", response_model=VehicleResponse)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    vehicle = Vehicle(
        year=data.year,
        make=data.make,
        model=data.model,
        trim=data.trim,
        nickname=data.nickname,
        vin=data.vin,
        image_url=data.image_url,
    )

    db.add(vehicle)
    db.flush()

    garage_vehicle = GarageVehicle(
        user_id=user.id,
        vehicle_id=vehicle.id,
        role="OWNER",
    )

    db.add(garage_vehicle)
    db.commit()
    db.refresh(vehicle)

    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    vehicle = (
        db.query(Vehicle)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            Vehicle.id == vehicle_id,
            GarageVehicle.user_id == user.id,
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    vehicle = (
        db.query(Vehicle)
        .join(GarageVehicle, GarageVehicle.vehicle_id == Vehicle.id)
        .filter(
            Vehicle.id == vehicle_id,
            GarageVehicle.user_id == user.id,
            GarageVehicle.role.in_(["OWNER", "EDITOR"]),
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(vehicle, key, value)

    db.commit()
    db.refresh(vehicle)

    return vehicle


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    garage_vehicle = (
        db.query(GarageVehicle)
        .filter(
            GarageVehicle.vehicle_id == vehicle_id,
            GarageVehicle.user_id == user.id,
            GarageVehicle.role == "OWNER",
        )
        .first()
    )

    if not garage_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db.delete(vehicle)
    db.commit()

    return {"message": "Vehicle deleted"}