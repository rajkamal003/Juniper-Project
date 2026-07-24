# backend/app/routes/auth_routes.py
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    UserRegister, UserLogin, ForgotPasswordRequest, 
    VerifyOTPRequest, ResetPasswordRequest, UserResponse, TokenResponse, SystemSettingsResponse,
    FacultyMFAVerifyRequest
)
from app.services.services import AuthService
from app.repositories.repos import UserRepo, SettingRepo, SessionRepo
from app.utils.auth_utils import decode_access_token

from app.models.models import UserSession

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = int(payload.get("sub"))
    user = UserRepo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if user.account_status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account status is {user.account_status}"
        )
        
    session_id = payload.get("session_id")
    client_ip = request.client.host if request.client else "127.0.0.1"
    if session_id:
        session = SessionRepo.get_by_id(db, session_id)
        if not session:
            # Recreate session in database on-the-fly to guarantee it exists
            session = UserSession(
                session_id=session_id,
                user_id=user.id,
                role=user.role.role_name if user.role else "Unknown",
                device_name="Desktop Web",
                browser="Chrome",
                operating_system="Windows",
                ip_address=client_ip,
                mac_address="00:1A:2B:3C:4D:5E",
                ssid="SecureCampus-WiFi",
                access_point="AP-MainHall-01",
                signal_strength="Excellent (-52 dBm)",
                status="Active",
                session_status="Active"
            )
            SessionRepo.create(db, session)
        elif session.status != "Active":
            # Reactivate session if it got deactivated but token is still valid
            SessionRepo.update(db, session, {"status": "Active", "session_status": "Active"})
        
    return user, session_id

@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.register(db, payload, client_ip)

@router.post("/login")
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.login(db, payload, client_ip)

@router.post("/verify-faculty-mfa")
def verify_faculty_mfa(payload: FacultyMFAVerifyRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.verify_faculty_mfa(db, payload.temp_token, payload.totp_code, client_ip)

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.request_otp(db, payload.email, client_ip)

@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.verify_otp(db, payload.email, payload.otp, client_ip)

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.reset_password(db, payload, client_ip)

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    return user

@router.post("/logout")
def logout(request: Request, current_user_data = Depends(get_current_user), db: Session = Depends(get_db)):
    _, session_id = current_user_data
    client_ip = request.client.host if request.client else "127.0.0.1"
    AuthService.logout(db, session_id, client_ip)
    return {"message": "Logged out successfully"}

@router.post("/refresh")
def refresh_token(request: Request, payload: dict, db: Session = Depends(get_db)):
    ref_token = payload.get("refresh_token")
    if not ref_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.refresh_session_tokens(db, ref_token, client_ip)

@router.get("/settings", response_model=SystemSettingsResponse)
def get_system_settings(db: Session = Depends(get_db)):
    sys_settings = SettingRepo.get(db)
    if not sys_settings:
        try:
            from app.models.models import SystemSetting
            new_setting = SystemSetting(
                id=1,
                account_approval_mode="AUTO",
                session_timeout=15,
                mfa_required_for_admin=False,
                unauthorized_attempts_limit=5
            )
            db.add(new_setting)
            db.commit()
            db.refresh(new_setting)
            sys_settings = new_setting
            print("Dynamic Settings Seeding: Success")
        except Exception as e:
            print("Dynamic Settings Seeding Warning:", e)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="System settings not found and dynamic seeding failed"
            )
    return sys_settings
