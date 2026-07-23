# backend/app/routes/analytics_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    SuccessResponse, SecurityAlertResponse, SecurityAlertUpdate,
    SecurityRecommendationResponse, SecurityRecommendationUpdate,
    AnalyticsSnapshotResponse
)
from app.repositories.repos import (
    SecurityAlertRepo, SecurityRecommendationRepo, AnalyticsSnapshotRepo,
    UserRepo, JuniperRepo, VisitorRepo, ExamRepo
)
from app.services.services import AISecurityService
from app.models.models import SecurityAlert, SecurityRecommendation, DeviceInventory, User, UserSession

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.post("/scan", response_model=SuccessResponse)
def trigger_heuristic_scan(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    scan_results = AISecurityService.scan_and_generate_alerts(db)
    return SuccessResponse(
        message="AI security heuristic scanning completed successfully.",
        data=scan_results
    )

@router.get("/dashboard", response_model=SuccessResponse)
def get_security_dashboard_metrics(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    # Calculate scores on the fly
    security_score = AISecurityService.calculate_campus_security_score(db)
    
    # Device inventories stats
    total_devices = db.query(DeviceInventory).count()
    online_devices = db.query(DeviceInventory).filter(DeviceInventory.status == 'Online').count()
    offline_devices = total_devices - online_devices
    
    # Active alerts counts
    total_alerts = db.query(SecurityAlert).count()
    active_alerts = db.query(SecurityAlert).filter(SecurityAlert.status == 'Active').count()
    unresolved_recommendations = db.query(SecurityRecommendation).filter(SecurityRecommendation.status == 'Pending').count()
    
    # Total Users and Active Sessions counts
    total_users = db.query(User).count()
    active_sessions = db.query(UserSession).filter(UserSession.status == 'Active').count()

    # Recent alerts
    recent_alerts, _ = SecurityAlertRepo.get_alerts(db, status='Active', limit=5)
    
    # Recommendations
    active_recs, _ = SecurityRecommendationRepo.get_recommendations(db, status='Pending', limit=5)
    
    # Device risk mapping (Risk Score: 0-100)
    devices = JuniperRepo.get_all_devices(db)
    device_risk_list = []
    for d in devices:
        risk_score = AISecurityService.calculate_device_risk_score(db, d.id)
        device_risk_list.append({
            "id": d.id,
            "hostname": d.hostname,
            "model": d.model,
            "device_type": d.device_type,
            "status": d.status,
            "risk_score": risk_score
        })
        
    # Snapshots (last 10 for charts)
    from app.models.models import AnalyticsSnapshot
    snaps = db.query(AnalyticsSnapshot).order_by(desc(AnalyticsSnapshot.captured_at)).limit(10).all()
    snapshots_data = [AnalyticsSnapshotResponse.model_validate(s) for s in snaps]
    snapshots_data.reverse() # chronologically ordered for line charts
    
    return SuccessResponse(
        message="AI campus security analytics dashboard metrics compiled.",
        data={
            "campus_security_score": security_score,
            "total_devices": total_devices,
            "online_devices": online_devices,
            "offline_devices": offline_devices,
            "total_alerts": total_alerts,
            "active_alerts_count": active_alerts,
            "unresolved_recommendations_count": unresolved_recommendations,
            "recent_alerts": [SecurityAlertResponse.model_validate(a) for a in recent_alerts],
            "active_recommendations": [SecurityRecommendationResponse.model_validate(r) for r in active_recs],
            "device_risk_scores": device_risk_list,
            "historical_snapshots": snapshots_data,
            "total_users": total_users,
            "active_sessions_count": active_sessions
        }
    )

@router.get("/alerts", response_model=SuccessResponse)
def list_security_alerts(
    status: str = None,
    severity: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = SecurityAlertRepo.get_alerts(db, status, severity, search, skip, limit)
    pages = (total + limit - 1) // limit
    return SuccessResponse(
        message="Security alerts list loaded successfully.",
        data={
            "items": [SecurityAlertResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.put("/alerts/{id}", response_model=SuccessResponse)
def update_security_alert(
    id: int,
    payload: SecurityAlertUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    alert = SecurityAlertRepo.get_by_id(db, id)
    if not alert:
        raise HTTPException(status_code=404, detail="Security alert event not found")
        
    updated = SecurityAlertRepo.update(db, alert, {"status": payload.status})
    return SuccessResponse(
        message=f"Security alert updated to {payload.status}.",
        data=SecurityAlertResponse.model_validate(updated)
    )

@router.get("/recommendations", response_model=SuccessResponse)
def list_security_recommendations(
    status: str = None,
    priority: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = SecurityRecommendationRepo.get_recommendations(db, status, priority, search, skip, limit)
    pages = (total + limit - 1) // limit
    return SuccessResponse(
        message="Security recommendations list loaded successfully.",
        data={
            "items": [SecurityRecommendationResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.put("/recommendations/{id}", response_model=SuccessResponse)
def update_security_recommendation(
    id: int,
    payload: SecurityRecommendationUpdate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    rec = SecurityRecommendationRepo.get_by_id(db, id)
    if not rec:
        raise HTTPException(status_code=404, detail="Security recommendation not found")
        
    updated = SecurityRecommendationRepo.update(db, rec, {"status": payload.status})
    return SuccessResponse(
        message=f"Security recommendation updated to {payload.status}.",
        data=SecurityRecommendationResponse.model_validate(updated)
    )
