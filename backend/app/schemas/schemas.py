# backend/app/schemas/schemas.py
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, Any, Union, List
from datetime import datetime, date
import re

class UserBase(BaseModel):
    fullname: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        v_clean = v.strip()
        if not re.match(r'^[0-9]{10}$', v_clean):
            raise ValueError('Please enter a valid 10-digit mobile number.')
        return v_clean

class UserRegister(UserBase):
    password: str
    confirm_password: str
    role_id: int
    
    # Conditional fields based on role
    department: Optional[str] = None
    roll_number: Optional[str] = None
    employee_id: Optional[str] = None
    parent_student_roll: Optional[str] = None
    relationship: Optional[str] = None
    purpose: Optional[str] = None
    duration: Optional[str] = None # Stores Year for students, Expected Duration for guests
    
    profile_image: Optional[str] = None
    college_id_upload: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if ' ' in v:
            raise ValueError('Password cannot contain spaces.')
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&#]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&#)')
        return v

    @model_validator(mode='after')
    def validate_role_fields_and_passwords(self) -> 'UserRegister':
        # 1. Check passwords match
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")

        # 2. Email domain restriction for Student & Faculty
        clean_email = str(self.email).strip().lower()
        is_klu = clean_email.endswith('@kluniversity.in') or '.kluniversity.in' in clean_email

        if self.role_id == 3 and not is_klu:
            raise ValueError("Students must register using their official KL University email.")
        if self.role_id == 2 and not is_klu:
            raise ValueError("Faculty must register using their official KL University email.")

        # 3. Check conditional fields and formats by role_id
        # 2: Faculty, 3: Student, 4: Parent Visitor, 5: Guest
        if self.role_id == 2: # Faculty
            if not self.employee_id or not self.employee_id.strip():
                raise ValueError("Faculty ID is required for Faculty")
            emp_clean = self.employee_id.strip()
            if not re.match(r'^[0-9]{4,5}$', emp_clean):
                raise ValueError("Faculty ID must be exactly 4 or 5 digits numbers only.")
            if not self.department or not self.department.strip():
                raise ValueError("Department is required for Faculty")

        elif self.role_id == 3: # Student
            if not self.roll_number or not self.roll_number.strip():
                raise ValueError("Student ID is required for Students")
            roll_clean = self.roll_number.strip()
            if not re.match(r'^[0-9]{10}$', roll_clean):
                raise ValueError("Student ID must be exactly 10 digits numbers only.")
            if not self.department or not self.department.strip():
                raise ValueError("Department is required for Students")
            if not self.duration or not self.duration.strip() or self.duration not in ['1', '2', '3', '4']:
                raise ValueError("Year must be 1, 2, 3, or 4 for Students")

        elif self.role_id == 4: # Parent Visitor
            if not self.parent_student_roll or not self.parent_student_roll.strip():
                raise ValueError("Student Roll Number is required for Parents")
            if not self.relationship or not self.relationship.strip():
                raise ValueError("Relationship is required for Parents")

        elif self.role_id == 5: # Guest
            if not self.purpose or not self.purpose.strip():
                raise ValueError("Purpose of visit is required for Guests")
            if not self.duration or not self.duration.strip() or self.duration not in ['2 Hours', '4 Hours', '8 Hours', '1 Day']:
                raise ValueError("Expected Duration must be '2 Hours', '4 Hours', '8 Hours', or '1 Day' for Guests")
        return self

class UserLogin(BaseModel):
    email: str
    password: str
    portal: Optional[str] = None  # 'Admin', 'Student', 'Faculty', 'Parent'
    remember_me: bool = False
    
    # Metadata for sessions
    device_name: Optional[str] = "Unknown"
    browser: Optional[str] = "Unknown"
    operating_system: Optional[str] = "Unknown"
    ip_address: Optional[str] = "127.0.0.1"
    mac_address: Optional[str] = None

