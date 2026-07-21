# tests/backend/test_modules.py
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.models.models import Role, User, SystemSetting
from fastapi import Depends
from fastapi.security import HTTPBearer
from app.main import app

TEST_DB_FILE = "./test_m.db"
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

# Helper function to generate auth headers
def get_auth_headers(client, email):
    # Bypass OAuth by manually injecting dependencies if needed, or get token by login
    # For simplicity, we bypass auth_routes dependency decoding or mock JWT:
    # Here, get_current_user in auth_routes checks Authorization: Bearer <token>
    # We can patch get_current_user in app router to bypass JWT and return our db user.
    pass

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


# --- 1. Devices Endpoint Tests ---

def test_create_device_success(client):
    payload = {
        "device_name": "Core-Switch-01",
        "model": "EX2300-C",
        "ip_address": "192.168.10.10",
        "mac_address": "AA-BB-CC-DD-EE-FF",
        "device_type": "Switch",
        "status": "Online"
    }
    response = client.post("/api/devices", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["device_name"] == "Core-Switch-01"

def test_create_device_validation_errors(client):
    # Invalid MAC
    payload = {
        "device_name": "Core-Switch-01",
        "model": "EX2300-C",
        "mac_address": "invalid-mac-format",
        "device_type": "Switch"
    }
    response = client.post("/api/devices", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 422
    
    # Invalid IP
    payload = {
        "device_name": "Core-Switch-01",
        "model": "EX2300-C",
        "ip_address": "999.999.999.999",
        "device_type": "Switch"
    }
    response = client.post("/api/devices", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 422

def test_role_guard_restriction(client):
    # Student tries to create device
    payload = {
        "device_name": "Core-Switch-01",
        "model": "EX2300-C",
        "device_type": "Switch"
    }
    response = client.post("/api/devices", json=payload, headers={"Authorization": "Bearer student"})
    # Student has role_id = 3, require_admin blocks
    assert response.status_code == 403

def test_get_devices_pagination_and_search(client):
    # Create multiple devices
    for i in range(15):
        payload = {
            "device_name": f"Node-Switch-{i}",
            "model": "EX2300-C",
            "device_type": "Switch"
        }
        client.post("/api/devices", json=payload, headers={"Authorization": "Bearer admin"})
        
    # Get page 1
    response = client.get("/api/devices?page=1&limit=10", headers={"Authorization": "Bearer admin"})
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["pages"] == 2

    # Search
    response = client.get("/api/devices?search=Switch-1", headers={"Authorization": "Bearer admin"})
    assert response.status_code == 200
    data = response.json()["data"]
    # Should match Node-Switch-1, Node-Switch-10, Node-Switch-11, etc.
    assert data["total"] > 0

def test_device_soft_delete(client):
    # Create
    payload = {
        "device_name": "Core-Switch-Delete",
        "model": "EX2300-C",
        "device_type": "Switch"
    }
    response = client.post("/api/devices", json=payload, headers={"Authorization": "Bearer admin"})
    device_id = response.json()["data"]["id"]

    # Delete
    del_resp = client.delete(f"/api/devices/{device_id}", headers={"Authorization": "Bearer admin"})
    assert del_resp.status_code == 200

    # Get list - should be empty because of soft delete filter
    list_resp = client.get("/api/devices", headers={"Authorization": "Bearer admin"})
    assert len(list_resp.json()["data"]["items"]) == 0


# --- 2. Network Subnet Tests ---

def test_subnet_crud(client):
    # Create
    payload = {
        "subnet_range": "10.0.0.0/24",
        "vlan_id": 100,
        "gateway": "10.0.0.1",
        "status": "Active"
    }
    response = client.post("/api/network/subnets", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 201
    subnet_id = response.json()["data"]["id"]

    # List
    response = client.get("/api/network/subnets", headers={"Authorization": "Bearer admin"})
    assert response.status_code == 200
    assert len(response.json()["data"]["items"]) == 1

    # Delete
    response = client.delete(f"/api/network/subnets/{subnet_id}", headers={"Authorization": "Bearer admin"})
    assert response.status_code == 200

    # List again
    response = client.get("/api/network/subnets", headers={"Authorization": "Bearer admin"})
    assert len(response.json()["data"]["items"]) == 0

def test_subnet_vlan_out_of_range(client):
    payload = {
        "subnet_range": "10.0.0.0/24",
        "vlan_id": 5000, # Max VLAN is 4094
        "gateway": "10.0.0.1"
    }
    response = client.post("/api/network/subnets", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 422


# --- 3. Security Policy Tests ---

def test_security_policy_crud(client):
    payload = {
        "priority": 10,
        "source_ip": "192.168.1.0/24",
        "destination": "any",
        "protocol": "TCP",
        "policy": "Allow"
    }
    response = client.post("/api/firewall/rules", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 201
    policy_id = response.json()["data"]["id"]

    # List
    response = client.get("/api/firewall/rules", headers={"Authorization": "Bearer admin"})
    assert len(response.json()["data"]["items"]) == 1

    # Delete
    response = client.delete(f"/api/firewall/rules/{policy_id}", headers={"Authorization": "Bearer admin"})
    assert response.status_code == 200

    # List again
    response = client.get("/api/firewall/rules", headers={"Authorization": "Bearer admin"})
    assert len(response.json()["data"]["items"]) == 0


# --- 4. Report Request Tests ---

def test_report_request_crud(client):
    payload = {
        "report_name": "Weekly Threat Analysis Log",
        "report_type": "Threat Logs"
    }
    response = client.post("/api/reports", json=payload, headers={"Authorization": "Bearer admin"})
    assert response.status_code == 201

    # List
    response = client.get("/api/reports", headers={"Authorization": "Bearer admin"})
    assert len(response.json()["data"]["items"]) == 1
