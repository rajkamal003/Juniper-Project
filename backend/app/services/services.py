# backend/app/services/services.py
import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.models.models import (
    User, UserSession, PasswordReset, SystemSetting,
    NetworkDevice, NetworkSubnet, SecurityPolicy, ReportRequest,
    DeviceInventory, NetworkInterface, VlanInventory, WirelessAccessPoint, DeviceHealth, DeviceSyncLog
)
from app.repositories.repos import (
    UserRepo, SessionRepo, ResetRepo, LogRepo, SettingRepo, NotificationRepo,
    DeviceRepo, SubnetRepo, PolicyRepo, ReportRepo, JuniperRepo
)
from app.services.juniper_service import JuniperDriver
from app.schemas.schemas import (
    UserRegister, UserLogin, VerifyOTPRequest, ResetPasswordRequest,
    DeviceCreate, SubnetCreate, SecurityPolicyCreate, ReportRequestCreate
)
from app.utils.auth_utils import hash_password, verify_password, create_access_token, create_refresh_token, decode_refresh_token
from app.utils.otp_utils import generate_otp, hash_otp, verify_otp_hash
from app.config.config import settings

class AuthService:
    @staticmethod
    def register(db: Session, payload: UserRegister, ip_address: str) -> User:
        # Check duplicate email
        existing_user = UserRepo.get_by_email(db, payload.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered"
            )

        # Get system settings for approval mode
        system_settings = SettingRepo.get(db)
        approval_mode = system_settings.account_approval_mode if system_settings else "AUTO"
        initial_status = "Active" if approval_mode == "AUTO" else "Pending"

        # Create user model
        hashed = hash_password(payload.password)
        new_user = User(
            fullname=payload.fullname,
            email=payload.email,
            phone=payload.phone,
            password_hash=hashed,
            role_id=payload.role_id,
            account_status=initial_status,
            department=payload.department,
            roll_number=payload.roll_number,
            employee_id=payload.employee_id,
            parent_student_roll=payload.parent_student_roll,
            relationship=payload.relationship,
            purpose=payload.purpose,
            duration=payload.duration, # Stores Student Year or Guest Duration
            profile_image=payload.profile_image,
            college_id_upload=payload.college_id_upload
        )
        
        created_user = UserRepo.create(db, new_user)
        LogRepo.log(
            db, 
            user_id=created_user.id, 
            action="REGISTER", 
            description=f"Account registered. Status set to: {initial_status}", 
            ip=ip_address
        )
        
        # Create initial notification
        NotificationRepo.create(
            db,
            user_id=created_user.id,
            title="Welcome to SecureCampus AI",
            message=f"Hi {created_user.fullname}, your account registration was successful. Status: {initial_status}",
            type="Info"
        )
        
        return created_user

    @staticmethod
    def login(db: Session, payload: UserLogin, client_ip: str) -> dict:
        user = UserRepo.get_by_email(db, payload.email)
        if not user:
            LogRepo.log(db, user_id=None, action="LOGIN_FAILED", description=f"Failed login attempt for email: {payload.email}", ip=client_ip)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Check if account is locked or suspended
        if user.account_status == "Locked" or user.account_locked:
            LogRepo.log(db, user_id=user.id, action="LOGIN_BLOCKED", description="Blocked login attempt on Locked account", ip=client_ip)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is locked due to multiple failed login attempts. Please reset your password."
            )
        
        if user.account_status in ["Suspended", "Rejected"]:
            LogRepo.log(db, user_id=user.id, action="LOGIN_BLOCKED", description=f"Blocked login attempt. Status: {user.account_status}", ip=client_ip)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your account status is {user.account_status}. Please contact system administrator."
            )
        
        if user.account_status == "Pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account registration is pending administrator approval."
            )

        # Verify password
        if not verify_password(payload.password, user.password_hash):
            # Increment failed attempts
            failed_attempts = user.failed_login_attempts + 1
            updates = {"failed_login_attempts": failed_attempts}
            
            if failed_attempts >= 5:
                updates["account_status"] = "Locked"
                updates["account_locked"] = True
                LogRepo.log(db, user_id=user.id, action="ACCOUNT_LOCK", description="Account locked after 5 failed login attempts", ip=client_ip)
                NotificationRepo.create(
                    db,
                    user_id=user.id,
                    title="Account Security Alert",
                    message="Your account has been locked due to 5 consecutive failed login attempts. Please reset your password.",
                    type="Alert"
                )
            else:
                LogRepo.log(db, user_id=user.id, action="LOGIN_FAILED", description=f"Incorrect password attempt {failed_attempts}/5", ip=client_ip)
            
            UserRepo.update(db, user, updates)
            
            error_msg = "Invalid credentials"
            if failed_attempts >= 5:
                error_msg = "Account is locked due to multiple failed login attempts. Please reset your password."
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_msg
            )

        # Clear login failures on success
        updates = {
            "failed_login_attempts": 0,
            "last_login": datetime.utcnow()
        }
        UserRepo.update(db, user, updates)

        # Create session tracking record
        session_id = str(uuid.uuid4())
        user_session = UserSession(
            session_id=session_id,
            user_id=user.id,
            device_name=payload.device_name,
            browser=payload.browser,
            operating_system=payload.operating_system,
            ip_address=client_ip,
            mac_address=payload.mac_address,
            status="Active"
        )
        SessionRepo.create(db, user_session)

        # Generate tokens
        token_data = {"sub": str(user.id), "email": user.email, "session_id": session_id}
        
        # Remember Me alters Token Expiries
        refresh_expires = timedelta(days=7) if payload.remember_me else timedelta(hours=24)
        
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data, expires_delta=refresh_expires)

        LogRepo.log(db, user_id=user.id, action="LOGIN", description=f"Successful login. Session: {session_id}", ip=client_ip)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user
        }

    @staticmethod
    def logout(db: Session, session_id: str, client_ip: str):
        session = SessionRepo.get_by_id(db, session_id)
        if not session or session.status != "Active":
            return
        
        logout_time = datetime.utcnow()
        duration = int((logout_time - session.login_time).total_seconds())
        
        SessionRepo.update(db, session, {
            "status": "LoggedOut",
            "logout_time": logout_time,
            "session_duration": duration
        })
        
        LogRepo.log(db, user_id=session.user_id, action="LOGOUT", description=f"Session ended. Duration: {duration}s", ip=client_ip)

    @staticmethod
    def refresh_session_tokens(db: Session, refresh_token: str, client_ip: str) -> dict:
        # Decode refresh token
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        user_id = int(payload.get("sub"))
        session_id = payload.get("session_id")
        
        user = UserRepo.get_by_id(db, user_id)
        if not user or user.account_status != "Active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        # Check session status in DB
        session = SessionRepo.get_by_id(db, session_id)
        if not session or session.status != "Active":
            # REPLAY ATTACK / REVOCATION PROTOCOL
            # Invalidate all active sessions for this user for security
            SessionRepo.revoke_all_for_user(db, user_id)
            LogRepo.log(db, user_id=user_id, action="TOKEN_REPLAY_ATTACK", description=f"Refresh token reuse detected for session: {session_id}. Revoking all sessions.", ip=client_ip)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session compromised. Re-authentication required."
            )

        # Generate new session UUID (Rotation)
        new_session_id = str(uuid.uuid4())
        
        # Invalidate old session
        SessionRepo.update(db, session, {
            "status": "Expired",
            "logout_time": datetime.utcnow()
        })

        # Create new session
        new_session = UserSession(
            session_id=new_session_id,
            user_id=user.id,
            device_name=session.device_name,
            browser=session.browser,
            operating_system=session.operating_system,
            ip_address=client_ip,
            mac_address=session.mac_address,
            status="Active"
        )
        SessionRepo.create(db, new_session)

        # Issue rotated tokens
        token_data = {"sub": str(user.id), "email": user.email, "session_id": new_session_id}
        access_token = create_access_token(data=token_data)
        new_refresh_token = create_refresh_token(data=token_data)

        LogRepo.log(db, user_id=user.id, action="TOKEN_ROTATION", description=f"Session rotated. Old: {session_id} -> New: {new_session_id}", ip=client_ip)

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "user": user
        }

    @staticmethod
    def request_otp(db: Session, email: str, client_ip: str) -> dict:
        user = UserRepo.get_by_email(db, email)
        # To avoid email enumeration attacks, return identical positive response even if user is missing,
        # but only generate/save OTP if user exists.
        if not user:
            return {"message": "If the email matches an active account, a 6-digit OTP code has been generated.", "debug_otp": None}

        # Rate Limiting Cooldown: 60 seconds check
        latest_reset = ResetRepo.get_latest_active_by_user(db, user.id)
        if latest_reset:
            seconds_since_creation = (datetime.utcnow() - latest_reset.created_at).total_seconds()
            if seconds_since_creation < 60:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Please wait 60 seconds before requesting another OTP."
                )

        # Generate 6-digit OTP
        otp_code = generate_otp()
        hashed_code = hash_otp(otp_code)
        
        # Expiry from settings (default 5 mins / 300 secs)
        sys_settings = SettingRepo.get(db)
        expiry_seconds = sys_settings.otp_expiry if sys_settings else 300
        expiry_time = datetime.utcnow() + timedelta(seconds=expiry_seconds)

        # Save to DB
        reset_entry = PasswordReset(
            user_id=user.id,
            otp_hash=hashed_code,
            expiry=expiry_time,
            otp_attempts=0,
            used=False
        )
        ResetRepo.create(db, reset_entry)
        
        LogRepo.log(db, user_id=user.id, action="OTP_REQUEST", description="Password reset OTP generated", ip=client_ip)
        print(f"[OTP DEBUG LOG] Hashed OTP generated for {email}: {otp_code} (Expires in {expiry_seconds}s)")

        return {
            "message": "If the email matches an active account, a 6-digit OTP code has been generated.",
            "debug_otp": otp_code if (sys_settings and sys_settings.id == 1 and settings.DEBUG) else None
        }

    @staticmethod
    def verify_otp(db: Session, email: str, otp: str, client_ip: str) -> dict:
        user = UserRepo.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found"
            )

        reset_entry = ResetRepo.get_latest_active_by_user(db, user.id)
        if not reset_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active password reset request found. Please request a new OTP."
            )

        # Brute Force Protection: Max 3 attempts
        if reset_entry.otp_attempts >= 3:
            ResetRepo.mark_used(db, reset_entry)
            LogRepo.log(db, user_id=user.id, action="OTP_FAILED_LIMIT", description="OTP disabled due to exceeding 3 attempts", ip=client_ip)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum OTP attempts exceeded. Please request a new OTP."
            )

        # Verify OTP code
        if not verify_otp_hash(otp, reset_entry.otp_hash):
            ResetRepo.increment_attempts(db, reset_entry)
            LogRepo.log(db, user_id=user.id, action="OTP_FAILED_ATTEMPT", description=f"Incorrect OTP attempt {reset_entry.otp_attempts + 1}/3", ip=client_ip)
            
            # Check if now exceeded
            if reset_entry.otp_attempts >= 3:
                ResetRepo.mark_used(db, reset_entry)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum OTP attempts exceeded. Please request a new OTP."
                )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )

        # Success: Generate short-lived reset token (valid for 10 minutes)
        # Using a signed access token containing claims: sub: user.id, action: reset_password
        reset_token_data = {"sub": str(user.id), "action": "reset_password", "reset_id": reset_entry.id}
        reset_token = create_access_token(data=reset_token_data, expires_delta=timedelta(minutes=10))

        LogRepo.log(db, user_id=user.id, action="OTP_VERIFIED", description="OTP verification successful", ip=client_ip)
        return {
            "message": "OTP verified successfully.",
            "reset_token": reset_token
        }

    @staticmethod
    def reset_password(db: Session, payload: ResetPasswordRequest, client_ip: str) -> dict:
        user = UserRepo.get_by_email(db, payload.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found"
            )

        # Validate signed reset token
        token_payload = decode_refresh_token(payload.reset_token) # we decode with access key first
        from app.utils.auth_utils import decode_access_token
        token_payload = decode_access_token(payload.reset_token)
        
        if not token_payload or token_payload.get("action") != "reset_password" or int(token_payload.get("sub")) != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token. Please restart password reset process."
            )

        # Verify password reset database tracking entry hasn't been re-used
        reset_id = token_payload.get("reset_id")
        reset_entry = db.query(PasswordReset).filter(PasswordReset.id == reset_id).first()
        if not reset_entry or reset_entry.used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has already been used."
            )

        # Hash new password
        new_hashed = hash_password(payload.new_password)
        
        # Update user profile
        updates = {
            "password_hash": new_hashed,
            "failed_login_attempts": 0,
            "account_status": "Active", # Unlock if locked
            "account_locked": False,
            "is_first_login": False,
            "last_password_change": datetime.utcnow()
        }
        UserRepo.update(db, user, updates)

        # Mark password reset entry as used
        ResetRepo.mark_used(db, reset_entry)
        
        # Invalidate all active user sessions for security compliance
        SessionRepo.revoke_all_for_user(db, user.id)

        LogRepo.log(db, user_id=user.id, action="PASSWORD_RESET", description="Password reset successful", ip=client_ip)
        
        NotificationRepo.create(
            db,
            user_id=user.id,
            title="Password Changed Successfully",
            message="Your account password was updated. All active sessions have been terminated for security.",
            type="Info"
        )

        return {"message": "Password reset completed successfully. You can now login with your new credentials."}