class FacultyMFARequiredResponse(BaseModel):
    mfa_required: bool = True
    is_mfa_setup: bool = False
    temp_token: str
    email: str
    qr_code_url: Optional[str] = None
    secret_key: Optional[str] = None

class FacultyMFAVerifyRequest(BaseModel):
    temp_token: str
    totp_code: str = Field(..., min_length=6, max_length=6)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

    @field_validator('otp')
    @classmethod
    def validate_otp_digits(cls, v):
        if not v.isdigit():
            raise ValueError("OTP must be numeric")
        return v

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str
    confirm_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        return UserRegister.validate_password_strength(v)

    @model_validator(mode='after')
    def validate_passwords_match(self) -> 'ResetPasswordRequest':
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class RoleResponse(BaseModel):
    id: int
    role_name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    fullname: str
    email: EmailStr
    phone: str
    role_id: int
    role: RoleResponse
    account_status: str
    profile_image: Optional[str] = None
    college_id_upload: Optional[str] = None
    is_verified: bool
    is_first_login: bool
    
    department: Optional[str] = None
    roll_number: Optional[str] = None
    employee_id: Optional[str] = None
    parent_student_roll: Optional[str] = None
    relationship: Optional[str] = None
    purpose: Optional[str] = None
    duration: Optional[str] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class SystemSettingsResponse(BaseModel):
    account_approval_mode: str
    theme: str
    maintenance_mode: bool
    allow_guest_registration: bool
    exam_mode: bool
    otp_expiry: int
    session_timeout: int
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    fullname: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    roll_number: Optional[str] = None
    parent_student_roll: Optional[str] = None
    relationship: Optional[str] = None
    purpose: Optional[str] = None
    duration: Optional[str] = None
    profile_image: Optional[str] = None
    college_id_upload: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    account_status: str

    @field_validator('account_status')
    @classmethod
    def validate_status(cls, v):
        valid = ['Active', 'Pending', 'Rejected', 'Suspended', 'Locked', 'Deleted']
        if v not in valid:
            raise ValueError(f"Status must be one of {valid}")
        return v

class AdminPasswordReset(BaseModel):
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        return UserRegister.validate_password_strength(v)

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        return UserRegister.validate_password_strength(v)

    @model_validator(mode='after')
    def validate_passwords_match(self) -> 'PasswordChangeRequest':
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class PermissionResponse(BaseModel):
    id: int
    permission_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class RoleWithPermissionsResponse(BaseModel):
    id: int
    role_name: str
    description: Optional[str] = None
    permissions: list[PermissionResponse]

    class Config:
        from_attributes = True

class RolePermissionsUpdate(BaseModel):
    permission_ids: list[int]

class SessionResponse(BaseModel):
    id: Optional[int] = None
    session_id: str
    user_id: int
    role: Optional[str] = None
    login_time: datetime
    logout_time: Optional[datetime] = None
    ip_address: Optional[str] = None
    device_name: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    mac_address: Optional[str] = None
    ssid: Optional[str] = None
    access_point: Optional[str] = None
    signal_strength: Optional[str] = None
    status: str
    session_status: Optional[str] = None
    last_activity: Optional[datetime] = None
    session_duration: Optional[int] = None

    class Config:
        from_attributes = True

class PaginatedUsersResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    size: int

class SystemSettingsUpdate(BaseModel):
    account_approval_mode: Optional[str] = None
    theme: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    allow_guest_registration: Optional[bool] = None
    exam_mode: Optional[bool] = None
    otp_expiry: Optional[int] = None
    session_timeout: Optional[int] = None

    @field_validator('account_approval_mode')
    @classmethod
    def validate_approval_mode(cls, v):
        if v is not None and v not in ['AUTO', 'ADMIN']:
            raise ValueError("Approval mode must be either AUTO or ADMIN")
        return v

