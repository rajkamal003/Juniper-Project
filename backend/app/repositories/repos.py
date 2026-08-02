# backend/app/repositories/repos.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from app.models.models import (
    User, UserSession, PasswordReset, ActivityLog, SystemSetting, Notification, Role,
    NetworkDevice, NetworkSubnet, SecurityPolicy, ReportRequest,
    DeviceInventory, NetworkInterface, VlanInventory, WirelessAccessPoint, DeviceHealth, DeviceSyncLog,
    VisitorRequest, GuestAccess, StudentStatus, ExamSession, ExamAccessLog,
    SecurityAlert, SecurityRecommendation, GeneratedReport, AnalyticsSnapshot
)

class UserRepo:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> User:
        return db.query(User).filter(User.phone == phone).first()

    @staticmethod
    def get_by_roll_number(db: Session, roll_number: str) -> User:
        return db.query(User).filter(User.roll_number == roll_number).first()

    @staticmethod
    def get_by_employee_id(db: Session, employee_id: str) -> User:
        return db.query(User).filter(User.employee_id == employee_id).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user: User, updates: dict) -> User:
        for key, value in updates.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_users(
        db: Session,
        search: str = None,
        role_id: int = None,
        account_status: str = None,
        department: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        from sqlalchemy.orm import joinedload
        query = db.query(User).options(joinedload(User.role))
        if search:
            search_pattern = f"%{search}%"
            # Support search by Name, Email, Phone, Roll Number, Employee ID
            query = query.filter(
                (User.fullname.ilike(search_pattern)) |
                (User.email.ilike(search_pattern)) |
                (User.phone.ilike(search_pattern)) |
                (User.roll_number.ilike(search_pattern)) |
                (User.employee_id.ilike(search_pattern)) |
                (User.parent_student_roll.ilike(search_pattern))
            )
        if role_id is not None:
            query = query.filter(User.role_id == role_id)
        if account_status:
            query = query.filter(User.account_status == account_status)
        if department:
            query = query.filter(User.department == department)

        total = query.count()
        users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
        return users, total

    @staticmethod
    def delete_permanent(db: Session, user: User) -> None:
        """Permanently delete a user and all cascade-related records.
        
        Cascade map (from models.py):
          user_sessions    → cascade="all, delete-orphan"   → deleted automatically
          password_reset   → cascade="all, delete-orphan"   → deleted automatically
          notifications    → cascade="all, delete-orphan"   → deleted automatically
          activity_logs    → ondelete="SET NULL"             → user_id set to NULL (preserved for audit)
        """
        db.delete(user)
        db.commit()


class SessionRepo:
    @staticmethod
    def create(db: Session, user_session: UserSession) -> UserSession:
        db.add(user_session)
        db.commit()
        db.refresh(user_session)
        return user_session

    @staticmethod
    def get_by_id(db: Session, session_id: str) -> UserSession:
        return db.query(UserSession).filter(UserSession.session_id == session_id).first()

    @staticmethod
    def update(db: Session, session: UserSession, updates: dict) -> UserSession:
        for key, value in updates.items():
            setattr(session, key, value)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def revoke_all_for_user(db: Session, user_id: int):
        db.query(UserSession).filter(
            UserSession.user_id == user_id, 
            UserSession.status == 'Active'
        ).update({"status": "Expired", "logout_time": datetime.utcnow()})
        db.commit()

    @staticmethod
    def get_active_sessions_for_user(db: Session, user_id: int) -> list[UserSession]:
        return db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.status == 'Active'
        ).order_by(desc(UserSession.login_time)).all()

class ResetRepo:
    @staticmethod
    def create(db: Session, pwd_reset: PasswordReset) -> PasswordReset:
        db.add(pwd_reset)
        db.commit()
        db.refresh(pwd_reset)
        return pwd_reset

    @staticmethod
    def get_latest_active_by_user(db: Session, user_id: int) -> PasswordReset:
        return db.query(PasswordReset).filter(
            PasswordReset.user_id == user_id,
            PasswordReset.used == False,
            PasswordReset.expiry > datetime.utcnow()
        ).order_by(desc(PasswordReset.created_at)).first()

    @staticmethod
    def increment_attempts(db: Session, pwd_reset: PasswordReset) -> PasswordReset:
        pwd_reset.otp_attempts += 1
        db.commit()
        db.refresh(pwd_reset)
        return pwd_reset

    @staticmethod
    def mark_used(db: Session, pwd_reset: PasswordReset) -> PasswordReset:
        pwd_reset.used = True
        db.commit()
        db.refresh(pwd_reset)
        return pwd_reset

