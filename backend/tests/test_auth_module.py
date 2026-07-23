import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
import pyotp
import re
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.models import Role, SystemSetting

from sqlalchemy.pool import StaticPool

# Setup isolated SQLite in-memory database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Seed default roles and settings in memory DB
def setup_test_db():
    db = TestingSessionLocal()
    roles = [
        Role(id=1, role_name="Super Admin", description="Admin Role"),
        Role(id=2, role_name="Faculty", description="Faculty Role"),
        Role(id=3, role_name="Student", description="Student Role"),
        Role(id=4, role_name="Parent Visitor", description="Parent Role"),
        Role(id=5, role_name="Guest", description="Guest Role")
    ]
    for r in roles:
        existing = db.query(Role).filter(Role.id == r.id).first()
        if not existing:
            db.add(r)
    
    settings = db.query(SystemSetting).filter(SystemSetting.id == 1).first()
    if not settings:
        db.add(SystemSetting(id=1, account_approval_mode="AUTO", otp_expiry=300))
    
    db.commit()
    db.close()

setup_test_db()
client = TestClient(app)

def test_login_non_existent_email():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent99999@kluniversity.in",
        "password": "Password123@"
    })
    assert response.status_code == 404
    assert response.json()["detail"] == "No account found with this email address."

def test_login_incorrect_password():
    # Register test user first
    unique_email = "faculty_test_login@kluniversity.in"
    client.post("/api/auth/register", json={
        "fullname": "Faculty Test",
        "email": unique_email,
        "phone": "9876543210",
        "role_id": 2,
        "employee_id": "1234",
        "department": "CSE",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })

    response = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword123@"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect password."

def test_student_registration_and_domain_rule():
    # Reject non-KLU email for student
    response = client.post("/api/auth/register", json={
        "fullname": "Student Invalid Email",
        "email": "student@gmail.com",
        "phone": "9876543211",
        "role_id": 3,
        "roll_number": "2400000001",
        "department": "ECE",
        "duration": "2",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })
    assert response.status_code == 422 or response.status_code == 400

    # Accept KLU email for student
    student_email = "student_valid@kluniversity.in"
    resp_success = client.post("/api/auth/register", json={
        "fullname": "Student Valid",
        "email": student_email,
        "phone": "9876543212",
        "role_id": 3,
        "roll_number": "2400000002",
        "department": "ECE",
        "duration": "2",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })
    assert resp_success.status_code == 201

def test_duplicate_checks():
    email = "duplicate_user@kluniversity.in"
    phone = "9876543213"
    student_id = "2400000003"
    faculty_id = "5678"

    # Register original user
    client.post("/api/auth/register", json={
        "fullname": "Original Student",
        "email": email,
        "phone": phone,
        "role_id": 3,
        "roll_number": student_id,
        "department": "CSE",
        "duration": "1",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })

    # Duplicate Email Check (409)
    resp_email = client.post("/api/auth/register", json={
        "fullname": "Dup Email User",
        "email": email,
        "phone": "9876543214",
        "role_id": 3,
        "roll_number": "2400000004",
        "department": "CSE",
        "duration": "1",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })
    assert resp_email.status_code == 409
    assert resp_email.json()["detail"] == "An account with this email already exists. Please Login."

    # Duplicate Phone Check (409)
    resp_phone = client.post("/api/auth/register", json={
        "fullname": "Dup Phone User",
        "email": "unique_email_phone@kluniversity.in",
        "phone": phone,
        "role_id": 3,
        "roll_number": "2400000005",
        "department": "CSE",
        "duration": "1",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })
    assert resp_phone.status_code == 409
    assert resp_phone.json()["detail"] == "This phone number is already registered."

    # Duplicate Student ID Check (409)
    resp_student_id = client.post("/api/auth/register", json={
        "fullname": "Dup Student ID User",
        "email": "unique_email_studentid@kluniversity.in",
        "phone": "9876543215",
        "role_id": 3,
        "roll_number": student_id,
        "department": "CSE",
        "duration": "1",
        "password": "Password123@",
        "confirm_password": "Password123@"
    })
    assert resp_student_id.status_code == 409
    assert resp_student_id.json()["detail"] == "This Student ID is already registered."

def test_faculty_mfa_flow():
    from app.config.config import settings
    original_mfa = settings.ENABLE_MFA
    settings.ENABLE_MFA = True
    try:
        email = "prof_mfa_test@kluniversity.in"
        password = "Password123@"

        # Register Faculty
        client.post("/api/auth/register", json={
            "fullname": "Prof MFA Test",
            "email": email,
            "phone": "9876543216",
            "role_id": 2,
            "employee_id": "9999",
            "department": "CSE",
            "password": password,
            "confirm_password": password
        })

        # Step 1: Login
        login_resp = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert login_data["mfa_required"] is True
        assert login_data["is_mfa_setup"] is False
        assert "temp_token" in login_data
        assert "qr_code_url" in login_data
        assert "secret_key" in login_data

        # Step 2: Generate TOTP code using returned secret_key
        totp = pyotp.TOTP(login_data["secret_key"])
        totp_code = totp.now()

        # Step 3: Verify Faculty MFA
        mfa_verify_resp = client.post("/api/auth/verify-faculty-mfa", json={
            "temp_token": login_data["temp_token"],
            "totp_code": totp_code
        })
        if mfa_verify_resp.status_code != 200:
            print(f"MFA Verify Error: {mfa_verify_resp.status_code} - {mfa_verify_resp.json()}")
        assert mfa_verify_resp.status_code == 200
        assert "access_token" in mfa_verify_resp.json()
        assert mfa_verify_resp.json()["user"]["email"] == email
    finally:
        settings.ENABLE_MFA = original_mfa

def test_parent_login_skips_mfa():
    email = "parent_test@gmail.com"
    password = "Password123@"

    client.post("/api/auth/register", json={
        "fullname": "Parent Visitor Test",
        "email": email,
        "phone": "9876543217",
        "role_id": 4,
        "parent_student_roll": "2400000002",
        "relationship": "Father",
        "password": password,
        "confirm_password": password
    })

    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()
    assert "mfa_required" not in login_resp.json()

if __name__ == '__main__':
    print("Running automated authentication test suite...")
    test_login_non_existent_email()
    print("[PASS] Login Non-Existent Email (404) Passed")
    test_login_incorrect_password()
    print("[PASS] Login Incorrect Password (401) Passed")
    test_student_registration_and_domain_rule()
    print("[PASS] Student Email Domain Rule & Registration Passed")
    test_duplicate_checks()
    print("[PASS] Duplicate Email, Phone & Student ID Checks (409) Passed")
    test_faculty_mfa_flow()
    print("[PASS] Faculty TOTP MFA Flow Passed")
    test_parent_login_skips_mfa()
    print("[PASS] Parent Login (Skips MFA) Passed")
    print("All Automated Security & Auth Tests PASSED successfully!")
