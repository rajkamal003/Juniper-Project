# tests/backend/test_analytics_reports.py
import pytest
import os
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import Depends
from fastapi.security import HTTPBearer
from app.database import Base, get_db
from app.models.models import (
    Role, User, SystemSetting, DeviceInventory, NetworkInterface, VlanInventory,
    SecurityPolicy, UserSession, SecurityAlert, SecurityRecommendation, GeneratedReport,
    VisitorRequest
)
from app.main import app

TEST_DB_FILE = "./test_ar.db"
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
        Role(id=2, role_name="Faculty", description="Faculty"),
        Role(id=3, role_name="Student", description="Student"),
        Role(id=4, role_name="Parent Visitor", description="Parent"),
        Role(id=5, role_name="Guest", description="Guest"),
    ]
    session.add_all(roles)
    
    # Seed default settings
    settings = SystemSetting(
        id=1,
        account_approval_mode="AUTO",
        theme="dark",
        exam_mode=False
    )
    session.add(settings)
    
    # Seed users
    admin = User(
        id=1, fullname="Admin User", email="admin@securecampus.com", phone="+919999999999",
        password_hash="fake_hash", role_id=1, account_status="Active"
    )
    student = User(
        id=2, fullname="Student User", email="student@securecampus.com", phone="+918888888888",
        password_hash="fake_hash", role_id=3, account_status="Active"
    )
    session.add_all([admin, student])
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
        if "student" in token:
            user = db.query(User).filter(User.role_id == 3).first()
        else:
            user = db.query(User).filter(User.role_id == 1).first()
        return user, "session_mock_id"
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


# --- Heuristic Scan Tests ---

def test_heuristic_scan_trigger(client, db):
    # Setup some test anomalies
    # 1. Offline device
    dev = DeviceInventory(
        hostname="CoreFirewall",
        model="SRX300",
        device_type="Firewall",
        status="Offline"
    )
    db.add(dev)
    
    # 2. Duplicate MAC address
    i1 = NetworkInterface(
        device_id=1,
        interface_name="ge-0/0/0",
        mac_address="00:11:22:33:44:55",
        status="Up"
    )
    i2 = NetworkInterface(
        device_id=2,
        interface_name="ge-0/0/1",
        mac_address="00:11:22:33:44:55",
        status="Up"
    )
    db.add_all([i1, i2])
    db.commit()

    # Trigger scan
    headers = {"Authorization": "Bearer admin"}
    response = client.post("/api/analytics/scan", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["status"] == "Scan Completed"
    assert data["alerts_created"] > 0

    # Verify alerts table
    alerts = db.query(SecurityAlert).all()
    assert len(alerts) > 0
    
    # Verify recommendations table
    recs = db.query(SecurityRecommendation).all()
    assert len(recs) > 0

def test_dashboard_metrics(client, db):
    headers = {"Authorization": "Bearer admin"}
    response = client.get("/api/analytics/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "campus_security_score" in data
    assert "device_risk_scores" in data

def test_alerts_status_flow(client, db):
    alert = SecurityAlert(
        alert_type="HIGH_METRICS",
        severity="High",
        title="High CPU Load",
        status="Active"
    )
    db.add(alert)
    db.commit()

    headers = {"Authorization": "Bearer admin"}
    # Acknowledge
    response = client.put(f"/api/analytics/alerts/{alert.id}", json={"status": "Acknowledged"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Acknowledged"

    # Resolve
    response = client.put(f"/api/analytics/alerts/{alert.id}", json={"status": "Resolved"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Resolved"

def test_recommendation_status_flow(client, db):
    alert = SecurityAlert(
        alert_type="HIGH_METRICS",
        severity="High",
        title="High CPU Load",
        status="Active"
    )
    db.add(alert)
    db.commit()
    
    rec = SecurityRecommendation(
        alert_id=alert.id,
        recommendation="Verify ports",
        priority="High",
        status="Pending"
    )
    db.add(rec)
    db.commit()

    headers = {"Authorization": "Bearer admin"}
    response = client.put(f"/api/analytics/recommendations/{rec.id}", json={"status": "Implemented"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "Implemented"

def test_report_compilation_and_download(client, db):
    headers = {"Authorization": "Bearer admin"}
    
    # Generate CSV Report
    response = client.post("/api/reports/generate", json={
        "report_name": "CSV Test Audit",
        "report_type": "Security Summary",
        "file_format": "CSV"
    }, headers=headers)
    assert response.status_code == 201
    report_id = response.json()["data"]["id"]
    file_name = response.json()["data"]["file_name"]

    # Download Report
    download_resp = client.get(f"/api/reports/download/{report_id}", headers=headers)
    assert download_resp.status_code == 200
    assert "Security Summary Report" in download_resp.text

def test_rbac_restrictions(client):
    # Non-admin student attempts trigger scan
    headers = {"Authorization": "Bearer student"}
    response = client.post("/api/analytics/scan", headers=headers)
    assert response.status_code == 403
