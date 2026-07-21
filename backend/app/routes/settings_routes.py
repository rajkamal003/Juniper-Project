# backend/app/routes/settings_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    SystemSettingsResponse, SystemSettingsUpdate, SuccessResponse
)
from app.repositories.repos import SettingRepo

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("/config", response_model=SuccessResponse)
def get_config(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    settings_instance = SettingRepo.get(db)
    if not settings_instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not configured.")
    return SuccessResponse(
        message="System settings loaded successfully.",
        data=SystemSettingsResponse.model_validate(settings_instance)
    )

@router.put("/config", response_model=SuccessResponse)
def update_config(
    payload: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    settings_instance = SettingRepo.get(db)
    if not settings_instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System settings not configured.")
    
    updates = payload.model_dump(exclude_unset=True)
    try:
        updated_settings = SettingRepo.update(db, settings_instance, updates)
        return SuccessResponse(
            message="System settings updated successfully.",
            data=SystemSettingsResponse.model_validate(updated_settings)
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
