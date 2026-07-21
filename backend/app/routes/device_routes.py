# backend/app/routes/device_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    DeviceCreate, DeviceResponse, PaginatedDevicesResponse, SuccessResponse
)
from app.repositories.repos import DeviceRepo
from app.services.services import ModuleService

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.get("", response_model=SuccessResponse)
def get_devices(
    search: str = None,
    device_type: str = None,
    status: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = DeviceRepo.get_devices(db, search, device_type, status, skip, limit)
    pages = (total + limit - 1) // limit
    
    return SuccessResponse(
        message="Devices loaded successfully.",
        data={
            "items": [DeviceResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_device(
    payload: DeviceCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    device = ModuleService.create_device(db, payload)
    return SuccessResponse(
        message="Device registered successfully.",
        data=DeviceResponse.model_validate(device)
    )

@router.put("/{id}", response_model=SuccessResponse)
def update_device(
    id: int,
    updates: dict,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    # Filter permitted update keys
    allowed_keys = ["device_name", "model", "ip_address", "mac_address", "device_type", "status"]
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_keys}
    
    device = ModuleService.update_device(db, id, filtered_updates)
    return SuccessResponse(
        message="Device updated successfully.",
        data=DeviceResponse.model_validate(device)
    )

@router.delete("/{id}", response_model=SuccessResponse)
def delete_device(
    id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    device = ModuleService.delete_device(db, id)
    return SuccessResponse(
        message="Device deleted successfully.",
        data=DeviceResponse.model_validate(device)
    )
