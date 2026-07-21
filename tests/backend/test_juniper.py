# tests/backend/test_juniper.py
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import Depends
from fastapi.security import HTTPBearer
from app.database import Base, get_db
from app.models.models import Role, User, SystemSetting
from app.main import app

TEST_DB_FILE = "./test_j.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    try:
        Base.metadata.drop_all(bind=engine)
    except Exception:
        pass
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # Seed roles
    roles = [
        Role(id=1, role_name="Super Admin", description="Super Admin"),
        Role(id=3, role_name="Student", description="Student"),
    ]
    session.add_all(roles)
    
    # Seed system settings
    settings = SystemSetting(
        id=1,
        account_approval_mode="AUTO",
        theme="dark",
        exam_mode=False
    )
    session.add(settings)
    
    # Seed Admin User
    admin = User(
        id=1,
        fullname="Admin User",
        email="admin@securecampus.com",
        phone="+919999999999",
        password_hash="fake_hash",
        role_id=1,
        account_status="Active"
    )
    session.add(admin)

    # Seed Student User
    student = User(
        id=2,
        fullname="Student User",
        email="student@securecampus.com",
        phone="+918888888888",
        password_hash="fake_hash",
        role_id=3,
        account_status="Active"
    )
    session.add(student)
    
    session.commit()
    
    yield session
    
    session.close()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(autouse=True)
def bypass_jwt(db):
    from app.routes.auth_routes import get_current_user
    security = HTTPBearer()
    def override_get_current_user(credentials = Depends(security)):
        token = credentials.credentials if credentials else ""
        if token and "student" in token:
            user = db.query(User).filter(User.id == 2).first()
        else:
            user = db.query(User).filter(User.id == 1).first()
        return user, "session_mock_id"
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)

# --- Juniper Integration Tests ---

def test_juniper_sync_inventory(client):
    response = client.post("/api/juniper/sync", headers={"Authorization": "Bearer admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # SRX300, EX2300-C, AP32, AP63
    assert len(data["data"]) == 4
    models = [d["model"] for d in data["data"]]
    assert "SRX300" in models
    assert "EX2300-C" in models
    assert "AP32" in models
    assert "AP63" in models

def test_juniper_sync_interfaces_vlans_aps(client):
    # Sync interfaces
    resp_if = client.post("/api/juniper/sync/interfaces", headers={"Authorization": "Bearer admin"})
    assert resp_if.status_code == 200
    assert len(resp_if.json()["data"]) > 0

    # Sync VLANs
    resp_vlan = client.post("/api/juniper/sync/vlans", headers={"Authorization": "Bearer admin"})
    assert resp_vlan.status_code == 200
    assert len(resp_vlan.json()["data"]) > 0

    # Sync APs
    resp_aps = client.post("/api/juniper/sync/aps", headers={"Authorization": "Bearer admin"})
    assert resp_aps.status_code == 200
    assert len(resp_aps.json()["data"]) == 2

def test_juniper_query_endpoints(client):
    # Query Inventory (will auto-sync if empty)
    resp_inv = client.get("/api/juniper/inventory", headers={"Authorization": "Bearer admin"})
    assert resp_inv.status_code == 200
    assert len(resp_inv.json()["data"]) == 4

    # Query Interfaces
    resp_if = client.get("/api/juniper/interfaces", headers={"Authorization": "Bearer admin"})
    assert resp_if.status_code == 200

    # Query VLANs
    resp_vlan = client.get("/api/juniper/vlans", headers={"Authorization": "Bearer admin"})
    assert resp_vlan.status_code == 200

    # Query APs
    resp_aps = client.get("/api/juniper/aps", headers={"Authorization": "Bearer admin"})
    assert resp_aps.status_code == 200

    # Query Health
    resp_health = client.get("/api/juniper/health", headers={"Authorization": "Bearer admin"})
    assert resp_health.status_code == 200

    # Query Logs
    resp_logs = client.get("/api/juniper/logs", headers={"Authorization": "Bearer admin"})
    assert resp_logs.status_code == 200
    assert len(resp_logs.json()["data"]) > 0

def test_juniper_student_blocked(client):
    resp = client.post("/api/juniper/sync", headers={"Authorization": "Bearer student"})
    assert resp.status_code == 403
