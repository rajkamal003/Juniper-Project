# backend/app/routes/user_routes.py
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.routes.auth_routes import get_current_user
from app.models.models import User, UserSession, Role, Permission, SystemSetting
from app.repositories.repos import UserRepo, SessionRepo, SettingRepo, LogRepo, NotificationRepo
from app.schemas.schemas import (
    UserResponse, UserUpdate, StatusUpdateRequest, AdminPasswordReset, PasswordChangeRequest,
    PermissionResponse, RoleWithPermissionsResponse, RolePermissionsUpdate,
    SessionResponse, PaginatedUsersResponse, SystemSettingsResponse, SystemSettingsUpdate,
    UserCreateByAdmin
)
from app.utils.auth_utils import hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["users"])

# Dependency: Require Super Administrator (role_id = 1)
def require_admin(current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    if user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation only allowed for Super Administrator"
        )
    return user

# Dependency: Require Admin or self
def require_admin_or_self(user_id: int, current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    if user.role_id != 1 and user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to requested profile"
        )
    return user

# Dependency: Block Student (role_id = 3) and Guest (role_id = 5)
def require_operator(current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    if user.role_id in [3, 5]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to user directories is restricted for students and guests"
        )
    return user


# 1. Fetch Paginated and Filtered User Directory
@router.get("", response_model=PaginatedUsersResponse)
def get_users(
    search: str = None,
    role_id: int = None,
    account_status: str = None,
    department: str = None,
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(require_operator)
):
    skip = (page - 1) * size
    users, total = UserRepo.get_users(db, search, role_id, account_status, department, skip, size)
    return {
        "users": users,
        "total": total,
        "page": page,
        "size": size
    }

# 1b. Admin Create User
@router.post("/create", response_model=UserResponse, status_code=201)
def admin_create_user(
    payload: UserCreateByAdmin,
    request: Request,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    # Check duplicate email
    existing_user = UserRepo.get_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )
        
    pwd = payload.password or "Temp@Access123"
    hashed = hash_password(pwd)
    
    new_user = User(
        fullname=payload.fullname,
        email=payload.email,
        phone=payload.phone,
        password_hash=hashed,
        role_id=payload.role_id,
        account_status=payload.account_status or "Active",
        is_verified=True, # Admin created users are pre-verified
        is_first_login=True, # Force user to change password on first login
        department=payload.department,
        roll_number=payload.roll_number,
        employee_id=payload.employee_id,
        parent_student_roll=payload.parent_student_roll,
        relationship=payload.relationship,
        purpose=payload.purpose,
        duration=payload.duration,
        profile_image=payload.profile_image,
        college_id_upload=payload.college_id_upload
    )
    
    created_user = UserRepo.create(db, new_user)
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(
        db, 
        user_id=created_user.id, 
        action="ADMIN_CREATE_USER", 
        description=f"Account manually created by Admin. Initial status: {created_user.account_status}", 
        ip=client_ip
    )
    
    NotificationRepo.create(
        db,
        user_id=created_user.id,
        title="Welcome to SecureCampus AI",
        message="Your account was created by system administrator. Temporary password is set. Please change it at your first login.",
        type="Info"
    )
    
    return created_user