class ModuleService:
    @staticmethod
    def create_device(db: Session, payload: DeviceCreate) -> NetworkDevice:
        try:
            device = NetworkDevice(
                device_name=payload.device_name,
                model=payload.model,
                ip_address=payload.ip_address,
                mac_address=payload.mac_address,
                device_type=payload.device_type,
                status=payload.status or "Offline"
            )
            DeviceRepo.create(db, device)
            db.commit()
            db.refresh(device)
            return device
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def update_device(db: Session, device_id: int, updates: dict) -> NetworkDevice:
        device = DeviceRepo.get_by_id(db, device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        try:
            DeviceRepo.update(db, device, updates)
            db.commit()
            db.refresh(device)
            return device
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def delete_device(db: Session, device_id: int) -> NetworkDevice:
        device = DeviceRepo.get_by_id(db, device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        try:
            DeviceRepo.update(db, device, {"is_deleted": True})
            db.commit()
            db.refresh(device)
            return device
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_subnet(db: Session, payload: SubnetCreate) -> NetworkSubnet:
        try:
            subnet = NetworkSubnet(
                subnet_range=payload.subnet_range,
                active_clients=payload.active_clients or 0,
                ap_count=payload.ap_count or 0,
                gateway=payload.gateway,
                vlan_id=payload.vlan_id,
                status=payload.status or "Active"
            )
            SubnetRepo.create(db, subnet)
            db.commit()
            db.refresh(subnet)
            return subnet
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def delete_subnet(db: Session, subnet_id: int) -> NetworkSubnet:
        subnet = SubnetRepo.get_by_id(db, subnet_id)
        if not subnet:
            raise HTTPException(status_code=404, detail="Subnet not found")
        try:
            SubnetRepo.update(db, subnet, {"is_deleted": True})
            db.commit()
            db.refresh(subnet)
            return subnet
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_policy(db: Session, payload: SecurityPolicyCreate) -> SecurityPolicy:
        try:
            policy = SecurityPolicy(
                priority=payload.priority,
                source_ip=payload.source_ip,
                destination=payload.destination,
                protocol=payload.protocol,
                policy=payload.policy,
                status=payload.status or "Active"
            )
            PolicyRepo.create(db, policy)
            db.commit()
            db.refresh(policy)
            return policy
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def delete_policy(db: Session, policy_id: int) -> SecurityPolicy:
        policy = PolicyRepo.get_by_id(db, policy_id)
        if not policy:
            raise HTTPException(status_code=404, detail="Security policy not found")
        try:
            PolicyRepo.update(db, policy, {"is_deleted": True})
            db.commit()
            db.refresh(policy)
            return policy
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_report(db: Session, payload: ReportRequestCreate, user_id: int) -> ReportRequest:
        try:
            report = ReportRequest(
                report_name=payload.report_name,
                report_type=payload.report_type,
                generated_by=user_id,
                status="Pending"
            )
            ReportRepo.create(db, report)
            db.commit()
            db.refresh(report)
            return report
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=400, detail=str(e))

class JuniperSyncService:
    @staticmethod
    def sync_inventory(db: Session) -> list[DeviceInventory]:
        try:
            raw_devices = JuniperDriver.get_hardware_inventory()
            synced_devices = []
            
            for dev_data in raw_devices:
                device = JuniperRepo.upsert_device(db, dev_data)
                synced_devices.append(device)
                
                # Health recording
                health_data = JuniperDriver.get_device_health(device.model)
                health_data["device_id"] = device.id
                JuniperRepo.add_health_record(db, health_data)
                
                # Sync Log
                JuniperRepo.log_sync(db, {
                    "device_id": device.id,
                    "sync_type": "INVENTORY",
                    "status": "SUCCESS",
                    "response_metadata": f"Synced {device.model} ({device.hostname}) via JuniperDriver"
                })

            db.commit()
            for d in synced_devices:
                db.refresh(d)
            return synced_devices
        except Exception as e:
            db.rollback()
            JuniperRepo.log_sync(db, {
                "sync_type": "INVENTORY",
                "status": "FAILED",
                "error_message": str(e)
            })
            db.commit()
            raise HTTPException(status_code=400, detail=f"Juniper Inventory Sync failed: {str(e)}")

    @staticmethod
    def sync_interfaces(db: Session) -> list[NetworkInterface]:
        try:
            devices = JuniperRepo.get_all_devices(db)
            if not devices:
                # auto sync inventory first
                devices = JuniperSyncService.sync_inventory(db)
                
            all_interfaces = []
            for dev in devices:
                if dev.model in ["SRX300", "EX2300-C"]:
                    ifaces = JuniperDriver.get_device_interfaces(dev.model)
                    added = JuniperRepo.clear_and_add_interfaces(db, dev.id, ifaces)
                    all_interfaces.extend(added)
                    
                    JuniperRepo.log_sync(db, {
                        "device_id": dev.id,
                        "sync_type": "INTERFACES",
                        "status": "SUCCESS",
                        "response_metadata": f"Synchronized {len(ifaces)} interfaces for {dev.model}"
                    })
            db.commit()
            return all_interfaces
        except Exception as e:
            db.rollback()
            JuniperRepo.log_sync(db, {
                "sync_type": "INTERFACES",
                "status": "FAILED",
                "error_message": str(e)
            })
            db.commit()
            raise HTTPException(status_code=400, detail=f"Juniper Interfaces Sync failed: {str(e)}")

    @staticmethod
    def sync_vlans(db: Session) -> list[VlanInventory]:
        try:
            devices = JuniperRepo.get_all_devices(db)
            if not devices:
                devices = JuniperSyncService.sync_inventory(db)
                
            all_vlans = []
            for dev in devices:
                if dev.model in ["SRX300", "EX2300-C"]:
                    vlans = JuniperDriver.get_device_vlans(dev.model)
                    added = JuniperRepo.clear_and_add_vlans(db, dev.id, vlans)
                    all_vlans.extend(added)
                    
                    JuniperRepo.log_sync(db, {
                        "device_id": dev.id,
                        "sync_type": "VLANS",
                        "status": "SUCCESS",
                        "response_metadata": f"Synchronized {len(vlans)} VLANs for {dev.model}"
                    })
            db.commit()
            return all_vlans
        except Exception as e:
            db.rollback()
            JuniperRepo.log_sync(db, {
                "sync_type": "VLANS",
                "status": "FAILED",
                "error_message": str(e)
            })
            db.commit()
            raise HTTPException(status_code=400, detail=f"Juniper VLANs Sync failed: {str(e)}")

    @staticmethod
    def sync_aps(db: Session) -> list[WirelessAccessPoint]:
        try:
            devices = JuniperRepo.get_all_devices(db)
            if not devices:
                devices = JuniperSyncService.sync_inventory(db)
                
            ap_device = next((d for d in devices if d.model == "AP32"), devices[0] if devices else None)
            ap_device_id = ap_device.id if ap_device else 1
            
            aps_data = JuniperDriver.get_device_aps()
            added_aps = JuniperRepo.clear_and_add_aps(db, ap_device_id, aps_data)
            
            JuniperRepo.log_sync(db, {
                "device_id": ap_device_id,
                "sync_type": "APS",
                "status": "SUCCESS",
                "response_metadata": f"Synchronized {len(aps_data)} wireless APs (AP32, AP63)"
            })
            db.commit()
            return added_aps
        except Exception as e:
            db.rollback()
            JuniperRepo.log_sync(db, {
                "sync_type": "APS",
                "status": "FAILED",
                "error_message": str(e)
            })
            db.commit()
            raise HTTPException(status_code=400, detail=f"Juniper APs Sync failed: {str(e)}")

