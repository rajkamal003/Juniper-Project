# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.config import settings

db_url = settings.DATABASE_URL
if not db_url or not db_url.strip():
    db_url = "sqlite:///securecampus.db"

try:
    # Create engine with pool_pre_ping to automatically reconnect on drop
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
except Exception as e:
    print(f"Database Engine Error: {e}. Falling back to SQLite.")
    engine = create_engine(
        "sqlite:///securecampus.db",
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
