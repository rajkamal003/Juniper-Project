# backend/app/routes/report_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    ReportRequestCreate, ReportRequestResponse, PaginatedReportRequestsResponse, SuccessResponse
)
from app.repositories.repos import ReportRepo
from app.services.services import ModuleService

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("", response_model=SuccessResponse)
def get_reports(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = ReportRepo.get_reports(db, skip, limit)
    pages = (total + limit - 1) // limit

    return SuccessResponse(
        message="Reports log loaded successfully.",
        data={
            "items": [ReportRequestResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.post("", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportRequestCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    report = ModuleService.create_report(db, payload, admin.id)
    return SuccessResponse(
        message="Report compile request submitted successfully.",
        data=ReportRequestResponse.model_validate(report)
    )
