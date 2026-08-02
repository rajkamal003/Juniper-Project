# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.device_routes import router as device_router
from app.routes.network_routes import router as network_router
from app.routes.firewall_routes import router as firewall_router
from app.routes.report_routes import router as report_router
from app.routes.settings_routes import router as settings_router
from app.routes.juniper_routes import router as juniper_router
from app.routes.visitor_routes import router as visitor_router
from app.routes.exam_routes import router as exam_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.profile_routes import router as profile_router
from app.config.config import settings

# Initialize FastAPI
app = FastAPI(
    title="SecureCampus AI API",
    description="Intelligent Network Security & User Access Management System API",
    version="1.0.0",
    debug=settings.DEBUG
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(device_router)
app.include_router(network_router)
app.include_router(firewall_router)
app.include_router(report_router)
app.include_router(settings_router)
app.include_router(juniper_router)
app.include_router(visitor_router)
app.include_router(exam_router)
app.include_router(analytics_router)
app.include_router(profile_router)

@app.on_event("startup")
def run_db_migrations():
    from app.database import engine
    from app.models.models import Base
    from sqlalchemy import text, inspect

    # ── Step 1: Create all missing tables ─────────────────────────────────────
    try:
        Base.metadata.create_all(bind=engine)
        print("DB: Schema sync complete.")
    except Exception as e:
        print("DB schema create_all warning:", e)

    # ── Step 2: Column migrations (idempotent ALTERs) ─────────────────────────
    try:
        with engine.begin() as conn:
            inspector = inspect(conn)
            user_cols = {col['name'] for col in inspector.get_columns("users")} if inspector.has_table("users") else set()

            is_mysql = "mysql" in str(engine.url)
            if is_mysql:
                try:
                    if "profile_image" in user_cols:
                        conn.execute(text("ALTER TABLE users MODIFY COLUMN profile_image TEXT NULL;"))
                    if "college_id_upload" in user_cols:
                        conn.execute(text("ALTER TABLE users MODIFY COLUMN college_id_upload TEXT NULL;"))
                except Exception as e:
                    print("MySQL text column alter warning:", e)

            try:
                if "mfa_secret" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255) NULL;"))
                    print("Migration: Added mfa_secret column.")
            except Exception as e:
                print("mfa_secret migration warning:", e)

            try:
                if "is_mfa_enabled" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_mfa_enabled BOOLEAN DEFAULT FALSE;"))
                    print("Migration: Added is_mfa_enabled column.")
            except Exception as e:
                print("is_mfa_enabled migration warning:", e)

            # ── Guest-specific columns ─────────────────────────────────────────
            try:
                if "host_faculty" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN host_faculty VARCHAR(255) NULL;"))
                    print("Migration: Added host_faculty column.")
            except Exception as e:
                print("host_faculty migration warning:", e)

            try:
                if "visit_date" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN visit_date DATE NULL;"))
                    print("Migration: Added visit_date column.")
            except Exception as e:
                print("visit_date migration warning:", e)

            try:
                conn.execute(text("UPDATE users SET profile_image = NULL WHERE profile_image LIKE 'http%';"))
                conn.execute(text("UPDATE users SET college_id_upload = NULL WHERE college_id_upload LIKE 'http%';"))
            except Exception as e:
                print("Image URL cleanup warning:", e)
    except Exception as e:
        print("DB column migration warning:", e)

    # ── Step 3: Seed roles ─────────────────────────────────────────────────────
    try:
        with engine.begin() as conn:
            is_mysql = "mysql" in str(engine.url)
            if is_mysql:
                conn.execute(text("""
                    INSERT IGNORE INTO roles (id, role_name, description) VALUES
                    (1, 'Super Admin', 'Super Admin'),
                    (2, 'Faculty', 'Faculty'),
                    (3, 'Student', 'Student'),
                    (4, 'Parent Visitor', 'Parent Visitor'),
                    (5, 'Guest', 'Guest');
                """))
            else:
                for role_id, name, desc in [
                    (1, 'Super Admin', 'Super Admin'),
                    (2, 'Faculty', 'Faculty'),
                    (3, 'Student', 'Student'),
                    (4, 'Parent Visitor', 'Parent Visitor'),
                    (5, 'Guest', 'Guest')
                ]:
                    conn.execute(text(
                        "INSERT INTO roles (id, role_name, description) VALUES (:rid, :name, :desc) "
                        "ON CONFLICT (id) DO NOTHING;"
                    ), {"rid": role_id, "name": name, "desc": desc})
            print("DB: Roles seeded.")
    except Exception as e:
        print("Roles seeding warning:", e)

    # ── Step 4: Seed Super Admin user ─────────────────────────────────────────
    try:
        with engine.begin() as conn:
            from app.utils.auth_utils import hash_password
            admin_check = conn.execute(text(
                "SELECT id, employee_id FROM users WHERE email = 'admin@securecampus.com';"
            )).fetchone()
            if not admin_check:
                admin_hash = hash_password("Admin@123")
                conn.execute(text(
                    "INSERT INTO users (fullname, email, phone, password_hash, role_id, "
                    "account_status, is_verified, is_first_login, employee_id) "
                    "VALUES ('Super Admin', 'admin@securecampus.com', '9988776655', :pwd, "
                    "1, 'Active', 1, 0, 'ADM-001');"
                ), {"pwd": admin_hash})
                print("DB: Super Admin seeded (admin@securecampus.com / Admin@123).")
            else:
                if not admin_check[1]:
                    conn.execute(text(
                        "UPDATE users SET employee_id = 'ADM-001' WHERE email = 'admin@securecampus.com';"
                    ))
                print(f"DB: Super Admin already exists (id={admin_check[0]}).")
    except Exception as e:
        print("Admin seeding warning:", e)

    # ── Step 5: Seed system settings with all required columns ────────────────
    try:
        with engine.begin() as conn:
            setting_check = conn.execute(text("SELECT id FROM system_settings LIMIT 1;")).fetchone()
            if not setting_check:
                conn.execute(text(
                    "INSERT INTO system_settings "
                    "(account_approval_mode, theme, maintenance_mode, allow_guest_registration, "
                    "exam_mode, otp_expiry, session_timeout) "
                    "VALUES ('AUTO', 'dark', 0, 1, 0, 300, 900);"
                ))
                print("DB: System settings seeded.")
            else:
                print("DB: System settings already exist.")
    except Exception as e:
        print("System settings seeding warning:", e)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "SecureCampus AI API",
        "version": "1.0.0"
    }
