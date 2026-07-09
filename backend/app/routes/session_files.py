import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import DrivingSession
from app.models.user import User
from app.models.vehicle import GarageVehicle, Vehicle
from app.routes.auth import get_clerk_user_id

router = APIRouter(tags=["Session Files"])

UPLOAD_DIR = Path("uploads/session_csvs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_db_user(db: Session, clerk_id: str) -> User:
    user = db.query(User).filter(User.clerk_id == clerk_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not synced")

    return user


def get_owned_session(db: Session, user_id: str, session_id: str) -> DrivingSession:
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


@router.post("/sessions/{session_id}/upload-csv")
async def upload_session_csv(
    session_id: str,
    csv_file: UploadFile = File(...),
    manifest_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)
    session = get_owned_session(db, user.id, session_id)

    if not csv_file.filename or not csv_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file is required")

    if not manifest_file.filename or not manifest_file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Manifest JSON file is required")

    session_dir = UPLOAD_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    csv_path = session_dir / csv_file.filename
    manifest_path = session_dir / manifest_file.filename

    csv_bytes = await csv_file.read()
    manifest_bytes = await manifest_file.read()

    csv_path.write_bytes(csv_bytes)
    manifest_path.write_bytes(manifest_bytes)

    try:
        manifest = json.loads(manifest_bytes.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid manifest JSON")

    session.selected_metrics = manifest.get("selected_metrics")
    session.sample_count = manifest.get("sample_count")
    session.duration_seconds = manifest.get("duration_seconds", session.duration_seconds)

    session.csv_file_name = csv_file.filename
    session.csv_s3_key = str(csv_path)
    session.csv_s3_url = str(csv_path)
    session.csv_file_size_bytes = len(csv_bytes)

    db.commit()
    db.refresh(session)

    return {
        "message": "CSV uploaded",
        "session_id": session.id,
        "csv_file_name": session.csv_file_name,
        "csv_file_size_bytes": session.csv_file_size_bytes,
        "sample_count": session.sample_count,
    }