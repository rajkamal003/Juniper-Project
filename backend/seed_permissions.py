# backend/seed_permissions.py
import pymysql

DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = "root"
DB_NAME = "securecampus_db"

def seed_permissions():
    print("Connecting to securecampus_db to seed permissions...")
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
            # Grouped permission list
            permissions = [
                # Dashboard
                (1, "DASHBOARD_VIEW", "Permission to view status monitoring panels"),
                (2, "DASHBOARD_CREATE", "Permission to add dashboard widgets"),
                (3, "DASHBOARD_UPDATE", "Permission to modify dashboard config"),
                (4, "DASHBOARD_DELETE", "Permission to remove dashboard layouts"),
                # Users
                (5, "USERS_VIEW", "Permission to view user lists and details"),
                (6, "USERS_CREATE", "Permission to manually create new operators"),
                (7, "USERS_UPDATE", "Permission to update operator profiles"),
                (8, "USERS_DELETE", "Permission to logically delete user accounts"),
                # Firewall
                (9, "FIREWALL_VIEW", "Permission to view firewall policy matrices"),
                (10, "FIREWALL_MANAGE", "Permission to edit and deploy firewall policies"),
                # Network
                (11, "NETWORK_VIEW", "Permission to view campus network nodes"),
                (12, "NETWORK_MANAGE", "Permission to update VLAN and segment mappings"),
                # Reports
                (13, "REPORTS_VIEW", "Permission to access security audit logs"),
                (14, "REPORTS_GENERATE", "Permission to generate compliance reports"),
                # Settings
                (15, "SETTINGS_MANAGE", "Permission to manage system configurations")
            ]
            
            for perm in permissions:
                cursor.execute(
                    "INSERT INTO permissions (id, permission_name, description) VALUES (%s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE description=VALUES(description);",
                    perm
                )
            print(f"Successfully seeded {len(permissions)} permissions!")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_permissions()