class UserCreateByAdmin(BaseModel):
    fullname: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str
    role_id: int
    password: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    roll_number: Optional[str] = None
    parent_student_roll: Optional[str] = None
    relationship: Optional[str] = None
    purpose: Optional[str] = None
    duration: Optional[str] = None
    profile_image: Optional[str] = None
    college_id_upload: Optional[str] = None
    account_status: Optional[str] = "Active"

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not re.match(r'^\+?[0-9\s\-()]{7,20}$', v):
            raise ValueError("Invalid phone number format")
        return v

# --- Unified Response Wrappers ---
class SuccessResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully."
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[dict] = None

# --- Core Modules: Devices Schemas ---
class DeviceCreate(BaseModel):
    device_name: str = Field(..., min_length=2, max_length=100)
    model: str = Field(..., min_length=2, max_length=50)
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    device_type: str # Switch, Access Point, Firewall, Router
    status: Optional[str] = "Offline"

    @field_validator('device_name')
    @classmethod
    def validate_hostname(cls, v):
        # Basic hostname validator: alphanumeric, dots, hyphens
        if not re.match(r'^[a-zA-Z0-9.\-_]{1,253}$', v):
            raise ValueError("Device name must be a valid hostname string.")
        return v

    @field_validator('ip_address')
    @classmethod
    def validate_ip(cls, v):
        if not v:
            return v
        # Validate IPv4 or IPv6 format
        ipv4_regex = r'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
        ipv6_regex = r'^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$'
        if not (re.match(ipv4_regex, v) or re.match(ipv6_regex, v)):
            raise ValueError("IP address must be a valid IPv4 or IPv6 address.")
        return v

    @field_validator('mac_address')
    @classmethod
    def validate_mac(cls, v):
        if not v:
            return v
        if not re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', v):
            raise ValueError("MAC address must be in format XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX.")
        return v

    @field_validator('device_type')
    @classmethod
    def validate_type(cls, v):
        valid_types = ["Switch", "Access Point", "Firewall", "Router"]
        if v not in valid_types:
            raise ValueError(f"Device type must be one of: {', '.join(valid_types)}.")
        return v

class DeviceResponse(BaseModel):
    id: int
    device_name: str
    model: str
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    device_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedDevicesResponse(BaseModel):
    items: list[DeviceResponse]
    total: int
    page: int
    pages: int

# --- Core Modules: Subnets Schemas ---
class SubnetCreate(BaseModel):
    subnet_range: str = Field(..., min_length=5, max_length=50) # e.g. 192.168.1.0/24
    active_clients: Optional[int] = 0
    ap_count: Optional[int] = 0
    gateway: Optional[str] = None
    vlan_id: Optional[int] = None
    status: Optional[str] = "Active"

    @field_validator('subnet_range')
    @classmethod
    def validate_cidr(cls, v):
        # Basic CIDR notation check: e.g. IP/Mask
        if not re.match(r'^([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}$', v):
            raise ValueError("Subnet range must be in valid CIDR format (e.g. 192.168.1.0/24).")
        return v

    @field_validator('vlan_id')
    @classmethod
    def validate_vlan(cls, v):
        if v is not None and (v < 1 or v > 4094):
            raise ValueError("VLAN ID must be an integer between 1 and 4094.")
        return v

    @field_validator('gateway')
    @classmethod
    def validate_gateway(cls, v):
        if not v:
            return v
        ipv4_regex = r'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
        if not re.match(ipv4_regex, v):
            raise ValueError("Gateway IP must be a valid IPv4 address.")
        return v

class SubnetResponse(BaseModel):
    id: int
    subnet_range: str
    active_clients: int
    ap_count: int
    gateway: Optional[str] = None
    vlan_id: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedSubnetsResponse(BaseModel):
    items: list[SubnetResponse]
    total: int
    page: int
    pages: int