class LogRepo:
    @staticmethod
    def log(db: Session, user_id: int, action: str, description: str, ip: str) -> ActivityLog:
        log_entry = ActivityLog(
            user_id=user_id,
            action=action,
            description=description,
            ip=ip
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

class SettingRepo:
    @staticmethod
    def get(db: Session) -> SystemSetting:
        return db.query(SystemSetting).filter(SystemSetting.id == 1).first()

    @staticmethod
    def update(db: Session, settings_instance: SystemSetting, updates: dict) -> SystemSetting:
        for key, value in updates.items():
            setattr(settings_instance, key, value)
        db.commit()
        db.refresh(settings_instance)
        return settings_instance

class NotificationRepo:
    @staticmethod
    def create(db: Session, user_id: int, title: str, message: str, type: str) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

class DeviceRepo:
    @staticmethod
    def get_by_id(db: Session, device_id: int) -> NetworkDevice:
        return db.query(NetworkDevice).filter(
            NetworkDevice.id == device_id,
            NetworkDevice.is_deleted == False
        ).first()

    @staticmethod
    def create(db: Session, device: NetworkDevice) -> NetworkDevice:
        db.add(device)
        return device

    @staticmethod
    def update(db: Session, device: NetworkDevice, updates: dict) -> NetworkDevice:
        for key, value in updates.items():
            setattr(device, key, value)
        return device

    @staticmethod
    def get_devices(
        db: Session,
        search: str = None,
        device_type: str = None,
        status: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(NetworkDevice).filter(NetworkDevice.is_deleted == False)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (NetworkDevice.device_name.ilike(search_pattern)) |
                (NetworkDevice.ip_address.ilike(search_pattern)) |
                (NetworkDevice.mac_address.ilike(search_pattern)) |
                (NetworkDevice.model.ilike(search_pattern))
            )
        if device_type:
            query = query.filter(NetworkDevice.device_type == device_type)
        if status:
            query = query.filter(NetworkDevice.status == status)

        total = query.count()
        items = query.order_by(desc(NetworkDevice.created_at)).offset(skip).limit(limit).all()
        return items, total

class SubnetRepo:
    @staticmethod
    def get_by_id(db: Session, subnet_id: int) -> NetworkSubnet:
        return db.query(NetworkSubnet).filter(
            NetworkSubnet.id == subnet_id,
            NetworkSubnet.is_deleted == False
        ).first()

    @staticmethod
    def create(db: Session, subnet: NetworkSubnet) -> NetworkSubnet:
        db.add(subnet)
        return subnet

    @staticmethod
    def update(db: Session, subnet: NetworkSubnet, updates: dict) -> NetworkSubnet:
        for key, value in updates.items():
            setattr(subnet, key, value)
        return subnet

    @staticmethod
    def get_subnets(
        db: Session,
        search: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(NetworkSubnet).filter(NetworkSubnet.is_deleted == False)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (NetworkSubnet.subnet_range.ilike(search_pattern)) |
                (NetworkSubnet.gateway.ilike(search_pattern))
            )

        total = query.count()
        items = query.order_by(desc(NetworkSubnet.created_at)).offset(skip).limit(limit).all()
        return items, total

class PolicyRepo:
    @staticmethod
    def get_by_id(db: Session, policy_id: int) -> SecurityPolicy:
        return db.query(SecurityPolicy).filter(
            SecurityPolicy.id == policy_id,
            SecurityPolicy.is_deleted == False
        ).first()

    @staticmethod
    def create(db: Session, policy: SecurityPolicy) -> SecurityPolicy:
        db.add(policy)
        return policy

    @staticmethod
    def update(db: Session, policy: SecurityPolicy, updates: dict) -> SecurityPolicy:
        for key, value in updates.items():
            setattr(policy, key, value)
        return policy

    @staticmethod
    def get_policies(
        db: Session,
        search: str = None,
        protocol: str = None,
        policy_action: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(SecurityPolicy).filter(SecurityPolicy.is_deleted == False)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (SecurityPolicy.source_ip.ilike(search_pattern)) |
                (SecurityPolicy.destination.ilike(search_pattern))
            )
        if protocol:
            query = query.filter(SecurityPolicy.protocol == protocol)
        if policy_action:
            query = query.filter(SecurityPolicy.policy == policy_action)

        total = query.count()
        items = query.order_by(SecurityPolicy.priority).offset(skip).limit(limit).all()
        return items, total

class ReportRepo:
    @staticmethod
    def get_by_id(db: Session, report_id: int) -> ReportRequest:
        return db.query(ReportRequest).filter(ReportRequest.id == report_id).first()

    @staticmethod
    def create(db: Session, report: ReportRequest) -> ReportRequest:
        db.add(report)
        return report

    @staticmethod
    def get_reports(
        db: Session,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(ReportRequest)
        total = query.count()
        items = query.order_by(desc(ReportRequest.created_at)).offset(skip).limit(limit).all()
        return items, total

class JuniperRepo:
    @staticmethod
    def get_device_by_model(db: Session, model: str) -> DeviceInventory:
        return db.query(DeviceInventory).filter(DeviceInventory.model == model).first()

    @staticmethod
    def get_all_devices(db: Session):
        return db.query(DeviceInventory).order_by(DeviceInventory.id).all()

    @staticmethod
    def upsert_device(db: Session, device_data: dict) -> DeviceInventory:
        device = db.query(DeviceInventory).filter(DeviceInventory.model == device_data["model"]).first()
        if not device:
            device = DeviceInventory(**device_data)
            db.add(device)
        else:
            for k, v in device_data.items():
                setattr(device, k, v)
        db.flush()
        return device

    @staticmethod
    def clear_and_add_interfaces(db: Session, device_id: int, interfaces_data: list):
        db.query(NetworkInterface).filter(NetworkInterface.device_id == device_id).delete()
        interfaces = [NetworkInterface(device_id=device_id, **data) for data in interfaces_data]
        db.add_all(interfaces)
        return interfaces

    @staticmethod
    def get_interfaces_by_device(db: Session, device_id: int = None):
        query = db.query(NetworkInterface)
        if device_id:
            query = query.filter(NetworkInterface.device_id == device_id)
        return query.order_by(NetworkInterface.interface_name).all()

    @staticmethod
    def clear_and_add_vlans(db: Session, device_id: int, vlans_data: list):
        db.query(VlanInventory).filter(VlanInventory.device_id == device_id).delete()
        vlans = [VlanInventory(device_id=device_id, **data) for data in vlans_data]
        db.add_all(vlans)
        return vlans

    @staticmethod
    def get_all_vlans(db: Session):
        return db.query(VlanInventory).order_by(VlanInventory.vlan_id).all()

    @staticmethod
    def clear_and_add_aps(db: Session, device_id: int, aps_data: list):
        db.query(WirelessAccessPoint).filter(WirelessAccessPoint.device_id == device_id).delete()
        aps = [WirelessAccessPoint(device_id=device_id, **data) for data in aps_data]
        db.add_all(aps)
        return aps

    @staticmethod
    def get_all_aps(db: Session):
        return db.query(WirelessAccessPoint).order_by(WirelessAccessPoint.ap_name).all()

    @staticmethod
    def add_health_record(db: Session, health_data: dict) -> DeviceHealth:
        health = DeviceHealth(**health_data)
        db.add(health)
        return health

    @staticmethod
    def get_latest_health(db: Session):
        return db.query(DeviceHealth).order_by(desc(DeviceHealth.recorded_at)).limit(10).all()

    @staticmethod
    def log_sync(db: Session, sync_data: dict) -> DeviceSyncLog:
        log = DeviceSyncLog(**sync_data)
        db.add(log)
        return log

    @staticmethod
    def get_sync_logs(db: Session, limit: int = 20):
        return db.query(DeviceSyncLog).order_by(desc(DeviceSyncLog.created_at)).limit(limit).all()


class VisitorRepo:
    @staticmethod
    def get_by_id(db: Session, request_id: int) -> VisitorRequest:
        return db.query(VisitorRequest).filter(VisitorRequest.id == request_id).first()

    @staticmethod
    def create(db: Session, request: VisitorRequest) -> VisitorRequest:
        db.add(request)
        return request

    @staticmethod
    def get_requests(
        db: Session,
        visitor_type: str = None,
        status: str = None,
        search: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(VisitorRequest)
        if visitor_type:
            query = query.filter(VisitorRequest.visitor_type == visitor_type)
        if status:
            query = query.filter(VisitorRequest.status == status)
        if search:
            query = query.filter(
                (VisitorRequest.visitor_name.like(f"%{search}%")) |
                (VisitorRequest.email.like(f"%{search}%")) |
                (VisitorRequest.phone_number.like(f"%{search}%"))
            )
        total = query.count()
        items = query.order_by(desc(VisitorRequest.created_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_guest_access_by_request_id(db: Session, request_id: int) -> GuestAccess:
        return db.query(GuestAccess).filter(GuestAccess.visitor_request_id == request_id).first()

    @staticmethod
    def create_guest_access(db: Session, guest: GuestAccess) -> GuestAccess:
        db.add(guest)
        return guest

    @staticmethod
    def get_guest_access_by_username(db: Session, username: str) -> GuestAccess:
        return db.query(GuestAccess).filter(GuestAccess.username == username).first()

    @staticmethod
    def get_guest_access_list(
        db: Session,
        status: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(GuestAccess)
        if status:
            query = query.filter(GuestAccess.status == status)
        total = query.count()
        items = query.order_by(desc(GuestAccess.created_at)).offset(skip).limit(limit).all()
        return items, total


class StudentStatusRepo:
    @staticmethod
    def get_by_student_id(db: Session, student_id: int) -> StudentStatus:
        return db.query(StudentStatus).filter(StudentStatus.student_id == student_id).first()

    @staticmethod
    def upsert(db: Session, status_data: dict) -> StudentStatus:
        status_obj = db.query(StudentStatus).filter(StudentStatus.student_id == status_data["student_id"]).first()
        if not status_obj:
            status_obj = StudentStatus(**status_data)
            db.add(status_obj)
        else:
            for k, v in status_data.items():
                setattr(status_obj, k, v)
        db.flush()
        return status_obj


class ExamRepo:
    @staticmethod
    def get_session_by_id(db: Session, session_id: int) -> ExamSession:
        return db.query(ExamSession).filter(ExamSession.id == session_id).first()

    @staticmethod
    def create_session(db: Session, session: ExamSession) -> ExamSession:
        db.add(session)
        return session

    @staticmethod
    def delete_session(db: Session, session: ExamSession):
        db.delete(session)

    @staticmethod
    def get_sessions(
        db: Session,
        status: str = None,
        search: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(ExamSession)
        if status:
            query = query.filter(ExamSession.status == status)
        if search:
            query = query.filter(
                (ExamSession.exam_name.like(f"%{search}%")) |
                (ExamSession.course_code.like(f"%{search}%")) |
                (ExamSession.classroom.like(f"%{search}%"))
            )
        total = query.count()
        items = query.order_by(desc(ExamSession.created_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_access_logs(
        db: Session,
        exam_session_id: int = None,
        student_id: int = None,
        status: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(ExamAccessLog)
        if exam_session_id is not None:
            query = query.filter(ExamAccessLog.exam_session_id == exam_session_id)
        if student_id is not None:
            query = query.filter(ExamAccessLog.student_id == student_id)
        if status:
            query = query.filter(ExamAccessLog.status == status)
        total = query.count()
        items = query.order_by(desc(ExamAccessLog.login_time)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_active_access_log(db: Session, exam_session_id: int, student_id: int) -> ExamAccessLog:
        return db.query(ExamAccessLog).filter(
            ExamAccessLog.exam_session_id == exam_session_id,
            ExamAccessLog.student_id == student_id,
            ExamAccessLog.logout_time.is_(None)
        ).first()

    @staticmethod
    def create_access_log(db: Session, log: ExamAccessLog) -> ExamAccessLog:
        db.add(log)
        return log


class SecurityAlertRepo:
    @staticmethod
    def get_alerts(
        db: Session,
        status: str = None,
        severity: str = None,
        search: str = None,
        skip: int = 0,
        limit: int = 20
    ):
        query = db.query(SecurityAlert)
        if status:
            query = query.filter(SecurityAlert.status == status)
        if severity:
            query = query.filter(SecurityAlert.severity == severity)
        if search:
            query = query.filter(
                (SecurityAlert.title.like(f"%{search}%")) |
                (SecurityAlert.description.like(f"%{search}%")) |
                (SecurityAlert.alert_type.like(f"%{search}%"))
            )
        total = query.count()
        items = query.order_by(desc(SecurityAlert.created_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_by_id(db: Session, alert_id: int) -> SecurityAlert:
        return db.query(SecurityAlert).filter(SecurityAlert.id == alert_id).first()

    @staticmethod
    def create(db: Session, alert: SecurityAlert) -> SecurityAlert:
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def update(db: Session, alert: SecurityAlert, updates: dict) -> SecurityAlert:
        for k, v in updates.items():
            setattr(alert, k, v)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def get_recent_active_by_type_and_device(db: Session, alert_type: str, device_id: int, window_hours: int = 1) -> SecurityAlert:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(hours=window_hours)
        return db.query(SecurityAlert).filter(
            SecurityAlert.alert_type == alert_type,
            SecurityAlert.device_id == device_id,
            SecurityAlert.status == 'Active',
            SecurityAlert.created_at >= cutoff
        ).order_by(desc(SecurityAlert.created_at)).first()


class SecurityRecommendationRepo:
    @staticmethod
    def get_recommendations(
        db: Session,
        status: str = None,
        priority: str = None,
        search: str = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(SecurityRecommendation)
        if status:
            query = query.filter(SecurityRecommendation.status == status)
        if priority:
            query = query.filter(SecurityRecommendation.priority == priority)
        if search:
            query = query.filter(SecurityRecommendation.recommendation.like(f"%{search}%"))
        total = query.count()
        items = query.order_by(desc(SecurityRecommendation.created_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_by_id(db: Session, rec_id: int) -> SecurityRecommendation:
        return db.query(SecurityRecommendation).filter(SecurityRecommendation.id == rec_id).first()

    @staticmethod
    def create(db: Session, rec: SecurityRecommendation) -> SecurityRecommendation:
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec

    @staticmethod
    def update(db: Session, rec: SecurityRecommendation, updates: dict) -> SecurityRecommendation:
        for k, v in updates.items():
            setattr(rec, k, v)
        db.commit()
        db.refresh(rec)
        return rec


class GeneratedReportRepo:
    @staticmethod
    def get_reports(
        db: Session,
        search: str = None,
        skip: int = 0,
        limit: int = 20
    ):
        query = db.query(GeneratedReport)
        if search:
            query = query.filter(
                (GeneratedReport.report_name.like(f"%{search}%")) |
                (GeneratedReport.report_type.like(f"%{search}%")) |
                (GeneratedReport.file_format.like(f"%{search}%"))
            )
        total = query.count()
        items = query.order_by(desc(GeneratedReport.generated_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_by_id(db: Session, report_id: int) -> GeneratedReport:
        return db.query(GeneratedReport).filter(GeneratedReport.id == report_id).first()

    @staticmethod
    def create(db: Session, report: GeneratedReport) -> GeneratedReport:
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def update(db: Session, report: GeneratedReport, updates: dict) -> GeneratedReport:
        for k, v in updates.items():
            setattr(report, k, v)
        db.commit()
        db.refresh(report)
        return report


class AnalyticsSnapshotRepo:
    @staticmethod
    def get_snapshots(
        db: Session,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(AnalyticsSnapshot)
        total = query.count()
        items = query.order_by(desc(AnalyticsSnapshot.captured_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def create(db: Session, snapshot: AnalyticsSnapshot) -> AnalyticsSnapshot:
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot




