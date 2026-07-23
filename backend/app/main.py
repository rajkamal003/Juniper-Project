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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
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

@app.on_event("startup")
def run_db_migrations():
    from app.database import engine
    from sqlalchemy import text
    with engine.begin() as conn:
        try:
            if "mysql" in str(engine.url):
                conn.execute(text("ALTER TABLE users MODIFY COLUMN profile_image TEXT NULL;"))
                conn.execute(text("ALTER TABLE users MODIFY COLUMN college_id_upload TEXT NULL;"))
                print("MySQL schema migrated: profile_image & college_id_upload altered to TEXT.")
            
            # Clean up old mock HTTP URLs so they don't render as broken images
            conn.execute(text("UPDATE users SET profile_image = NULL WHERE profile_image LIKE 'http%';"))
            conn.execute(text("UPDATE users SET college_id_upload = NULL WHERE college_id_upload LIKE 'http%';"))
            print("Database cleanup: Reset legacy mock image URLs to NULL.")
        except Exception as e:
            print("DB migration warning / ignored:", e)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "SecureCampus AI API",
        "version": "1.0.0"
    }
