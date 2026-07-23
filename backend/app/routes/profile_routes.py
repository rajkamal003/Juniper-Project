# backend/app/routes/profile_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.routes.auth_routes import get_current_user
from app.models.models import User, UserSession
from app.repositories.repos import UserRepo
from app.utils.auth_utils import hash_password, verify_password
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

router = APIRouter(prefix="/api/profile", tags=["Profile"])

class ProfileUpdatePayload(BaseModel):
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None

class LoginHistoryItem(BaseModel):
    time: str
    device: str
    browser: str
    ip: str
    location: str
    status: str

@router.get("")
def get_profile(
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, session_id = current_user_data
    role_name = user.role.role_name if user.role else "Guest"
    
    # Load current active session info
    active_sess = db.query(UserSession).filter(UserSession.session_id == session_id).first()
    
    # Common session details
    ip_addr = active_sess.ip_address if active_sess else "127.0.0.1"
    mac_addr = active_sess.mac_address if active_sess else "00:0A:95:9D:68:16"
    device_name = active_sess.device_name if active_sess else "Unknown Device"
    browser = active_sess.browser if active_sess else "Unknown Browser"
    os_name = active_sess.operating_system if active_sess else "Unknown OS"
    ssid = active_sess.ssid if active_sess else "SecureCampus-WiFi"
    ap = active_sess.access_point if active_sess else "AP-MainHall-01"
    sig = active_sess.signal_strength if active_sess else "Excellent (-52 dBm)"
    login_time = active_sess.login_time.isoformat() if (active_sess and active_sess.login_time) else datetime.utcnow().isoformat()

    # Build Role Specific Dictionary
    role_specific = {}
    if role_name == "Student":
        role_specific = {
            "student_id": user.roll_number or "2300090273",
            "department": user.department or "Computer Science & Engineering",
            "year": "III Year",
            "registered_devices": 3,
            "current_device": device_name,
            "current_wifi": ssid,
            "current_bandwidth": "75 Mbps",
            "monthly_data_usage": "45.2 GB",
            "blocked_website_attempts": 2,
            "top_educational_websites": "coursera.org, stackoverflow.com, kluniversity.in",
            "password_security_status": "Strong",
            "remember_me_status": True
        }
    elif role_name == "Faculty":
        role_specific = {
            "faculty_id": user.employee_id or "2158",
            "department": user.department or "Electronics & Communications",
            "designation": "Associate Professor",
            "registered_devices": 2,
            "current_wifi": ssid,
            "bandwidth_usage": "120 Mbps",
            "research_website_usage": "IEEE Xplore, ScienceDirect, ResearchGate",
            "mfa_status": "Enabled" if user.is_mfa_enabled else "Disabled",
            "authenticator_status": "Configured" if user.mfa_secret else "Not Configured",
            "last_mfa_login": login_time,
            "security_score": 92
        }
    elif role_name == "Parent Visitor":
        role_specific = {
            "linked_student_id": user.parent_student_roll or "2300090273",
            "relationship": user.relationship or "Father",
            "student_department": "Computer Science & Engineering",
            "current_connected_device": device_name,
            "monthly_wifi_usage": "8.4 GB",
            "current_session": "Active",
            "allowed_websites": "kluniversity.in, google.com",
            "blocked_attempts": 0,
            "visitor_history": "3 Approved Campus Passes"
        }
    elif role_name == "Guest":
        role_specific = {
            "guest_id": user.roll_number or "GST-9021",
            "purpose_of_visit": user.purpose or "Campus Event / Seminar",
            "visit_duration": user.duration or "4 Hours",
            "session_expiry_time": (datetime.utcnow() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
            "current_device": device_name,
            "wifi_usage": "1.2 GB",
            "allowed_websites": "All (Gateway unrestricted)",
            "remaining_time": "2h 15m"
        }
    elif role_name == "Super Admin":
        role_specific = {
            "admin_id": user.employee_id or "ADM-001",
            "designation": "Security Administrator",
            "managed_devices": 145,
            "current_active_sessions": db.query(UserSession).filter(UserSession.status == "Active").count() or 5,
            "firewall_status": "Operational / Secure",
            "network_status": "Optimal (0% packet loss)",
            "last_login": user.last_login.isoformat() if user.last_login else login_time,
            "security_score": 98
        }

    return {
        "fullname": user.fullname,
        "email": user.email,
        "phone": user.phone,
        "role": role_name,
        "account_status": user.account_status,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "profile_image": user.profile_image,
        "session_details": {
            "current_login_time": login_time,
            "device": device_name,
            "browser": browser,
            "operating_system": os_name,
            "ip_address": ip_addr,
            "mac_address": mac_addr,
            "connected_wifi": ssid,
            "access_point": ap,
            "signal_strength": sig
        },
        "role_specific": role_specific,
        "security": {
            "password_strength": "Strong",
            "remember_me_enabled": True,
            "mfa_enabled": user.is_mfa_enabled,
            "failed_login_attempts": user.failed_login_attempts,
            "last_password_change": user.last_password_change.isoformat() if user.last_password_change else None
        }
    }

@router.put("")
def update_profile(
    payload: ProfileUpdatePayload,
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, _ = current_user_data
    
    update_data = {}
    if payload.phone is not None:
        update_data["phone"] = payload.phone
    if payload.profile_image is not None:
        update_data["profile_image"] = payload.profile_image
        
    if payload.new_password:
        if not payload.old_password:
            raise HTTPException(status_code=400, detail="Current password is required to change password")
        if not verify_password(payload.old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid current password")
        update_data["password_hash"] = hash_password(payload.new_password)
        update_data["last_password_change"] = datetime.utcnow()

    if update_data:
        UserRepo.update(db, user, update_data)
        
    return {"success": True, "message": "Profile updated successfully"}

@router.get("/login-history", response_model=List[LoginHistoryItem])
def get_login_history(
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, _ = current_user_data
    sessions = db.query(UserSession).filter(UserSession.user_id == user.id).order_by(UserSession.login_time.desc()).limit(10).all()
    
    history = []
    for s in sessions:
        history.append(LoginHistoryItem(
            time=s.login_time.isoformat() if s.login_time else datetime.utcnow().isoformat(),
            device=s.device_name or "Unknown Device",
            browser=s.browser or "Unknown Browser",
            ip=s.ip_address or "127.0.0.1",
            location="Campus Subnet",
            status="Active" if s.status == "Active" else "Closed"
        ))
        
    # If empty, add a default mock item
    if not history:
        history.append(LoginHistoryItem(
            time=datetime.utcnow().isoformat(),
            device="Default Device",
            browser="Chrome",
            ip="127.0.0.1",
            location="Campus Subnet",
            status="Active"
        ))
    return history

@router.get("/active-session")
def get_active_session(
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, session_id = current_user_data
    s = db.query(UserSession).filter(UserSession.session_id == session_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Active session not found")
        
    return {
        "login_time": s.login_time.isoformat() if s.login_time else datetime.utcnow().isoformat(),
        "current_duration": "Active Now",
        "browser": s.browser or "Chrome",
        "operating_system": s.operating_system or "Windows",
        "device_name": s.device_name or "Workstation",
        "ip_address": s.ip_address or "127.0.0.1",
        "mac_address": s.mac_address or "00:0A:95:9D:68:16",
        "ssid": s.ssid or "SecureCampus-WiFi",
        "access_point": s.access_point or "AP-MainHall-01",
        "status": "Online"
    }
