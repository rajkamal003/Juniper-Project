# backend/app/routes/report_routes.py
import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    SuccessResponse, GeneratedReportResponse, GeneratedReportCreate,
    ReportRequestCreate, ReportRequestResponse
)
from app.repositories.repos import GeneratedReportRepo, ReportRepo
from app.services.services import ReportGenerationService, ModuleService

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/history", response_model=SuccessResponse)
def get_reports_history(
    search: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = GeneratedReportRepo.get_reports(db, search, skip, limit)
    pages = (total + limit - 1) // limit

    return SuccessResponse(
        message="Reports compiled history loaded successfully.",
        data={
            "items": [GeneratedReportResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.post("/generate", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def generate_new_report(
    payload: GeneratedReportCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    report = ReportGenerationService.generate_report(db, payload.report_type, payload.file_format, admin.id)
    return SuccessResponse(
        message=f"{payload.file_format} report generated successfully.",
        data=GeneratedReportResponse.model_validate(report)
    )

@router.get("/download/{id}")
def download_generated_report(
    id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    report = GeneratedReportRepo.get_by_id(db, id)
    if not report:
        raise HTTPException(status_code=404, detail="Generated report record not found")

    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "reports"))
    file_path = os.path.join(reports_dir, report.file_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on static server storage")

    # Increment download count
    GeneratedReportRepo.update(db, report, {"download_count": report.download_count + 1})

    media_type = "application/pdf" if report.file_format == "PDF" else (
        "application/vnd.ms-excel" if report.file_format == "Excel" else "text/csv"
    )

    return FileResponse(
        path=file_path,
        filename=report.file_name,
        media_type=media_type
    )

# --- Legacy Endpoints for Test Backward Compatibility ---

@router.get("", response_model=SuccessResponse)
def get_old_reports(
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
def create_old_report(
    payload: ReportRequestCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    report = ModuleService.create_report(db, payload, admin.id)
    return SuccessResponse(
        message="Report compile request submitted successfully.",
        data=ReportRequestResponse.model_validate(report)
    )
