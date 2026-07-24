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
    
    # Drop user_sessions if it exists to force refresh schema
    try:
        with engine.begin() as conn:
            inspector = inspect(conn)
            if inspector.has_table("user_sessions"):
                conn.execute(text("DROP TABLE user_sessions;"))
                print("Migration: Dropped old user_sessions table to force schema refresh.")
    except Exception as e:
        print("DB drop user_sessions warning / ignored:", e)

    try:
        # Create all missing tables automatically
        Base.metadata.create_all(bind=engine)
        
        with engine.begin() as conn:
            inspector = inspect(conn)
            user_cols = {col['name'] for col in inspector.get_columns("users")} if inspector.has_table("users") else set()

            if "mysql" in str(engine.url):
                if "profile_image" in user_cols:
                    conn.execute(text("ALTER TABLE users MODIFY COLUMN profile_image TEXT NULL;"))
                if "college_id_upload" in user_cols:
                    conn.execute(text("ALTER TABLE users MODIFY COLUMN college_id_upload TEXT NULL;"))
                print("MySQL schema migrated: profile_image & college_id_upload altered to TEXT.")

            if "mfa_secret" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255) NULL;"))
                print("Migration: Added mfa_secret column to users table.")

            if "is_mfa_enabled" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_mfa_enabled BOOLEAN DEFAULT FALSE;"))
                print("Migration: Added is_mfa_enabled column to users table.")

            # Clean up old mock HTTP URLs so they don't render as broken images
            conn.execute(text("UPDATE users SET profile_image = NULL WHERE profile_image LIKE 'http%';"))
            conn.execute(text("UPDATE users SET college_id_upload = NULL WHERE college_id_upload LIKE 'http%';"))
            print("Database cleanup: Reset legacy mock image URLs to NULL.")

            # Seed default Roles and Super Admin user if missing
            from app.utils.auth_utils import hash_password
            
            # Check if role is mysql or postgres to execute insertion
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
                # PostgreSQL insert ignores
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

            admin_check = conn.execute(text("SELECT id, employee_id FROM users WHERE email = 'admin@securecampus.com';")).fetchone()
            if not admin_check:
                admin_hash = hash_password("Admin@123")
                conn.execute(text(
                    "INSERT INTO users (fullname, email, phone, password_hash, role_id, account_status, is_verified, is_first_login, employee_id) "
                    "VALUES ('Super Admin', 'admin@securecampus.com', '9988776655', :pwd, 1, 'Active', 1, 0, 'ADM-001');"
                ), {"pwd": admin_hash})
                print("Seeded default Super Admin user: admin@securecampus.com with employee_id ADM-001")
            elif not admin_check[1]:
                conn.execute(text("UPDATE users SET employee_id = 'ADM-001' WHERE email = 'admin@securecampus.com';"))
                print("Updated existing Super Admin user with employee_id ADM-001")
    except Exception as e:
        print("DB migration / setup warning (server still starting):", e)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "SecureCampus AI API",
        "version": "1.0.0"
    }
