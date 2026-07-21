# backend/seed.py
import pymysql
import bcrypt

DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = "root"
DB_NAME = "securecampus_db"

def seed_database():
    print("Connecting to database securecampus_db to seed data...")
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
            # 1. Seed Roles
            roles = [
                (1, "Super Admin", "Full system administrator with access to all controls and configurations"),
                (2, "Faculty", "Academic staff with access to department-level systems and student directories"),
                (3, "Student", "Campus students with access to their own records and student portal"),
                (4, "Parent Visitor", "Parents of students visiting the campus with temporary access"),
                (5, "Guest", "General visitors requiring temporary guest network and campus access")
            ]
            print("Seeding roles...")
            for role in roles:
                cursor.execute(
                    "INSERT INTO roles (id, role_name, description) VALUES (%s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE description=VALUES(description);",
                    role
                )

            # 2. Seed Permissions
            permissions = [
                (1, "VIEW_USERS", "Permission to view user lists and details"),
                (2, "DELETE_USERS", "Permission to remove users from the system"),
                (3, "BLOCK_WEBSITE", "Permission to restrict access to network domains"),
                (4, "VIEW_REPORTS", "Permission to access security and analytics reports"),
                (5, "VIEW_DASHBOARD", "Permission to view the main status monitor")
            ]
            print("Seeding permissions...")
            for perm in permissions:
                cursor.execute(
                    "INSERT INTO permissions (id, permission_name, description) VALUES (%s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE description=VALUES(description);",
                    perm
                )

            # 3. Seed Role Permissions (Super Admin gets all)
            print("Linking Super Admin to all permissions...")
            for perm_id in [1, 2, 3, 4, 5]:
                cursor.execute(
                    "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, %s);",
                    (perm_id,)
                )
            
            # Faculty & Student get VIEW_DASHBOARD
            print("Linking Faculty/Student roles to basic dashboard permissions...")
            cursor.execute("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, 5);")
            cursor.execute("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 5);")

            # 4. Seed Default System Settings
            print("Seeding default system settings...")
            cursor.execute(
                "INSERT INTO system_settings (id, account_approval_mode, theme, maintenance_mode, "
                "allow_guest_registration, exam_mode, otp_expiry, session_timeout) "
                "VALUES (1, 'AUTO', 'dark', FALSE, TRUE, FALSE, 300, 900) "
                "ON DUPLICATE KEY UPDATE updated_at=CURRENT_TIMESTAMP;"
            )

            # 5. Seed Super Admin User
            admin_email = "admin@securecampus.com"
            admin_pass = "Admin@123"
            
            # Hash password using native bcrypt
            password_bytes = admin_pass.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_pass = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            print("Seeding default Super Admin user...")
            cursor.execute("SELECT id FROM users WHERE email = %s;", (admin_email,))
            admin_exists = cursor.fetchone()
            
            if not admin_exists:
                cursor.execute(
                    "INSERT INTO users (fullname, email, phone, password_hash, role_id, account_status, is_verified, is_first_login) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
                    ("Super Admin", admin_email, "+1234567890", hashed_pass, 1, "Active", True, False)
                )
                print(f"Super Admin user created successfully!")
                print(f"Email: {admin_email}")
                print(f"Password: {admin_pass}")
            else:
                print("Super Admin user already exists. Skipping user creation.")
                
        print("Database seeding completed successfully!")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_database()
