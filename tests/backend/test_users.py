# tests/backend/test_users.py
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.models.models import Role, Permission, SystemSetting, User, UserSession
from app.utils.auth_utils import hash_password
from app.main import app

# isolated SQLite file-based database for testing users
TEST_DB_FILE = "./test_u.db"
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
    
    # Seed permissions
    permissions = [
        Permission(id=1, permission_name="DASHBOARD_VIEW", description="DASHBOARD_VIEW"),
        Permission(id=5, permission_name="USERS_VIEW", description="USERS_VIEW"),
        Permission(id=13, permission_name="REPORTS_VIEW", description="REPORTS_VIEW"),
    ]
    session.add_all(permissions)
    
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

@pytest.fixture(scope="function")
def seed_data(db: Session):
    # Setup test users
    # 1. Super Admin
    admin = User(
        fullname="Admin User",
        email="admin@test.com",
        phone="+919988776655",
        password_hash=hash_password("Password123!"),
        role_id=1,
        account_status="Active",
        is_verified=True,
        is_first_login=False
    )
    
    # 2. Student
    student = User(
        fullname="Student Bob",
        email="student@test.com",
        phone="+918877665544",
        password_hash=hash_password("Password123!"),
        role_id=3,
        account_status="Active",
        is_verified=True,
        is_first_login=False,
        roll_number="22CSE1092",
        department="CSE"
    )
    
    # 3. Pending Faculty
    faculty = User(
        fullname="Faculty Alice",
        email="faculty@test.com",
        phone="+917766554433",
        password_hash=hash_password("Password123!"),
        role_id=2,
        account_status="Pending",
        is_verified=False,
        is_first_login=True,
        employee_id="FAC-009",
        department="ECE"
    )

    db.add_all([admin, student, faculty])
    db.commit()
    
    return admin, student, faculty

def test_admin_get_users(client, seed_data):
    admin, _, _ = seed_data
    # Log in as Admin
    login_resp = client.post("/api/auth/login", json={
        "email": admin.email,
        "password": "Password123!",
        "device_name": "Test Desktop",
        "browser": "Chrome",
        "operating_system": "Windows"
    })
    token = login_resp.json()["access_token"]
    
    # Fetch user directory
    resp = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 3
    
    # Test search by name
    resp_search = client.get("/api/users?search=Bob", headers={"Authorization": f"Bearer {token}"})
    assert resp_search.json()["total"] == 1
    assert resp_search.json()["users"][0]["fullname"] == "Student Bob"

def test_student_get_users_blocked(client, seed_data):
    _, student, _ = seed_data
    login_resp = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "Password123!",
        "device_name": "Test Phone",
        "browser": "Safari",
        "operating_system": "iOS"
    })
    token = login_resp.json()["access_token"]
    
    # Student is blocked from fetching user directory
    resp = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403

