from fastapi.testclient import TestClient


def test_protected_route_rejects_missing_token(
    unauthenticated_client: TestClient,
) -> None:
    response = unauthenticated_client.get("/vehicles/")

    # FastAPI's HTTPBearer dependency currently returns 401 when the
    # Authorization header is completely absent.
    assert response.status_code == 401


def test_authenticated_user_can_access_protected_route(
    authenticated_client: TestClient,
) -> None:
    response = authenticated_client.get("/vehicles/")

    assert response.status_code == 200
    assert response.json() == []