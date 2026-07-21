# backend/app/routes/auth_routes.py
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    UserRegister, UserLogin, ForgotPasswordRequest, 
    VerifyOTPRequest, ResetPasswordRequest, UserResponse, TokenResponse, SystemSettingsResponse
)
from app.services.services import AuthService
from app.repositories.repos import UserRepo, SettingRepo, SessionRepo
from app.utils.auth_utils import decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

def get_current_user(
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
    if session_id:
        session = SessionRepo.get_by_id(db, session_id)
        if not session or session.status != "Active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has been terminated or expired"
            )
        
    return user, session_id

@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.register(db, payload, client_ip)

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return AuthService.login(db, payload, client_ip)

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System settings not found"
        )
    return sys_settings
