# backend/app/config/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:root@127.0.0.1:3306/securecampus_db"
    JWT_SECRET_KEY: str = "8f1c8a149b5c2a1a8cdebc712f0a1c1d6b0b2e8a1f81c9a3b2b1a8d0c6f5e4d3"
    JWT_REFRESH_SECRET_KEY: str = "9a1b8c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ACCOUNT_APPROVAL_MODE: str = "AUTO"  # AUTO or ADMIN
    DEBUG: bool = True

    # Juniper Infrastructure Settings
    JUNIPER_SRX300_HOST: str = "192.168.1.1"
    JUNIPER_EX2300_HOST: str = "192.168.1.2"
    JUNIPER_AP32_HOST: str = "192.168.1.3"
    JUNIPER_AP63_HOST: str = "192.168.1.4"
    JUNIPER_USERNAME: str = "admin"
    JUNIPER_PASSWORD: str = "Juniper@123"
    JUNIPER_PORT: int = 830
    JUNIPER_TIMEOUT: int = 10
    JUNIPER_MOCK_FALLBACK: bool = True

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        extra = "ignore"

settings = Settings()
