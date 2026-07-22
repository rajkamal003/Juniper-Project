# tests/backend/test_auth.py
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.models.models import Role, Permission, SystemSetting, User, PasswordReset, UserSession
from app.main import app

# isolated SQLite file-based database for testing
TEST_DB_FILE = "./test.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    # Remove stale test db if any
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

    # Create tables
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # Seed base tables
    roles = [
        Role(id=1, role_name="Super Admin", description="Super Admin"),
        Role(id=2, role_name="Faculty", description="Faculty"),
        Role(id=3, role_name="Student", description="Student"),
        Role(id=4, role_name="Parent Visitor", description="Parent Visitor"),
        Role(id=5, role_name="Guest", description="Guest"),
    ]
    session.add_all(roles)
    
    settings = SystemSetting(
        id=1,
        account_approval_mode="AUTO",
        theme="dark",
        maintenance_mode=False,
        allow_guest_registration=True,
        exam_mode=False,
        otp_expiry=300,
        session_timeout=900
    )
    session.add(settings)
    session.commit()
    
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        # Clean up database file
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
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_register_student_success(client):
    payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3, # Student
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2" # 2nd Year
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["email"] == "student@securecampus.com"
    assert response.json()["account_status"] == "Active"

def test_register_missing_fields_by_role(client):
    # Registering Faculty (role_id=2) without employee_id
    payload = {
        "fullname": "Faculty User",
        "email": "faculty@securecampus.com",
        "phone": "+919988776655",
        "role_id": 2,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "department": "ECE"
        # missing employee_id
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422 # Pydantic model validation failure

def test_register_password_strength_check(client):
    payload = {
        "fullname": "Weak User",
        "email": "weak@securecampus.com",
        "phone": "+919988776655",
        "role_id": 5, # Guest
        "password": "weak", # No capital, no number, no special, < 8 chars
        "confirm_password": "weak",
        "purpose": "Seminar Attendee",
        "duration": "4 Hours"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422

def test_register_duplicate_email(client):
    payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    response1 = client.post("/api/auth/register", json=payload)
    assert response1.status_code == 201
    
    response2 = client.post("/api/auth/register", json=payload)
    assert response2.status_code == 400
    assert "already registered" in response2.json()["detail"]

def test_login_success(client):
    # First register user
    register_payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    client.post("/api/auth/register", json=register_payload)

    # Attempt login
    login_payload = {
        "email": "student@securecampus.com",
        "password": "Password123!"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()
    assert response.json()["user"]["email"] == "student@securecampus.com"

def test_login_locked_after_failed_attempts(client):
    register_payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    client.post("/api/auth/register", json=register_payload)

    # Trigger 5 failed login attempts
    login_payload = {
        "email": "student@securecampus.com",
        "password": "WrongPassword123!"
    }
    
    for _ in range(5):
        response = client.post("/api/auth/login", json=login_payload)
        assert response.status_code == 401
    
    # 6th attempt should return 403 Forbidden due to lockout
    response_locked = client.post("/api/auth/login", json=login_payload)
    assert response_locked.status_code == 403
    assert "locked" in response_locked.json()["detail"].lower()

def test_forgot_password_otp_cooldown(client):
    register_payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    client.post("/api/auth/register", json=register_payload)

    # 1st OTP Request
    resp1 = client.post("/api/auth/forgot-password", json={"email": "student@securecampus.com"})
    assert resp1.status_code == 200

    # Immediate 2nd OTP Request (should hit rate limit cooldown of 60s)
    resp2 = client.post("/api/auth/forgot-password", json={"email": "student@securecampus.com"})
    assert resp2.status_code == 429
    assert "wait 60 seconds" in resp2.json()["detail"]

def test_verify_otp_max_attempts(client, db):
    register_payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    client.post("/api/auth/register", json=register_payload)
    client.post("/api/auth/forgot-password", json={"email": "student@securecampus.com"})

    # 1st attempt: Invalid OTP
    resp1 = client.post("/api/auth/verify-otp", json={
        "email": "student@securecampus.com",
        "otp": "000000"
    })
    assert resp1.status_code == 400
    assert "invalid otp" in resp1.json()["detail"].lower()

    # 2nd attempt: Invalid OTP
    resp2 = client.post("/api/auth/verify-otp", json={
        "email": "student@securecampus.com",
        "otp": "000000"
    })
    assert resp2.status_code == 400
    assert "invalid otp" in resp2.json()["detail"].lower()

    # 3rd attempt: Max attempts exceeded
    resp3 = client.post("/api/auth/verify-otp", json={
        "email": "student@securecampus.com",
        "otp": "000000"
    })
    assert resp3.status_code == 400
    assert "maximum otp attempts exceeded" in resp3.json()["detail"].lower()

def test_password_reset_flow_success(client, db):
    # 1. Register User
    register_payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    client.post("/api/auth/register", json=register_payload)

    # 2. Request OTP
    resp_forgot = client.post("/api/auth/forgot-password", json={"email": "student@securecampus.com"})
    assert resp_forgot.status_code == 200
    otp_code = resp_forgot.json()["debug_otp"]
    assert otp_code is not None

    # 3. Verify OTP
    resp_verify = client.post("/api/auth/verify-otp", json={
        "email": "student@securecampus.com",
        "otp": otp_code
    })
    assert resp_verify.status_code == 200
    reset_token = resp_verify.json()["reset_token"]
    assert reset_token is not None

    # 4. Reset Password
    resp_reset = client.post("/api/auth/reset-password", json={
        "email": "student@securecampus.com",
        "reset_token": reset_token,
        "new_password": "NewSecurePassword123!",
        "confirm_password": "NewSecurePassword123!"
    })
    assert resp_reset.status_code == 200

    # 5. Login with new password
    resp_login = client.post("/api/auth/login", json={
        "email": "student@securecampus.com",
        "password": "NewSecurePassword123!"
    })
    assert resp_login.status_code == 200
    assert "access_token" in resp_login.json()

def test_remember_me_functionality(client, db):
    # 1. Register User
    register_payload = {
        "fullname": "Student User",
        "email": "student@securecampus.com",
        "phone": "+919988776655",
        "role_id": 3,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "roll_number": "22CSE1042",
        "department": "CSE",
        "duration": "2"
    }
    client.post("/api/auth/register", json=register_payload)

    # 2. Login with Remember Me = True
    resp_remember = client.post("/api/auth/login", json={
        "email": "student@securecampus.com",
        "password": "Password123!",
        "remember_me": True
    })
    assert resp_remember.status_code == 200
    data_remember = resp_remember.json()
    assert "access_token" in data_remember
    assert "refresh_token" in data_remember
    
    # Verify claims inside access/refresh token
    from app.utils.auth_utils import decode_access_token, decode_refresh_token
    access_payload = decode_access_token(data_remember["access_token"])
    refresh_payload = decode_refresh_token(data_remember["refresh_token"])
    assert access_payload.get("remember_me") is True
    assert refresh_payload.get("remember_me") is True

    # 3. Login with Remember Me = False
    resp_no_remember = client.post("/api/auth/login", json={
        "email": "student@securecampus.com",
        "password": "Password123!",
        "remember_me": False
    })
    assert resp_no_remember.status_code == 200
    data_no_remember = resp_no_remember.json()
    access_payload_no = decode_access_token(data_no_remember["access_token"])
    refresh_payload_no = decode_refresh_token(data_no_remember["refresh_token"])
    assert access_payload_no.get("remember_me") is False
    assert refresh_payload_no.get("remember_me") is False

    # 4. Refresh token rotation test for Remember Me = True
    resp_refresh_remember = client.post("/api/auth/refresh", json={
        "refresh_token": data_remember["refresh_token"]
    })
    assert resp_refresh_remember.status_code == 200
    data_ref_rem = resp_refresh_remember.json()
    ref_payload_rem = decode_refresh_token(data_ref_rem["refresh_token"])
    assert ref_payload_rem.get("remember_me") is True

    # 5. Refresh token rotation test for Remember Me = False
    resp_refresh_no_remember = client.post("/api/auth/refresh", json={
        "refresh_token": data_no_remember["refresh_token"]
    })
    assert resp_refresh_no_remember.status_code == 200
    data_ref_no_rem = resp_refresh_no_remember.json()
    ref_payload_no_rem = decode_refresh_token(data_ref_no_rem["refresh_token"])
    assert ref_payload_no_rem.get("remember_me") is False
