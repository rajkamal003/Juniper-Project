# backend/app/routes/juniper_routes.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    SuccessResponse, DeviceInventoryResponse, NetworkInterfaceResponse,
    VlanInventoryResponse, WirelessAccessPointResponse, DeviceHealthResponse, DeviceSyncLogResponse
)
from app.repositories.repos import JuniperRepo
from app.services.services import JuniperSyncService

router = APIRouter(prefix="/api/juniper", tags=["juniper"])

# --- Sync Triggers ---

@router.post("/sync", response_model=SuccessResponse, status_code=status.HTTP_200_OK)
def sync_inventory(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    devices = JuniperSyncService.sync_inventory(db)
    return SuccessResponse(
        message="Juniper hardware inventory synchronized successfully.",
        data=[DeviceInventoryResponse.model_validate(d) for d in devices]
    )

@router.post("/sync/interfaces", response_model=SuccessResponse)
def sync_interfaces(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    interfaces = JuniperSyncService.sync_interfaces(db)
    return SuccessResponse(
        message="Juniper network interfaces synchronized successfully.",
        data=[NetworkInterfaceResponse.model_validate(i) for i in interfaces]
    )

@router.post("/sync/vlans", response_model=SuccessResponse)
def sync_vlans(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    vlans = JuniperSyncService.sync_vlans(db)
    return SuccessResponse(
        message="Juniper VLAN inventory synchronized successfully.",
        data=[VlanInventoryResponse.model_validate(v) for v in vlans]
    )

@router.post("/sync/aps", response_model=SuccessResponse)
def sync_aps(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    aps = JuniperSyncService.sync_aps(db)
    return SuccessResponse(
        message="Juniper wireless access points synchronized successfully.",
        data=[WirelessAccessPointResponse.model_validate(a) for a in aps]
    )

# --- Telemetry Queries ---

@router.get("/inventory", response_model=SuccessResponse)
def get_inventory(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    devices = JuniperRepo.get_all_devices(db)
    if not devices:
        # Auto-sync initial state if database inventory is empty
        devices = JuniperSyncService.sync_inventory(db)
        JuniperSyncService.sync_interfaces(db)
        JuniperSyncService.sync_vlans(db)
        JuniperSyncService.sync_aps(db)

    return SuccessResponse(
        message="Juniper hardware inventory loaded.",
        data=[DeviceInventoryResponse.model_validate(d) for d in devices]
    )

@router.get("/interfaces", response_model=SuccessResponse)
def get_interfaces(
    device_id: int = None,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    interfaces = JuniperRepo.get_interfaces_by_device(db, device_id)
    return SuccessResponse(
        message="Juniper network interfaces loaded.",
        data=[NetworkInterfaceResponse.model_validate(i) for i in interfaces]
    )

@router.get("/vlans", response_model=SuccessResponse)
def get_vlans(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    vlans = JuniperRepo.get_all_vlans(db)
    return SuccessResponse(
        message="Juniper VLAN inventory loaded.",
        data=[VlanInventoryResponse.model_validate(v) for v in vlans]
    )

@router.get("/aps", response_model=SuccessResponse)
def get_aps(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    aps = JuniperRepo.get_all_aps(db)
    return SuccessResponse(
        message="Juniper wireless access points loaded.",
        data=[WirelessAccessPointResponse.model_validate(a) for a in aps]
    )

@router.get("/health", response_model=SuccessResponse)
def get_health(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    health_records = JuniperRepo.get_latest_health(db)
    return SuccessResponse(
        message="Juniper health telemetry loaded.",
        data=[DeviceHealthResponse.model_validate(h) for h in health_records]
    )

@router.get("/logs", response_model=SuccessResponse)
def get_logs(
    limit: int = 20,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    logs = JuniperRepo.get_sync_logs(db, limit)
    return SuccessResponse(
        message="Juniper sync logs loaded.",
        data=[DeviceSyncLogResponse.model_validate(l) for l in logs]
    )