# --- Core Modules: Security Policies (Firewall Rules) Schemas ---
class SecurityPolicyCreate(BaseModel):
    priority: int = Field(..., gt=0)
    source_ip: str = Field(..., min_length=2, max_length=50) # IP, CIDR or "any"
    destination: str = Field(..., min_length=2, max_length=50) # IP, CIDR or "any"
    protocol: str # TCP, UDP, ICMP
    policy: str # Allow, Deny, Reject
    status: Optional[str] = "Active"

    @field_validator('protocol')
    @classmethod
    def validate_protocol(cls, v):
        valid = ["TCP", "UDP", "ICMP", "ANY"]
        if v.upper() not in valid:
            raise ValueError("Protocol must be one of: TCP, UDP, ICMP, ANY.")
        return v.upper()

    @field_validator('policy')
    @classmethod
    def validate_policy(cls, v):
        valid = ["ALLOW", "DENY", "REJECT"]
        if v.upper() not in valid:
            raise ValueError("Policy action must be one of: ALLOW, DENY, REJECT.")
        return v.upper()

class SecurityPolicyResponse(BaseModel):
    id: int
    priority: int
    source_ip: str
    destination: str
    protocol: str
    policy: str
    logs_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedSecurityPoliciesResponse(BaseModel):
    items: list[SecurityPolicyResponse]
    total: int
    page: int
    pages: int

# --- Core Modules: Report Requests Schemas ---
class ReportRequestCreate(BaseModel):
    report_name: str = Field(..., min_length=2, max_length=255)
    report_type: str = Field(..., min_length=2, max_length=100) # Threat logs, session activity, rules log

class ReportRequestResponse(BaseModel):
    id: int
    report_name: str
    generated_by: Optional[int] = None
    report_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedReportRequestsResponse(BaseModel):
    items: list[ReportRequestResponse]
    total: int
    page: int
    pages: int

# --- Stage 6: Juniper Hardware Schemas ---

class DeviceInventoryResponse(BaseModel):
    id: int
    hostname: str
    model: str
    serial_number: Optional[str] = None
    os_version: Optional[str] = None
    uptime: Optional[str] = None
    management_ip: Optional[str] = None
    mac_address: Optional[str] = None
    device_type: str
    status: str
    last_synced_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NetworkInterfaceResponse(BaseModel):
    id: int
    device_id: int
    interface_name: str
    speed: Optional[str] = None
    status: str
    description: Optional[str] = None
    mac_address: Optional[str] = None
    ip_address: Optional[str] = None
    error_count: int
    updated_at: datetime

    class Config:
        from_attributes = True

class VlanInventoryResponse(BaseModel):
    id: int
    device_id: int
    vlan_id: int
    vlan_name: str
    subnet: Optional[str] = None
    gateway: Optional[str] = None
    associated_interfaces: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class WirelessAccessPointResponse(BaseModel):
    id: int
    device_id: int
    ap_name: str
    model: str
    firmware_version: Optional[str] = None
    connected_clients: int
    ssid: Optional[str] = None
    channel: Optional[str] = None
    power: Optional[str] = None
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class DeviceHealthResponse(BaseModel):
    id: int
    device_id: int
    cpu_usage: float
    memory_usage: float
    temperature: float
    recorded_at: datetime

    class Config:
        from_attributes = True

class DeviceSyncLogResponse(BaseModel):
    id: int
    device_id: Optional[int] = None
    sync_type: str
    status: str
    error_message: Optional[str] = None
    response_metadata: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Visitor Module Schemas ---

class VisitorRequestCreate(BaseModel):
    visitor_name: str = Field(..., min_length=2, max_length=100)
    visitor_type: str = Field(..., min_length=2, max_length=50) # Parent, Guest, Vendor, etc.
    phone_number: str
    email: EmailStr
    purpose: str = Field(..., min_length=5)
    host_faculty: Optional[str] = None
    visit_date: date
    expected_arrival: str = Field(..., pattern=r'^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$') # HH:MM format
    expected_departure: str = Field(..., pattern=r'^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$') # HH:MM format

    @field_validator('phone_number')
    @classmethod
    def validate_phone(cls, v):
        if not re.match(r'^\+?[0-9\s\-()]{7,20}$', v):
            raise ValueError('Invalid phone number format')
        return v

