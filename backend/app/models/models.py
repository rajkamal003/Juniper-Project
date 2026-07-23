# backend/app/models/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text, Enum, ForeignKey, Table, Float, func
from sqlalchemy.orm import relationship as orm_relationship
from app.database import Base

# Association Table for Many-to-Many relationship between Roles and Permissions
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    permissions = orm_relationship("Permission", secondary=role_permissions, back_populates="roles")
    users = orm_relationship("User", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    permission_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    roles = orm_relationship("Role", secondary=role_permissions, back_populates="permissions")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    account_status = Column(Enum('Active', 'Pending', 'Rejected', 'Suspended', 'Locked', name='user_status_enum'), default='Pending')
    profile_image = Column(Text, nullable=True)
    college_id_upload = Column(Text, nullable=True)
    last_login = Column(DateTime, nullable=True)
    last_password_change = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_first_login = Column(Boolean, default=True)
    account_locked = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    mfa_secret = Column(String(255), nullable=True)
    is_mfa_enabled = Column(Boolean, default=False)

    # Dynamic role fields
    department = Column(String(100), nullable=True)
    roll_number = Column(String(100), nullable=True, unique=True)
    employee_id = Column(String(100), nullable=True, unique=True)
    parent_student_roll = Column(String(100), nullable=True)
    relationship = Column(String(100), nullable=True)
    purpose = Column(Text, nullable=True)
    duration = Column(String(100), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    role = orm_relationship("Role", back_populates="users")
    sessions = orm_relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    resets = orm_relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")
    activity_logs = orm_relationship("ActivityLog", back_populates="user")
    notifications = orm_relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(255), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=True)
    login_time = Column(DateTime, server_default=func.now())
    logout_time = Column(DateTime, nullable=True)
    device_name = Column(String(255), nullable=True)
    browser = Column(String(255), nullable=True)
    operating_system = Column(String(255), nullable=True)
    ip_address = Column(String(100), nullable=True)
    mac_address = Column(String(100), nullable=True)
    ssid = Column(String(100), nullable=True, default="SecureCampus-WiFi")
    access_point = Column(String(100), nullable=True, default="AP-MainHall-01")
    signal_strength = Column(String(50), nullable=True, default="Excellent (-52 dBm)")
    status = Column(Enum('Active', 'Expired', 'LoggedOut', name='session_status_enum'), default='Active')
    session_status = Column(String(50), nullable=True, default="Active")
    last_activity = Column(DateTime, server_default=func.now(), onupdate=func.now())
    session_duration = Column(Integer, nullable=True)  # duration in seconds

    # Relationships
    user = orm_relationship("User", back_populates="sessions")

class PasswordReset(Base):
    __tablename__ = "password_reset"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    otp_hash = Column(String(255), nullable=False)
    expiry = Column(DateTime, nullable=False)
    otp_attempts = Column(Integer, default=0)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = orm_relationship("User", back_populates="resets")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    ip = Column(String(100), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())

    # Relationships
    user = orm_relationship("User", back_populates="activity_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = orm_relationship("User", back_populates="notifications")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    account_approval_mode = Column(Enum('AUTO', 'ADMIN', name='approval_mode_enum'), default='AUTO')
    theme = Column(String(50), default='dark')
    maintenance_mode = Column(Boolean, default=False)
    allow_guest_registration = Column(Boolean, default=True)
    exam_mode = Column(Boolean, default=False)
    otp_expiry = Column(Integer, default=300)      # default 5 mins in seconds
    session_timeout = Column(Integer, default=900)  # default 15 mins in seconds
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class NetworkDevice(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_name = Column(String(100), nullable=False)
    model = Column(String(50), nullable=False)
    ip_address = Column(String(100), nullable=True)
    mac_address = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=False) # e.g. Switch, Access Point, Firewall
    status = Column(String(50), default="Offline")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class NetworkSubnet(Base):
    __tablename__ = "network_subnets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subnet_range = Column(String(100), nullable=False)
    active_clients = Column(Integer, default=0)
    ap_count = Column(Integer, default=0)
    gateway = Column(String(100), nullable=True)
    vlan_id = Column(Integer, nullable=True)
    status = Column(String(50), default="Active")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class SecurityPolicy(Base):
    __tablename__ = "security_policies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    priority = Column(Integer, nullable=False)
    source_ip = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    protocol = Column(String(50), nullable=False) # TCP, UDP, ICMP
    policy = Column(String(50), nullable=False) # Allow, Deny, Reject
    logs_count = Column(Integer, default=0)
    status = Column(String(50), default="Active")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class ReportRequest(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_name = Column(String(255), nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    report_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Pending") # Pending, Completed, Failed
    created_at = Column(DateTime, server_default=func.now())

    user = orm_relationship("User")

# --- Stage 6: Juniper Hardware Models ---

class DeviceInventory(Base):
    __tablename__ = "device_inventories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hostname = Column(String(100), nullable=False)
    model = Column(String(50), nullable=False) # e.g. SRX300, EX2300-C, AP32, AP63
    serial_number = Column(String(100), nullable=True)
    os_version = Column(String(50), nullable=True)
    uptime = Column(String(100), nullable=True)
    management_ip = Column(String(100), nullable=True)
    mac_address = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=False) # Firewall, Switch, Access Point
    status = Column(String(50), default="Online") # Online, Offline, Error
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    interfaces = orm_relationship("NetworkInterface", back_populates="device", cascade="all, delete-orphan")
    vlans = orm_relationship("VlanInventory", back_populates="device", cascade="all, delete-orphan")
    aps = orm_relationship("WirelessAccessPoint", back_populates="device", cascade="all, delete-orphan")
    health_logs = orm_relationship("DeviceHealth", back_populates="device", cascade="all, delete-orphan")

class NetworkInterface(Base):
    __tablename__ = "device_interfaces"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("device_inventories.id", ondelete="CASCADE"), nullable=False)
    interface_name = Column(String(100), nullable=False) # ge-0/0/0, etc.
    speed = Column(String(50), nullable=True)
    status = Column(String(50), default="Up") # Up, Down
    description = Column(String(255), nullable=True)
    mac_address = Column(String(100), nullable=True)
    ip_address = Column(String(100), nullable=True)
    error_count = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    device = orm_relationship("DeviceInventory", back_populates="interfaces")

class VlanInventory(Base):
    __tablename__ = "vlan_inventories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("device_inventories.id", ondelete="CASCADE"), nullable=False)
    vlan_id = Column(Integer, nullable=False)
    vlan_name = Column(String(100), nullable=False)
    subnet = Column(String(100), nullable=True)
    gateway = Column(String(100), nullable=True)
    associated_interfaces = Column(String(255), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    device = orm_relationship("DeviceInventory", back_populates="vlans")

class WirelessAccessPoint(Base):
    __tablename__ = "wireless_aps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("device_inventories.id", ondelete="CASCADE"), nullable=False)
    ap_name = Column(String(100), nullable=False)
    model = Column(String(50), nullable=False) # AP32, AP63
    firmware_version = Column(String(50), nullable=True)
    connected_clients = Column(Integer, default=0)
    ssid = Column(String(100), nullable=True)
    channel = Column(String(50), nullable=True)
    power = Column(String(50), nullable=True)
    status = Column(String(50), default="Active")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    device = orm_relationship("DeviceInventory", back_populates="aps")

class DeviceHealth(Base):
    __tablename__ = "device_health"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("device_inventories.id", ondelete="CASCADE"), nullable=False)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    temperature = Column(Float, default=0.0)
    recorded_at = Column(DateTime, server_default=func.now())

    device = orm_relationship("DeviceInventory", back_populates="health_logs")

class DeviceSyncLog(Base):
    __tablename__ = "device_sync_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("device_inventories.id", ondelete="SET NULL"), nullable=True)
    sync_type = Column(String(50), nullable=False) # INVENTORY, INTERFACES, VLANS, APS
    status = Column(String(50), nullable=False) # SUCCESS, FAILED
    error_message = Column(String(500), nullable=True)
    response_metadata = Column(String(1000), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    device = orm_relationship("DeviceInventory")


class VisitorRequest(Base):
    __tablename__ = "visitor_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    visitor_name = Column(String(255), nullable=False)
    visitor_type = Column(String(100), nullable=False)  # Parent, Guest, Vendor, etc.
    phone_number = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    host_faculty = Column(String(255), nullable=True)
    visit_date = Column(Date, nullable=False)
    expected_arrival = Column(String(50), nullable=False)
    expected_departure = Column(String(50), nullable=False)
    status = Column(Enum('Pending', 'Approved', 'Rejected', 'Expired', name='visitor_request_status_enum'), default="Pending")
    approval_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    approver = orm_relationship("User", foreign_keys=[approval_by])


class GuestAccess(Base):
    __tablename__ = "guest_access"

    id = Column(Integer, primary_key=True, autoincrement=True)
    visitor_request_id = Column(Integer, ForeignKey("visitor_requests.id", ondelete="CASCADE"), nullable=True)
    username = Column(String(255), unique=True, nullable=False)
    temporary_password_hash = Column(String(255), nullable=False)
    ssid = Column(String(100), nullable=False, default="SecureCampus-Guest")
    vlan = Column(Integer, default=40)
    expires_at = Column(DateTime, nullable=False)
    status = Column(Enum('Active', 'Expired', 'Revoked', name='guest_access_status_enum'), default="Active")
    created_at = Column(DateTime, server_default=func.now())

    visitor_request = orm_relationship("VisitorRequest")


class StudentStatus(Base):
    __tablename__ = "student_status"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    attendance_status = Column(Enum('Present', 'Absent', 'Late', 'On Leave', name='attendance_status_enum'), default="Absent")
    current_location = Column(String(255), nullable=True)
    last_seen = Column(DateTime, server_default=func.now(), onupdate=func.now())
    current_course = Column(String(255), nullable=True)
    remarks = Column(Text, nullable=True)

    student = orm_relationship("User")


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_code = Column(String(50), nullable=False)
    exam_name = Column(String(255), nullable=False)
    classroom = Column(String(100), nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum('Scheduled', 'Active', 'Completed', 'Cancelled', name='exam_session_status_enum'), default="Scheduled")
    created_at = Column(DateTime, server_default=func.now())

    faculty = orm_relationship("User")


class ExamAccessLog(Base):
    __tablename__ = "exam_access_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_session_id = Column(Integer, ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    login_time = Column(DateTime, server_default=func.now())
    logout_time = Column(DateTime, nullable=True)
    device_name = Column(String(255), nullable=True)
    mac_address = Column(String(50), nullable=True)
    status = Column(Enum('Allowed', 'Blocked', 'Flagged', name='exam_access_status_enum'), default="Allowed")

    exam_session = orm_relationship("ExamSession")
    student = orm_relationship("User")


class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_type = Column(String(100), nullable=False) # FAILED_LOGINS, OFFLINE_DEVICE, HIGH_METRICS, etc.
    severity = Column(Enum('Low', 'Medium', 'High', 'Critical', name='severity_enum'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    device_id = Column(Integer, ForeignKey("device_inventories.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum('Active', 'Acknowledged', 'Resolved', 'Closed', name='alert_status_enum'), default="Active")
    confidence_score = Column(Float, default=1.0)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    device = orm_relationship("DeviceInventory")
    user = orm_relationship("User")
    recommendations = orm_relationship("SecurityRecommendation", back_populates="alert", cascade="all, delete-orphan")


class SecurityRecommendation(Base):
    __tablename__ = "security_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(Integer, ForeignKey("security_alerts.id", ondelete="CASCADE"), nullable=True)
    recommendation = Column(Text, nullable=False)
    priority = Column(Enum('Low', 'Medium', 'High', 'Critical', name='priority_enum'), default="Low")
    status = Column(Enum('Pending', 'Accepted', 'Implemented', 'Ignored', name='recommendation_status_enum'), default="Pending")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    alert = orm_relationship("SecurityAlert", back_populates="recommendations")


class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_name = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0)
    file_format = Column(String(10), nullable=False)
    generation_duration = Column(Float, default=0.0)
    download_count = Column(Integer, default=0)
    generated_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = orm_relationship("User")


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    total_users = Column(Integer, default=0)
    active_devices = Column(Integer, default=0)
    online_devices = Column(Integer, default=0)
    visitor_count = Column(Integer, default=0)
    exam_sessions = Column(Integer, default=0)
    failed_logins = Column(Integer, default=0)
    alerts_generated = Column(Integer, default=0)
    online_access_points = Column(Integer, default=0)
    offline_access_points = Column(Integer, default=0)
    online_switches = Column(Integer, default=0)
    offline_switches = Column(Integer, default=0)
    online_firewalls = Column(Integer, default=0)
    offline_firewalls = Column(Integer, default=0)
    captured_at = Column(DateTime, server_default=func.now())



