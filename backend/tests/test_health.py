from fastapi.testclient import TestClient


def test_root_returns_running_message(
    unauthenticated_client: TestClient,
) -> None:
    response = unauthenticated_client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Vehicle Telemetry API running",
    }