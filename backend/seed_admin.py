# backend/seed_admin.py
import pymysql
import bcrypt

from app.config.config import settings
from sqlalchemy.engine.url import make_url

db_url = make_url(settings.DATABASE_URL)
DB_HOST = db_url.host or "127.0.0.1"
DB_PORT = db_url.port or 3306
DB_USER = db_url.username or "root"
DB_PASS = db_url.password or "root"
DB_NAME = db_url.database or "securecampus_db"

def seed_admin():
    print("Connecting to securecampus_db to seed system settings and default Admin...")
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        autocommit=True
    )
    
    try:
        with connection.cursor() as cursor:
            # 1. Seed default system settings if missing
            print("Seeding default system settings...")
            cursor.execute(
                "INSERT INTO system_settings (id, account_approval_mode, theme, maintenance_mode, "
                "allow_guest_registration, exam_mode, otp_expiry, session_timeout) "
                "VALUES (1, 'AUTO', 'dark', FALSE, TRUE, FALSE, 300, 900) "
                "ON DUPLICATE KEY UPDATE updated_at=CURRENT_TIMESTAMP;"
            )

            # 2. Seed Super Admin User
            admin_email = "admin@securecampus.com"
            admin_pass = "Admin@123"
            
            password_bytes = admin_pass.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_pass = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            cursor.execute("SELECT id FROM users WHERE email = %s;", (admin_email,))
            admin_exists = cursor.fetchone()
            
            if not admin_exists:
                cursor.execute(
                    "INSERT INTO users (fullname, email, phone, password_hash, role_id, account_status, is_verified, is_first_login, employee_id) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);",
                    ("Super Admin", admin_email, "+1234567890", hashed_pass, 1, "Active", True, False, "ADM-001")
                )
                print("Super Admin user created successfully!")
                print(f"Email: {admin_email}")
                print(f"Password: {admin_pass}")
            else:
                print("Super Admin user already exists. Skipping user creation.")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_admin()