class VisitorRequestResponse(BaseModel):
    id: int
    visitor_name: str
    visitor_type: str
    phone_number: str
    email: EmailStr
    purpose: str
    host_faculty: Optional[str] = None
    visit_date: date
    expected_arrival: str
    expected_departure: str
    status: str
    approval_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class GuestAccessResponse(BaseModel):
    id: int
    visitor_request_id: Optional[int] = None
    username: str
    temporary_password: Optional[str] = None # Transient plaintext password shown only once
    ssid: str
    vlan: int
    expires_at: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class StudentStatusResponse(BaseModel):
    id: int
    student_id: int
    attendance_status: str
    current_location: Optional[str] = None
    last_seen: datetime
    current_course: Optional[str] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True


# --- Exam Module Schemas ---

class ExamSessionCreate(BaseModel):
    course_code: str = Field(..., min_length=3, max_length=15, pattern=r'^[A-Z0-9\-]+$')
    exam_name: str = Field(..., min_length=3, max_length=100)
    classroom: str = Field(..., min_length=2, max_length=50)
    start_time: datetime
    end_time: datetime

    @model_validator(mode='after')
    def validate_times(self) -> 'ExamSessionCreate':
        if self.start_time >= self.end_time:
            raise ValueError('start_time must be earlier than end_time')
        return self

class ExamSessionResponse(BaseModel):
    id: int
    course_code: str
    exam_name: str
    classroom: str
    faculty_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExamAccessRequest(BaseModel):
    exam_session_id: int
    student_id: int
    device_name: Optional[str] = None
    mac_address: str = Field(..., pattern=r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
    logout: Optional[bool] = False

class ExamAccessLogResponse(BaseModel):
    id: int
    exam_session_id: int
    student_id: int
    login_time: datetime
    logout_time: Optional[datetime] = None
    device_name: Optional[str] = None
    mac_address: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class SecurityRecommendationResponse(BaseModel):
    id: int
    alert_id: Optional[int] = None
    recommendation: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SecurityAlertResponse(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    description: Optional[str] = None
    device_id: Optional[int] = None
    user_id: Optional[int] = None
    status: str
    confidence_score: float
    created_at: datetime
    recommendations: List[SecurityRecommendationResponse] = []

    class Config:
        from_attributes = True


class SecurityAlertUpdate(BaseModel):
    status: str = Field(..., pattern=r'^(Active|Acknowledged|Resolved|Closed)$')


class SecurityRecommendationUpdate(BaseModel):
    status: str = Field(..., pattern=r'^(Pending|Accepted|Implemented|Ignored)$')


class GeneratedReportResponse(BaseModel):
    id: int
    report_name: str
    report_type: str
    generated_by: Optional[int] = None
    file_name: str
    file_size: int
    file_format: str
    generation_duration: float
    download_count: int
    generated_at: datetime

    class Config:
        from_attributes = True


class GeneratedReportCreate(BaseModel):
    report_name: str
    report_type: str = Field(..., pattern=r'^(Security Summary|Login Activity|Visitor Activity|Exam Sessions|Device Inventory|Device Health|Firewall Policies|Alert History)$')
    file_format: str = Field(..., pattern=r'^(PDF|CSV|Excel)$')


class AnalyticsSnapshotResponse(BaseModel):
    id: int
    total_users: int
    active_devices: int
    online_devices: int
    visitor_count: int
    exam_sessions: int
    failed_logins: int
    alerts_generated: int
    online_access_points: int
    offline_access_points: int
    online_switches: int
    offline_switches: int
    online_firewalls: int
    offline_firewalls: int
    captured_at: datetime

    class Config:
        from_attributes = True





