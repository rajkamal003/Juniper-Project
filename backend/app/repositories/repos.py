# backend/app/repositories/repos.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from app.models.models import (
    User, UserSession, PasswordReset, ActivityLog, SystemSetting, Notification, Role,
    NetworkDevice, NetworkSubnet, SecurityPolicy, ReportRequest,
    DeviceInventory, NetworkInterface, VlanInventory, WirelessAccessPoint, DeviceHealth, DeviceSyncLog
)

class UserRepo:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

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
        query = db.query(User)
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


