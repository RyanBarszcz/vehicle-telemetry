import json
from unittest.mock import AsyncMock, Mock

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.routes import session_files

from app.models.session import DrivingSession


SAMPLE_CSV = (
    "timestamp,speed_mph,rpm,throttle_percent,"
    "coolant_temp_f,boost_psi,intake_temp_f,"
    "fuel_level_percent,battery_voltage\n"
    "2026-07-29T12:00:00Z,35.5,2200,24.5,"
    "190.0,3.2,82.0,76.0,14.1\n"
    "2026-07-29T12:00:01Z,42.0,2800,38.0,"
    "192.0,6.7,84.0,,14.2\n"
).encode("utf-8")


SAMPLE_MANIFEST = {
    "selected_metrics": [
        "speed_mph",
        "rpm",
        "throttle_percent",
        "coolant_temp_f",
        "boost_psi",
        "intake_temp_f",
        "fuel_level_percent",
        "battery_voltage",
    ],
    "sample_count": 2,
    "duration_seconds": 1,
}


def test_upload_session_csv_saves_file_metadata(
    authenticated_client: TestClient,
    db_session: Session,
    test_session: DrivingSession,
    monkeypatch,
) -> None:
    mock_upload = AsyncMock(
        return_value={
            "file_name": "test-drive.csv",
            "s3_key": (
                f"sessions/{test_session.id}/"
                "test-drive.csv"
            ),
            "file_size_bytes": len(SAMPLE_CSV),
        }
    )

    monkeypatch.setattr(
        "app.routes.session_files.upload_csv_to_s3",
        mock_upload,
    )

    monkeypatch.setattr(
        session_files,
        "send_session_uploaded_event",
        lambda session_id, s3_key: None,
    )

    response = authenticated_client.post(
        f"/sessions/{test_session.id}/upload-csv",
        files={
            "csv_file": (
                "test-drive.csv",
                SAMPLE_CSV,
                "text/csv",
            ),
            "manifest_file": (
                "manifest.json",
                json.dumps(SAMPLE_MANIFEST).encode("utf-8"),
                "application/json",
            ),
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["message"] == "CSV uploaded to S3"
    assert body["session_id"] == test_session.id
    assert body["csv_file_name"] == "test-drive.csv"
    assert body["csv_s3_key"] == (
        f"sessions/{test_session.id}/test-drive.csv"
    )
    assert body["csv_file_size_bytes"] == len(SAMPLE_CSV)
    assert body["sample_count"] == 2

    mock_upload.assert_awaited_once()

    db_session.expire_all()

    saved_session = db_session.get(
        DrivingSession,
        test_session.id,
    )

    assert saved_session is not None
    assert saved_session.csv_file_name == "test-drive.csv"
    assert saved_session.csv_s3_key == (
        f"sessions/{test_session.id}/test-drive.csv"
    )
    assert saved_session.csv_file_size_bytes == len(SAMPLE_CSV)
    assert saved_session.sample_count == 2
    assert saved_session.duration_seconds == 1
    assert saved_session.selected_metrics == (
        SAMPLE_MANIFEST["selected_metrics"]
    )


def test_upload_rejects_non_csv_file(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.post(
        f"/sessions/{test_session.id}/upload-csv",
        files={
            "csv_file": (
                "telemetry.txt",
                SAMPLE_CSV,
                "text/plain",
            ),
            "manifest_file": (
                "manifest.json",
                json.dumps(SAMPLE_MANIFEST),
                "application/json",
            ),
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "CSV file is required"
    )


def test_upload_rejects_non_json_manifest(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.post(
        f"/sessions/{test_session.id}/upload-csv",
        files={
            "csv_file": (
                "telemetry.csv",
                SAMPLE_CSV,
                "text/csv",
            ),
            "manifest_file": (
                "manifest.txt",
                json.dumps(SAMPLE_MANIFEST),
                "text/plain",
            ),
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Manifest JSON file is required"
    )


def test_upload_rejects_invalid_manifest_json(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.post(
        f"/sessions/{test_session.id}/upload-csv",
        files={
            "csv_file": (
                "telemetry.csv",
                SAMPLE_CSV,
                "text/csv",
            ),
            "manifest_file": (
                "manifest.json",
                b"{not-valid-json}",
                "application/json",
            ),
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Invalid manifest JSON"
    )


def test_download_session_csv_returns_file(
    authenticated_client: TestClient,
    db_session: Session,
    test_session: DrivingSession,
    monkeypatch,
) -> None:
    test_session.csv_file_name = "completed-drive.csv"
    test_session.csv_s3_key = (
        f"sessions/{test_session.id}/completed-drive.csv"
    )
    db_session.commit()

    mock_download = Mock(return_value=SAMPLE_CSV)

    monkeypatch.setattr(
        "app.routes.session_files."
        "download_session_csv_from_s3",
        mock_download,
    )

    response = authenticated_client.get(
        f"/sessions/{test_session.id}/download-csv",
    )

    assert response.status_code == 200
    assert response.content == SAMPLE_CSV
    assert response.headers["content-type"].startswith(
        "text/csv"
    )
    assert "completed-drive.csv" in (
        response.headers["content-disposition"]
    )
    assert response.headers["content-length"] == str(
        len(SAMPLE_CSV)
    )

    mock_download.assert_called_once_with(
        test_session.csv_s3_key
    )


def test_download_returns_404_when_session_has_no_csv(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.get(
        f"/sessions/{test_session.id}/download-csv",
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Session CSV not found"
    )


def test_download_returns_502_when_storage_fails(
    authenticated_client: TestClient,
    db_session: Session,
    test_session: DrivingSession,
    monkeypatch,
) -> None:
    test_session.csv_file_name = "failed-drive.csv"
    test_session.csv_s3_key = (
        f"sessions/{test_session.id}/failed-drive.csv"
    )
    db_session.commit()

    mock_download = Mock(
        side_effect=RuntimeError("S3 unavailable")
    )

    monkeypatch.setattr(
        "app.routes.session_files."
        "download_session_csv_from_s3",
        mock_download,
    )

    response = authenticated_client.get(
        f"/sessions/{test_session.id}/download-csv",
    )

    assert response.status_code == 502
    assert response.json()["detail"] == (
        "Failed to download CSV from storage"
    )


def test_get_csv_telemetry_parses_csv_rows(
    authenticated_client: TestClient,
    db_session: Session,
    test_session: DrivingSession,
    monkeypatch,
) -> None:
    test_session.csv_s3_key = (
        f"sessions/{test_session.id}/telemetry.csv"
    )
    db_session.commit()

    mock_download = Mock(return_value=SAMPLE_CSV)

    monkeypatch.setattr(
        "app.routes.session_files."
        "download_session_csv_from_s3",
        mock_download,
    )

    response = authenticated_client.get(
        f"/sessions/{test_session.id}/telemetry-csv",
    )

    assert response.status_code == 200

    points = response.json()

    assert len(points) == 2

    assert points[0] == {
        "id": f"csv-{test_session.id}-0",
        "sessionId": test_session.id,
        "timestamp": "2026-07-29T12:00:00Z",
        "speed_mph": 35.5,
        "rpm": 2200.0,
        "throttle_percent": 24.5,
        "coolant_temp_f": 190.0,
        "boost_psi": 3.2,
        "intake_temp_f": 82.0,
        "fuel_level_percent": 76.0,
        "battery_voltage": 14.1,
    }

    assert points[1]["speed_mph"] == 42.0
    assert points[1]["rpm"] == 2800.0
    assert points[1]["boost_psi"] == 6.7
    assert points[1]["fuel_level_percent"] is None


def test_get_csv_telemetry_returns_404_without_file(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.get(
        f"/sessions/{test_session.id}/telemetry-csv",
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "No telemetry CSV was found for this session"
    )


def test_get_csv_telemetry_returns_422_for_invalid_values(
    authenticated_client: TestClient,
    db_session: Session,
    test_session: DrivingSession,
    monkeypatch,
) -> None:
    test_session.csv_s3_key = (
        f"sessions/{test_session.id}/invalid.csv"
    )
    db_session.commit()

    invalid_csv = (
        "timestamp,speed_mph,rpm\n"
        "2026-07-29T12:00:00Z,not-a-number,2200\n"
    ).encode("utf-8")

    monkeypatch.setattr(
        "app.routes.session_files."
        "download_session_csv_from_s3",
        Mock(return_value=invalid_csv),
    )

    response = authenticated_client.get(
        f"/sessions/{test_session.id}/telemetry-csv",
    )

    assert response.status_code == 422
    assert response.json()["detail"] == (
        "The telemetry CSV could not be parsed"
    )