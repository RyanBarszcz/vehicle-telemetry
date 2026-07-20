import csv
import io
import json

from io import BytesIO
from urllib.parse import quote

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.session import DrivingSession
from app.models.user import User
from app.models.vehicle import GarageVehicle, Vehicle
from app.core.auth import get_clerk_user_id
from app.services.s3_service import (
    download_session_csv_from_s3,
    upload_session_csv as upload_csv_to_s3,
)

router = APIRouter(tags=["Session Files"])

def parse_optional_float(value: str | None) -> float | None:
    if value is None:
        return None

    value = value.strip()

    if not value:
        return None

    return float(value)

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

@router.get("/sessions/{session_id}/telemetry-csv")
def get_session_csv_telemetry(
    session_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    user = get_db_user(db, clerk_user_id)

    session = get_owned_session(
        db,
        user.id,
        session_id,
    )

    if not session.csv_s3_key:
        raise HTTPException(
            status_code=404,
            detail="No telemetry CSV was found for this session",
        )

    try:
        csv_bytes = download_session_csv_from_s3(
            session.csv_s3_key
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="Failed to download CSV from storage",
        ) from error

    try:
        csv_text = csv_bytes.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(csv_text))

        points = []

        for index, row in enumerate(reader):
            points.append(
                {
                    "id": f"csv-{session_id}-{index}",
                    "sessionId": session_id,
                    "timestamp": row.get("timestamp"),
                    "speed_mph": parse_optional_float(
                        row.get("speed_mph")
                    ),
                    "rpm": parse_optional_float(
                        row.get("rpm")
                    ),
                    "throttle_percent": parse_optional_float(
                        row.get("throttle_percent")
                    ),
                    "coolant_temp_f": parse_optional_float(
                        row.get("coolant_temp_f")
                    ),
                    "boost_psi": parse_optional_float(
                        row.get("boost_psi")
                    ),
                    "intake_temp_f": parse_optional_float(
                        row.get("intake_temp_f")
                    ),
                    "fuel_level_percent": parse_optional_float(
                        row.get("fuel_level_percent")
                    ),
                    "battery_voltage": parse_optional_float(
                        row.get("battery_voltage")
                    ),
                }
            )

        return points

    except (UnicodeDecodeError, csv.Error, ValueError) as error:
        raise HTTPException(
            status_code=422,
            detail="The telemetry CSV could not be parsed",
        ) from error
    
@router.post("/sessions/{session_id}/upload-csv")
async def upload_session_csv_route(
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

    manifest_bytes = await manifest_file.read()

    try:
        manifest = json.loads(manifest_bytes.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid manifest JSON")

    upload_result = await upload_csv_to_s3(
        session_id=session_id,
        csv_file=csv_file,
    )

    session.selected_metrics = manifest.get("selected_metrics")
    session.sample_count = manifest.get("sample_count")
    session.duration_seconds = manifest.get(
        "duration_seconds",
        session.duration_seconds,
    )

    session.csv_file_name = upload_result["file_name"]
    session.csv_s3_key = upload_result["s3_key"]
    session.csv_s3_url = upload_result["s3_key"]
    session.csv_file_size_bytes = upload_result["file_size_bytes"]

    db.commit()
    db.refresh(session)

    return {
        "message": "CSV uploaded to S3",
        "session_id": session.id,
        "csv_file_name": session.csv_file_name,
        "csv_s3_key": session.csv_s3_key,
        "csv_file_size_bytes": session.csv_file_size_bytes,
        "sample_count": session.sample_count,
    }

@router.get("/sessions/{session_id}/download-csv")
def download_session_csv(
    session_id: str,
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(
        get_clerk_user_id
    ),
):
    user = get_db_user(
        db,
        clerk_user_id,
    )

    session = get_owned_session(
        db,
        user.id,
        session_id,
    )

    if not session.csv_s3_key:
        raise HTTPException(
            status_code=404,
            detail="Session CSV not found",
        )

    try:
        csv_bytes = (
            download_session_csv_from_s3(
                session.csv_s3_key
            )
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="Failed to download CSV from storage",
        ) from error

    filename = (
        session.csv_file_name
        or f"session-{session.id}.csv"
    )

    encoded_filename = quote(filename)

    return StreamingResponse(
        BytesIO(csv_bytes),
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename*=UTF-8''{encoded_filename}"
            ),
            "Content-Length": str(
                len(csv_bytes)
            ),
        },
    )