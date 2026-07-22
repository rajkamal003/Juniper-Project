# backend/app/routes/exam_routes.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import get_current_user
from app.routes.visitor_routes import require_faculty_or_admin
from app.models.models import User
from app.schemas.schemas import (
    SuccessResponse, ExamSessionCreate, ExamSessionResponse,
    ExamAccessRequest, ExamAccessLogResponse
)
from app.repositories.repos import ExamRepo
from app.services.services import ExamService

router = APIRouter(prefix="/api/exam", tags=["exam"])

# --- Exam Session Control Endpoints ---

@router.get("/sessions", response_model=SuccessResponse)
def get_exam_sessions(
    status: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    user_data = Depends(get_current_user)
):
    skip = (page - 1) * limit
    items, total = ExamService.get_sessions(db, status, search, skip, limit)
    return SuccessResponse(
        message="Exam sessions loaded.",
        data={
            "items": [ExamSessionResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.post("/sessions", response_model=SuccessResponse)
def create_exam_session(
    payload: ExamSessionCreate,
    db: Session = Depends(get_db),
    faculty = Depends(require_faculty_or_admin)
):
    session = ExamService.create_session(db, payload, faculty.id)
    return SuccessResponse(
        message="Exam session scheduled successfully.",
        data=ExamSessionResponse.model_validate(session)
    )

@router.put("/sessions/{id}", response_model=SuccessResponse)
def update_exam_session(
    id: int,
    status_update: str = None, # Start / End Exam trigger (Active / Completed / Cancelled)
    db: Session = Depends(get_db),
    faculty = Depends(require_faculty_or_admin)
):
    session = ExamRepo.get_session_by_id(db, id)
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found")

    if status_update:
        session = ExamService.update_session_status(db, id, status_update, faculty.id)
    
    db.commit()
    db.refresh(session)
    return SuccessResponse(
        message="Exam session updated.",
        data=ExamSessionResponse.model_validate(session)
    )

@router.delete("/sessions/{id}", response_model=SuccessResponse)
def cancel_exam_session(
    id: int,
    db: Session = Depends(get_db),
    faculty = Depends(require_faculty_or_admin)
):
    session = ExamRepo.get_session_by_id(db, id)
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found")

    # If already active/completed, reject cancel
    if session.status in ["Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot delete a finalized or cancelled exam session")

    ExamService.update_session_status(db, id, "Cancelled", faculty.id)
    return SuccessResponse(
        message="Exam session cancelled successfully.",
        data=None
    )


# --- Exam Access Log Endpoints ---

@router.get("/access-logs", response_model=SuccessResponse)
def get_exam_access_logs(
    exam_session_id: int = None,
    student_id: int = None,
    status: str = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    user_data = Depends(get_current_user)
):
    skip = (page - 1) * limit
    items, total = ExamRepo.get_access_logs(db, exam_session_id, student_id, status, skip, limit)
    return SuccessResponse(
        message="Exam access logs loaded.",
        data={
            "items": [ExamAccessLogResponse.model_validate(l) for l in items],
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.post("/access", response_model=SuccessResponse)
def log_student_exam_access(
    payload: ExamAccessRequest,
    db: Session = Depends(get_db),
    user_data = Depends(get_current_user)
):
    # Students can log their own access or Faculty/Admin can log for them
    requesting_user, _ = user_data
    if requesting_user.role_id not in [1, 2] and requesting_user.id != payload.student_id:
        raise HTTPException(status_code=403, detail="Access denied to log exam device details")

    if payload.logout:
        log = ExamService.log_exam_logout(db, payload.exam_session_id, payload.student_id)
        msg = "Student logged out from exam session successfully."
    else:
        log = ExamService.log_exam_access(db, payload)
        msg = "Student login recorded for active exam session."

    return SuccessResponse(
        message=msg,
        data=ExamAccessLogResponse.model_validate(log)
    )
