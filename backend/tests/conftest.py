import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Supply harmless values before importing the application.
# This allows Settings() to initialize during tests without requiring
# production credentials or a real .env file.
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("CLERK_SECRET_KEY", "test-clerk-secret")
os.environ.setdefault("CLERK_JWKS_URL", "https://example.com/.well-known/jwks.json")
os.environ.setdefault("CLERK_ISSUER", "https://example.com")

from app.core.auth import get_clerk_user_id
from app.database import Base, get_db
from app.main import app

# Import all model modules so SQLAlchemy registers every table with Base.
from app.models import DrivingSession, GarageVehicle, User, Vehicle
from app.models.telemetry import TelemetryPoint


TEST_CLERK_USER_ID = "user_test_driveiq"

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    """
    Create a clean database before every test and remove it afterward.

    Tests cannot leak records into one another.
    """
    Base.metadata.create_all(bind=test_engine)

    try:
        yield
    finally:
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """
    Provide a database session directly to tests and data fixtures.
    """
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_user(db_session: Session) -> User:
    """
    Create the user represented by the mocked Clerk identity.
    """
    user = User(
        clerk_id=TEST_CLERK_USER_ID,
        first_name="Test",
        last_name="Driver",
        email="test.driver@example.com",
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


@pytest.fixture
def authenticated_client(
    test_user: User,
) -> Generator[TestClient, None, None]:
    """
    Return a TestClient with the database and Clerk identity overridden.
    """

    def override_get_db() -> Generator[Session, None, None]:
        session = TestingSessionLocal()

        try:
            yield session
        finally:
            session.close()

    def override_get_clerk_user_id() -> str:
        return TEST_CLERK_USER_ID

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_clerk_user_id] = override_get_clerk_user_id

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client() -> Generator[TestClient, None, None]:
    """
    Return a client that uses the test database but does not bypass auth.
    """

    def override_get_db() -> Generator[Session, None, None]:
        session = TestingSessionLocal()

        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def test_vehicle(
    db_session: Session,
    test_user: User,
) -> Vehicle:
    """
    Create a vehicle owned by the test user.
    """
    vehicle = Vehicle(
        year=2017,
        make="Volkswagen",
        model="GTI",
        trim="SE",
        nickname="Test GTI",
        vin="TESTVIN123456789",
    )

    db_session.add(vehicle)
    db_session.flush()

    garage_vehicle = GarageVehicle(
        user_id=test_user.id,
        vehicle_id=vehicle.id,
        role="OWNER",
    )

    db_session.add(garage_vehicle)
    db_session.commit()
    db_session.refresh(vehicle)

    return vehicle


@pytest.fixture
def test_session(
    db_session: Session,
    test_vehicle: Vehicle,
) -> DrivingSession:
    """
    Create a driving session belonging to the test vehicle.
    """
    driving_session = DrivingSession(
        vehicle_id=test_vehicle.id,
        title="Test Drive",
        selected_metrics=[
            "speed_mph",
            "rpm",
            "boost_psi",
            "coolant_temp_f",
        ],
        duration_seconds=0,
        max_speed_mph=0,
        max_rpm=0,
    )

    db_session.add(driving_session)
    db_session.commit()
    db_session.refresh(driving_session)

    return driving_session