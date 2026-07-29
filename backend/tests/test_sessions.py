from fastapi.testclient import TestClient

from app.models.session import DrivingSession
from app.models.vehicle import Vehicle


def test_create_vehicle_session(
    authenticated_client: TestClient,
    test_vehicle: Vehicle,
) -> None:
    payload = {
        "title": "Morning Drive",
        "selected_metrics": [
            "speed_mph",
            "rpm",
            "boost_psi",
        ],
        "duration_seconds": 0,
        "distance_miles": None,
        "max_speed_mph": 0,
        "avg_speed_mph": None,
        "max_rpm": 0,
    }

    response = authenticated_client.post(
        f"/vehicles/{test_vehicle.id}/sessions",
        json=payload,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["id"]
    assert body["vehicle_id"] == test_vehicle.id
    assert body["vehicle_name"] == "Test GTI"
    assert body["title"] == "Morning Drive"
    assert body["selected_metrics"] == [
        "speed_mph",
        "rpm",
        "boost_psi",
    ]


def test_list_user_sessions(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.get("/sessions")

    assert response.status_code == 200

    body = response.json()

    assert len(body) == 1
    assert body[0]["id"] == test_session.id
    assert body[0]["title"] == "Test Drive"


def test_get_session_by_id(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.get(
        f"/sessions/{test_session.id}",
    )

    assert response.status_code == 200

    body = response.json()

    assert body["id"] == test_session.id
    assert body["vehicle_name"] == "Test GTI"


def test_end_session_updates_summary(
    authenticated_client: TestClient,
    test_session: DrivingSession,
) -> None:
    response = authenticated_client.patch(
        f"/sessions/{test_session.id}/end",
        json={
            "title": "Completed Test Drive",
            "duration_seconds": 600,
            "distance_miles": 8.5,
            "max_speed_mph": 72.4,
            "avg_speed_mph": 43.1,
            "max_rpm": 5100,
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["title"] == "Completed Test Drive"
    assert body["ended_at"] is not None
    assert body["duration_seconds"] == 600
    assert body["distance_miles"] == 8.5
    assert body["max_speed_mph"] == 72.4
    assert body["avg_speed_mph"] == 43.1
    assert body["max_rpm"] == 5100


def test_unknown_session_returns_404(
    authenticated_client: TestClient,
) -> None:
    response = authenticated_client.get(
        "/sessions/nonexistent-session",
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Session not found"


def test_cannot_create_session_for_unknown_vehicle(
    authenticated_client: TestClient,
) -> None:
    response = authenticated_client.post(
        "/vehicles/nonexistent-vehicle/sessions",
        json={
            "title": "Invalid Session",
            "selected_metrics": ["rpm"],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Vehicle not found"