def test_profile_updates(client, seed_data):
    _, student, _ = seed_data
    login_resp = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "Password123!",
        "device_name": "Test Phone",
        "browser": "Safari",
        "operating_system": "iOS"
    })
    token = login_resp.json()["access_token"]
    
    # Update own profile details
    update_resp = client.put(
        f"/api/users/{student.id}",
        json={"fullname": "Bobby Student", "phone": "9998887776"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["fullname"] == "Bobby Student"
    assert update_resp.json()["phone"] == "9998887776"

def test_admin_update_status_and_logout(client, seed_data):
    admin, student, _ = seed_data
    
    # 1. Log in student
    login_student = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "Password123!",
        "device_name": "Student Laptop"
    })
    student_token = login_student.json()["access_token"]
    
    # 2. Log in Admin
    login_admin = client.post("/api/auth/login", json={
        "email": admin.email,
        "password": "Password123!",
        "device_name": "Admin Workstation"
    })
    admin_token = login_admin.json()["access_token"]
    
    # 3. Admin suspends student
    susp_resp = client.post(
        f"/api/users/{student.id}/status",
        json={"account_status": "Suspended"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert susp_resp.status_code == 200
    assert susp_resp.json()["account_status"] == "Suspended"
    
    # 4. Student token requests should now fail with 403 Forbidden
    profile_resp = client.get("/api/auth/profile", headers={"Authorization": f"Bearer {student_token}"})
    assert profile_resp.status_code == 403

def test_admin_force_reset_password(client, db, seed_data):
    admin, student, _ = seed_data
    
    # Log in Admin
    login_admin = client.post("/api/auth/login", json={
        "email": admin.email,
        "password": "Password123!"
    })
    admin_token = login_admin.json()["access_token"]
    
    # Admin resets student password
    reset_resp = client.post(
        f"/api/users/{student.id}/force-reset",
        json={"new_password": "NewSecretPassword123!"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert reset_resp.status_code == 200
    
    # Student logs in with old password -> should fail
    login_old = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "Password123!"
    })
    assert login_old.status_code == 401
    
    # Student logs in with new password -> should succeed
    login_new = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "NewSecretPassword123!"
    })
    assert login_new.status_code == 200
    assert login_new.json()["user"]["is_first_login"] == True # is_first_login is forced back to True

def test_session_monitoring_and_revocation(client, seed_data):
    _, student, _ = seed_data
    
    # Log in student
    login_student = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "Password123!",
        "device_name": "Macbook Air",
        "browser": "Firefox",
        "operating_system": "MacOS"
    })
    student_token = login_student.json()["access_token"]
    
    # List active sessions
    sessions_resp = client.get("/api/users/sessions", headers={"Authorization": f"Bearer {student_token}"})
    assert sessions_resp.status_code == 200
    assert len(sessions_resp.json()) == 1
    session_id = sessions_resp.json()[0]["session_id"]
    assert sessions_resp.json()[0]["browser"] == "Firefox"
    
    # Revoke own session
    revoke_resp = client.post(
        f"/api/users/sessions/revoke/{session_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert revoke_resp.status_code == 200
    
    # Verify token is now invalid
    profile_resp = client.get("/api/auth/profile", headers={"Authorization": f"Bearer {student_token}"})
    assert profile_resp.status_code == 401

def test_admin_change_settings(client, seed_data):
    admin, _, _ = seed_data
    
    # Log in Admin
    login_admin = client.post("/api/auth/login", json={
        "email": admin.email,
        "password": "Password123!"
    })
    admin_token = login_admin.json()["access_token"]
    
    # Update settings to ADMIN approval mode
    config_resp = client.put(
        "/api/users/settings/config",
        json={"account_approval_mode": "ADMIN"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert config_resp.status_code == 200
    assert config_resp.json()["account_approval_mode"] == "ADMIN"

def test_admin_create_user(client, seed_data):
    admin, _, _ = seed_data
    
    # Log in Admin
    login_admin = client.post("/api/auth/login", json={
        "email": admin.email,
        "password": "Password123!"
    })
    admin_token = login_admin.json()["access_token"]
    
    # Admin creates new Faculty user
    create_resp = client.post(
        "/api/users/create",
        json={
            "fullname": "New Faculty Member",
            "email": "new_fac@test.com",
            "phone": "+919900887766",
            "role_id": 2,
            "employee_id": "FAC-889",
            "department": "CSE"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert create_resp.status_code == 201
    assert create_resp.json()["email"] == "new_fac@test.com"
    assert create_resp.json()["is_first_login"] == True
    assert create_resp.json()["account_status"] == "Active"
    
    # Verify non-admin Student cannot create user
    _, student, _ = seed_data
    login_student = client.post("/api/auth/login", json={
        "email": student.email,
        "password": "Password123!"
    })
    student_token = login_student.json()["access_token"]
    
    create_resp_fail = client.post(
        "/api/users/create",
        json={
            "fullname": "Hacker Guest",
            "email": "hacker@test.com",
            "phone": "+919900887755",
            "role_id": 5
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert create_resp_fail.status_code == 403
