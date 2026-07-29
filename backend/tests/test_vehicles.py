from fastapi.testclient import TestClient

from app.models.vehicle import Vehicle


def test_create_vehicle(
    authenticated_client: TestClient,
) -> None:
    payload = {
        "year": 2017,
        "make": "Volkswagen",
        "model": "GTI",
        "trim": "SE",
        "nickname": "Ryan's GTI",
        "vin": "WVWTEST1234567890",
        "image_url": None,
    }

    response = authenticated_client.post(
        "/vehicles/",
        json=payload,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["id"]
    assert body["year"] == 2017
    assert body["make"] == "Volkswagen"
    assert body["model"] == "GTI"
    assert body["nickname"] == "Ryan's GTI"


def test_get_vehicles_returns_owned_vehicle(
    authenticated_client: TestClient,
    test_vehicle: Vehicle,
) -> None:
    response = authenticated_client.get("/vehicles/")

    assert response.status_code == 200

    body = response.json()

    assert len(body) == 1
    assert body[0]["id"] == test_vehicle.id
    assert body[0]["make"] == "Volkswagen"
    assert body[0]["model"] == "GTI"
    assert body[0]["session_count"] == 0


def test_get_vehicle_by_id(
    authenticated_client: TestClient,
    test_vehicle: Vehicle,
) -> None:
    response = authenticated_client.get(
        f"/vehicles/{test_vehicle.id}",
    )

    assert response.status_code == 200
    assert response.json()["id"] == test_vehicle.id


def test_get_unknown_vehicle_returns_404(
    authenticated_client: TestClient,
) -> None:
    response = authenticated_client.get(
        "/vehicles/nonexistent-vehicle",
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Vehicle not found"


def test_update_owned_vehicle(
    authenticated_client: TestClient,
    test_vehicle: Vehicle,
) -> None:
    response = authenticated_client.patch(
        f"/vehicles/{test_vehicle.id}",
        json={
            "nickname": "Updated GTI",
            "trim": "Autobahn",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["nickname"] == "Updated GTI"
    assert body["trim"] == "Autobahn"


def test_delete_owned_vehicle(
    authenticated_client: TestClient,
    test_vehicle: Vehicle,
) -> None:
    response = authenticated_client.delete(
        f"/vehicles/{test_vehicle.id}",
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "Vehicle deleted",
    }

    get_response = authenticated_client.get(
        f"/vehicles/{test_vehicle.id}",
    )

    assert get_response.status_code == 404