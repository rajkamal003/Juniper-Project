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
                    "INSERT INTO users (fullname, email, phone, password_hash, role_id, account_status, is_verified, is_first_login, employee_id) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);",
                    ("Super Admin", admin_email, "+1234567890", hashed_pass, 1, "Active", True, False, "ADM-001")
                )
                print(f"Super Admin user created successfully!")
                print(f"Email: {admin_email}")
                print(f"Password: {admin_pass}")
            else:
                print("Super Admin user already exists. Skipping user creation.")
                
            # Seed Mock Users
            print("Seeding mock users...")
            mock_password = "Password@123"
            mock_password_bytes = mock_password.encode('utf-8')
            hashed_mock_pass = bcrypt.hashpw(mock_password_bytes, bcrypt.gensalt()).decode('utf-8')
            
            mock_users = [
                ("L. Pranav", "pranav@kluniversity.in", "+919876543210", hashed_mock_pass, 3, "Active", True, False, "Computer Science & Engineering", "2300090273", None, None, None, None, "4"),
                ("K. Kavitha", "kavitha@kluniversity.in", "+919876543211", hashed_mock_pass, 3, "Active", True, False, "Computer Science & Engineering", "2300090305", None, None, None, None, "4"),
                ("M. Sriman", "sriman@kluniversity.in", "+919876543212", hashed_mock_pass, 3, "Active", True, False, "Computer Science & Engineering", "2300090311", None, None, None, None, "4"),
                ("Dr. Prasad", "prasad@kluniversity.in", "+919876543213", hashed_mock_pass, 2, "Active", True, False, "Electronics & Communications", None, "2158", None, None, None, None),
                ("Srinivasa Rao", "srinivasa@securecampus.com", "+919876543214", hashed_mock_pass, 4, "Active", True, False, None, None, None, "2300090273", "Father", None, None),
                ("GST-9021", "guest9021@securecampus.com", "+919876543215", hashed_mock_pass, 5, "Active", True, False, None, "GST-9021", None, None, None, "Campus Event", "4 Hours")
            ]
            
            for user in mock_users:
                cursor.execute("SELECT id FROM users WHERE email = %s;", (user[1],))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO users (fullname, email, phone, password_hash, role_id, account_status, is_verified, is_first_login, department, roll_number, employee_id, parent_student_roll, relationship, purpose, duration) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
                        user
                    )
                    print(f"Mock user {user[0]} created.")

            # Seed Network Devices
            print("Seeding network devices...")
            devices = [
                ("Core-SRX300-Gateway", "Juniper SRX300", "192.168.1.1", "00:10:db:ff:20:11", "Firewall", "Online"),
                ("Core-EX4100-Switch", "Juniper EX4100", "192.168.1.2", "00:10:db:ff:20:12", "Switch", "Online"),
                ("Agg-EX2300-C-Switch", "Juniper EX2300-C", "192.168.1.3", "00:10:db:ff:20:13", "Switch", "Online"),
                ("AP-MainHall-01", "AP32", "192.168.1.10", "00:10:db:ff:20:14", "Access Point", "Online"),
                ("AP-Library-03", "AP32", "192.168.1.11", "00:10:db:ff:20:15", "Access Point", "Online")
            ]
            for dev in devices:
                cursor.execute("SELECT id FROM devices WHERE device_name = %s;", (dev[0],))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO devices (device_name, model, ip_address, mac_address, device_type, status) "
                        "VALUES (%s, %s, %s, %s, %s, %s);",
                        dev
                    )

            # Seed Network Subnets
            print("Seeding network subnets...")
            subnets = [
                ("192.168.10.0/24", 15, 2, "192.168.10.1", 10, "Active"),
                ("192.168.20.0/24", 25, 3, "192.168.20.1", 20, "Active"),
                ("192.168.30.0/24", 5, 1, "192.168.30.1", 30, "Active"),
                ("192.168.40.0/24", 8, 2, "192.168.40.1", 40, "Active")
            ]
            for sub in subnets:
                cursor.execute("SELECT id FROM network_subnets WHERE subnet_range = %s;", (sub[0],))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO network_subnets (subnet_range, active_clients, ap_count, gateway, vlan_id, status) "
                        "VALUES (%s, %s, %s, %s, %s, %s);",
                        sub
                    )

            # Seed Security Policies (Firewall Rules)
            print("Seeding security policies...")
            policies = [
                (10, "192.168.10.0/24", "any", "TCP", "Allow", 1420, "Active"),
                (20, "192.168.20.0/24", "any", "UDP", "Allow", 890, "Active"),
                (30, "any", "192.168.30.0/24", "ANY", "Deny", 142, "Active")
            ]
            for pol in policies:
                cursor.execute("SELECT id FROM security_policies WHERE priority = %s AND source_ip = %s;", (pol[0], pol[1]))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO security_policies (priority, source_ip, destination, protocol, policy, logs_count, status) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s);",
                        pol
                    )

            # Seed Security Alerts
            print("Seeding security alerts...")
            alerts = [
                ("Bandwidth Anomaly", "High", "High Bandwidth Usage Detected", "User L. Pranav (2300090273) consumed over 2 GB in 15 mins.", None, None, "Active", 0.94),
                ("Domain Policy Violation", "Critical", "Blocked Torrent Domain Attempt", "Device on Student SSID tried loading a magnetic peer link tracker.", None, None, "Active", 0.99),
                ("Intrusion Detection", "Medium", "Unknown Guest MAC Address Connected", "New device 70:F3:95:44:55:66 associated with AP-Library-01.", None, None, "Active", 0.85)
            ]
            for alert in alerts:
                cursor.execute("SELECT id FROM security_alerts WHERE title = %s;", (alert[2],))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO security_alerts (alert_type, severity, title, description, device_id, user_id, status, confidence_score) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
                        alert
                    )
            
            # Seed Network Sessions for Users (except Admin)
            print("Seeding dynamic user network sessions...")
            import uuid
            import random
            from datetime import datetime, timedelta

            cursor.execute("SELECT id, fullname, role_id FROM users WHERE role_id != 1;")
            seeded_users = cursor.fetchall()
            
            for u_id, name, r_id in seeded_users:
                cursor.execute("SELECT id FROM user_sessions WHERE user_id = %s;", (u_id,))
                if not cursor.fetchone():
                    role_map = {2: "Faculty", 3: "Student", 4: "Parent", 5: "Guest"}
                    role_name = role_map.get(r_id, "Student")
                    
                    devices_pool = ["MacBook Pro", "Dell XPS 15", "iPhone 15 Pro", "ThinkPad X1 Carbon", "iPad Air"]
                    browsers_pool = ["Chrome", "Safari", "Firefox", "Edge"]
                    os_pool = ["macOS Sonoma", "Windows 11", "iOS 17", "Ubuntu 22.04"]
                    aps_pool = ["AP-Library-03", "AP-MainHall-01", "AP-Lab-02", "AP-Hostel-05"]
                    ssids_pool = {
                        2: "SecureCampus-Faculty-WPA3",
                        3: "SecureCampus-Student-WPA3",
                        4: "SecureCampus-WiFi",
                        5: "SecureCampus-Guest"
                    }
                    
                    ssid = ssids_pool.get(r_id, "SecureCampus-WiFi")
                    
                    # 1. Expired Session
                    sess_id_1 = str(uuid.uuid4())
                    login_1 = datetime.now() - timedelta(days=1, hours=random.randint(2, 6))
                    logout_1 = login_1 + timedelta(hours=random.randint(1, 4))
                    duration_1 = int((logout_1 - login_1).total_seconds())
                    
                    cursor.execute(
                        "INSERT INTO user_sessions (session_id, user_id, role, login_time, logout_time, device_name, browser, operating_system, ip_address, mac_address, ssid, access_point, signal_strength, status, session_status, session_duration) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
                        (
                            sess_id_1, u_id, role_name, login_1, logout_1,
                            random.choice(devices_pool), random.choice(browsers_pool), random.choice(os_pool),
                            f"192.168.{r_id}0.{random.randint(10, 200)}",
                            f"00:1A:2B:{random.randint(10, 99)}:{random.randint(10, 99)}:{random.randint(10, 99)}",
                            ssid, random.choice(aps_pool), "Good (-65 dBm)", "LoggedOut", "Expired", duration_1
                        )
                    )
                    
                    # 2. Active Session
                    sess_id_2 = str(uuid.uuid4())
                    login_2 = datetime.now() - timedelta(minutes=random.randint(10, 180))
                    
                    cursor.execute(
                        "INSERT INTO user_sessions (session_id, user_id, role, login_time, logout_time, device_name, browser, operating_system, ip_address, mac_address, ssid, access_point, signal_strength, status, session_status, session_duration) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);",
                        (
                            sess_id_2, u_id, role_name, login_2, None,
                            random.choice(devices_pool), random.choice(browsers_pool), random.choice(os_pool),
                            f"192.168.{r_id}0.{random.randint(10, 200)}",
                            f"00:1A:2B:{random.randint(10, 99)}:{random.randint(10, 99)}:{random.randint(10, 99)}",
                            ssid, random.choice(aps_pool), "Excellent (-52 dBm)", "Active", "Active", None
                        )
                    )
                    print(f"Seeded mock sessions for user: {name}")

            # Seed Security Recommendations
            print("Seeding security recommendations...")
            recs = [
                (1, "Enable WPA3 Enterprise encryption on Student SSID", "High", "Pending"),
                (2, "Provision dedicated isolation subnets for Guest devices", "Critical", "Pending")
            ]
            for rec in recs:
                cursor.execute("SELECT id FROM security_recommendations WHERE recommendation = %s;", (rec[1],))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO security_recommendations (alert_id, recommendation, priority, status) "
                        "VALUES (%s, %s, %s, %s);",
                        rec
                    )
                
        print("Database seeding completed successfully!")
    finally:
        connection.close()

if __name__ == "__main__":
    seed_database()