# 2. Get Current Active Sessions for User
@router.get("/sessions", response_model=list[SessionResponse])
def get_user_sessions(
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, _ = current_user_data
    return SessionRepo.get_active_sessions_for_user(db, user.id)


# 3. Revoke a Specific User Session
@router.post("/sessions/revoke/{session_id}")
def revoke_session(
    session_id: str,
    request: Request,
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user, cur_session_id = current_user_data
    session = SessionRepo.get_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Owner or Admin check
    if current_user.role_id != 1 and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to revoke this session")
        
    SessionRepo.update(db, session, {
        "status": "LoggedOut",
        "logout_time": datetime.utcnow()
    })
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(db, user_id=session.user_id, action="SESSION_REVOKE", description=f"Session {session_id} administratively revoked", ip=client_ip)
    
    return {"message": "Session terminated successfully"}


# 4. Revoke All Sessions for Current User
@router.post("/sessions/revoke-all")
def revoke_all_sessions(
    request: Request,
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user, _ = current_user_data
    SessionRepo.revoke_all_for_user(db, current_user.id)
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(db, user_id=current_user.id, action="SESSION_REVOKE_ALL", description="All user sessions revoked by owner", ip=client_ip)
    
    return {"message": "All sessions terminated successfully"}


# 5. Fetch Single User Profile Detail
@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    admin_or_owner = Depends(get_current_user)
):
    # Retrieve user
    user = UserRepo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check authorization (only admin or the self user)
    requesting_user = admin_or_owner[0]
    if requesting_user.role_id != 1 and requesting_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to requested profile")
        
    return user


# 6. Update User Profile Details
@router.put("/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_id: int,
    payload: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin_or_owner = Depends(get_current_user)
):
    user = UserRepo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    requesting_user = admin_or_owner[0]
    if requesting_user.role_id != 1 and requesting_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to profile updates")
        
    # Apply updates
    updates = payload.model_dump(exclude_unset=True)
    updated_user = UserRepo.update(db, user, updates)
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(db, user_id=user_id, action="PROFILE_UPDATE", description="User profile fields updated", ip=client_ip)
    
    return updated_user


# 7. Admin Update User Account Status
@router.post("/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    payload: StatusUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    user = UserRepo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_status = payload.account_status
    updates = {"account_status": target_status}
    
    if target_status == "Active":
        updates["account_locked"] = False
        updates["failed_login_attempts"] = 0
        
    updated_user = UserRepo.update(db, user, updates)
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(db, user_id=user_id, action=f"STATUS_{target_status.upper()}", description=f"Status set to {target_status} by Admin", ip=client_ip)
    
    # Notify target user
    NotificationRepo.create(
        db,
        user_id=user_id,
        title="Account Status Updated",
        message=f"Your account status was set to: {target_status} by system administrator.",
        type="Info"
    )
    
    # If blocked state, force terminate all sessions
    if target_status in ["Suspended", "Rejected", "Locked", "Deleted"]:
        SessionRepo.revoke_all_for_user(db, user_id)
        
    return updated_user


# 8. User Change Password (Self Service)
@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    request: Request,
    current_user_data = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, _ = current_user_data
    
    # Validate old password
    if not verify_password(payload.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password check failed")
        
    # Update password hash
    hashed = hash_password(payload.new_password)
    UserRepo.update(db, user, {
        "password_hash": hashed,
        "last_password_change": datetime.utcnow()
    })
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(db, user_id=user.id, action="PASSWORD_CHANGE", description="Self-service password update complete", ip=client_ip)
    
    # Terminate active sessions except current
    SessionRepo.revoke_all_for_user(db, user.id)
    
    return {"message": "Password changed successfully"}


# 9. Admin Overwrite / Force Password Reset
@router.post("/{user_id}/force-reset")
def force_password_reset(
    user_id: int,
    payload: AdminPasswordReset,
    request: Request,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    user = UserRepo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Set to is_first_login = True to force password change redirect on client side
    hashed = hash_password(payload.new_password)
    UserRepo.update(db, user, {
        "password_hash": hashed,
        "is_first_login": True,
        "failed_login_attempts": 0,
        "account_locked": False,
        "account_status": "Active",
        "last_password_change": datetime.utcnow()
    })
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    LogRepo.log(db, user_id=user_id, action="ADMIN_PASSWORD_RESET", description="Password administratively reset & change forced", ip=client_ip)
    
    NotificationRepo.create(
        db,
        user_id=user_id,
        title="Administrative Password Reset",
        message="Your password has been administratively reset. You must change it upon your next login.",
        type="Warning"
    )
    
    # Terminate active sessions
    SessionRepo.revoke_all_for_user(db, user_id)
    
    return {"message": "Password reset successfully. User will be forced to change it at next login."}


# 10. Fetch Available Roles (Admin Only)
@router.get("/roles/all", response_model=list[RoleWithPermissionsResponse])
def get_roles(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    return db.query(Role).all()


# 11. Assign/Update permissions to role
@router.post("/roles/{role_id}/permissions")
def update_role_permissions(
    role_id: int,
    payload: RolePermissionsUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    permissions = db.query(Permission).filter(Permission.id.in_(payload.permission_ids)).all()
    role.permissions = permissions
    db.commit()
    db.refresh(role)
    return {"message": f"Updated permissions mapping for role: {role.role_name}"}


# 12. Fetch Available Permissions
@router.get("/permissions/all", response_model=list[PermissionResponse])
def get_permissions(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    return db.query(Permission).all()


# 13. Admin Update Settings (account_approval_mode toggle)
@router.put("/settings/config", response_model=SystemSettingsResponse)
def update_system_settings(
    payload: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    settings_instance = SettingRepo.get(db)
    if not settings_instance:
        raise HTTPException(status_code=404, detail="System settings not found")
        
    updates = payload.model_dump(exclude_unset=True)
    updated_settings = SettingRepo.update(db, settings_instance, updates)
    return updated_settings
