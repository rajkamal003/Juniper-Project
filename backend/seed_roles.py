# backend/seed_roles.py
import pymysql

DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = "root"
DB_NAME = "securecampus_db"

def seed_roles():
    print("Connecting to securecampus_db to seed roles and map permissions...")
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
            
            for role in roles:
                cursor.execute(
                    "INSERT INTO roles (id, role_name, description) VALUES (%s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE description=VALUES(description);",
                    role
                )
            print("Roles seeded.")

            # 2. Map Permissions (Super Admin gets all: 1 to 15)
            print("Mapping all permissions to Super Admin...")
            for perm_id in range(1, 16):
                cursor.execute(
                    "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, %s);",
                    (perm_id,)
                )

            # 3. Map Faculty Permissions (DASHBOARD_VIEW, USERS_VIEW, REPORTS_VIEW)
            print("Mapping basic permissions to Faculty...")
            for perm_id in [1, 5, 13]:
                cursor.execute(
                    "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, %s);",
                    (perm_id,)
                )

            # 4. Map Student Permissions (DASHBOARD_VIEW)
            print("Mapping basic permissions to Student...")
            cursor.execute("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 1);")

            # 5. Map Parent Permissions (DASHBOARD_VIEW)
            print("Mapping basic permissions to Parent Visitor...")
            cursor.execute("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (4, 1);")

            # 6. Map Guest Permissions (DASHBOARD_VIEW)
            print("Mapping basic permissions to Guest...")
            cursor.execute("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (5, 1);")

            print("Roles and permission mapping completed successfully!")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_roles()
