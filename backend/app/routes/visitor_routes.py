# backend/app/routes/visitor_routes.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.routes.user_routes import get_current_user, require_admin
from app.models.models import User, Role
from app.schemas.schemas import (
    SuccessResponse, VisitorRequestCreate, VisitorRequestResponse,
    GuestAccessResponse, StudentStatusResponse
)
from app.repositories.repos import VisitorRepo, StudentStatusRepo, UserRepo
from app.services.services import VisitorService, StudentStatusService

router = APIRouter(prefix="/api", tags=["visitor"])

# --- Role Protection Helpers ---

def require_parent(current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    # role_id 4 is Parent Visitor or Parent
    if user.role_id != 4:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parent role required")
    return user

def require_guest(current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    # role_id 5 is Guest
    if user.role_id != 5:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guest role required")
    return user

def require_faculty_or_admin(current_user_data = Depends(get_current_user)):
    user, _ = current_user_data
    # role_id 1 is Super Admin, 2 is Faculty
    if user.role_id not in [1, 2]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty or Admin authorization required")
    return user


# --- 1. Parent Module Endpoints ---

@router.get("/parent/student-status", response_model=SuccessResponse)
def get_parent_student_status(
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent)
):
    if not parent.parent_student_roll:
        raise HTTPException(status_code=400, detail="No student roll number linked to this parent account")

    # Find student with that roll number
    student = db.query(User).filter(User.roll_number == parent.parent_student_roll).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Linked student with roll {parent.parent_student_roll} not found")

    status_obj = StudentStatusService.get_student_status(db, student.id)
    return SuccessResponse(
        message="Student status telemetry loaded.",
        data=StudentStatusResponse.model_validate(status_obj)
    )

@router.get("/parent/visitor-requests", response_model=SuccessResponse)
def get_parent_visitor_requests(
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent)
):
    # Fetch requests created by or associated with parent email
    items, _ = VisitorRepo.get_requests(db, visitor_type="Parent", search=parent.email, limit=100)
    return SuccessResponse(
        message="Parent visitor requests history loaded.",
        data=[VisitorRequestResponse.model_validate(i) for i in items]
    )

@router.post("/parent/visitor-requests", response_model=SuccessResponse)
def create_parent_visitor_request(
    payload: VisitorRequestCreate,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent)
):
    # Enforce visitor type to Parent
    payload_dict = payload.model_dump()
    payload_dict["visitor_type"] = "Parent"
    request = VisitorService.create_request(db, VisitorRequestCreate(**payload_dict))
    return SuccessResponse(
        message="Parent visitor request submitted successfully.",
        data=VisitorRequestResponse.model_validate(request)
    )

@router.put("/parent/visitor-requests/{id}", response_model=SuccessResponse)
def update_parent_visitor_request(
    id: int,
    payload: VisitorRequestCreate,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent)
):
    request = VisitorRepo.get_by_id(db, id)
    if not request:
        raise HTTPException(status_code=404, detail="Visitor request not found")

    if request.status != "Pending":
        raise HTTPException(status_code=400, detail="Only pending visitor requests can be modified")

    # Update attributes
    for k, v in payload.model_dump().items():
        setattr(request, k, v)
    request.visitor_type = "Parent" # Enforce type

    db.commit()
    db.refresh(request)
    return SuccessResponse(
        message="Parent visitor request updated successfully.",
        data=VisitorRequestResponse.model_validate(request)
    )


# --- 2. Guest Module Endpoints ---

@router.get("/guest/access", response_model=SuccessResponse)
def get_guest_access(
    db: Session = Depends(get_db),
    guest_user: User = Depends(require_guest)
):
    # Find guest access by matching username or request email
    guest_pass = VisitorRepo.get_guest_access_by_username(db, guest_user.email)
    if not guest_pass:
        # fallback search by request email matching user phone/email
        # Find any approved visitor requests matching email
        requests, _ = VisitorRepo.get_requests(db, visitor_type="Guest", search=guest_user.email)
        approved_req = next((r for r in requests if r.status == "Approved"), None)
        if approved_req:
            guest_pass = VisitorRepo.get_guest_access_by_request_id(db, approved_req.id)

    if not guest_pass:
        raise HTTPException(status_code=404, detail="No active guest Wi-Fi access pass found for this user")

    # Apply on-the-fly expiry check
    if guest_pass.status == "Active" and guest_pass.expires_at < datetime.utcnow():
        guest_pass.status = "Expired"
        db.commit()
        db.refresh(guest_pass)

    return SuccessResponse(
        message="Temporary guest access pass loaded.",
        data=GuestAccessResponse.model_validate(guest_pass)
    )

@router.post("/guest/request", response_model=SuccessResponse)
def create_guest_request(
    payload: VisitorRequestCreate,
    db: Session = Depends(get_db)
):
    # Guests can request access anonymously/without auth first
    payload_dict = payload.model_dump()
    payload_dict["visitor_type"] = "Guest"
    request = VisitorService.create_request(db, VisitorRequestCreate(**payload_dict))
    return SuccessResponse(
        message="Guest campus access request submitted for manual review.",
        data=VisitorRequestResponse.model_validate(request)
    )

@router.delete("/guest/request/{id}", response_model=SuccessResponse)
def cancel_guest_request(
    id: int,
    db: Session = Depends(get_db)
):
    request = VisitorRepo.get_by_id(db, id)
    if not request:
        raise HTTPException(status_code=404, detail="Visitor request not found")

    # Cancel request (soft-delete to Expired)
    request.status = "Expired"
    # Revoke any linked guest access passes
    guest = VisitorRepo.get_guest_access_by_request_id(db, request.id)
    if guest:
        guest.status = "Revoked"

    db.commit()
    return SuccessResponse(
        message="Guest campus access request cancelled successfully.",
        data=None
    )


# --- 3. Operator/Faculty Approval endpoints ---

@router.get("/visitor/requests", response_model=SuccessResponse)
def get_all_visitor_requests(
    visitor_type: str = None,
    status: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    faculty = Depends(require_faculty_or_admin)
):
    skip = (page - 1) * limit
    items, total = VisitorService.get_requests(db, visitor_type, status, search, skip, limit)
    return SuccessResponse(
        message="Visitor requests list loaded.",
        data={
            "items": [VisitorRequestResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.post("/visitor/requests/{id}/approve", response_model=SuccessResponse)
def approve_visitor_request(
    id: int,
    db: Session = Depends(get_db),
    faculty = Depends(require_faculty_or_admin)
):
    request = VisitorService.update_request_status(db, id, "Approved", faculty.id)
    resp_data = VisitorRequestResponse.model_validate(request)
    
    # Pack transient password if available for single creator visibility
    serialized = resp_data.model_dump()
    if hasattr(request, "transient_guest"):
        serialized["temporary_guest"] = GuestAccessResponse.model_validate(request.transient_guest).model_dump()

    return SuccessResponse(
        message="Visitor request approved. Temporary Guest access generated.",
        data=serialized
    )

@router.post("/visitor/requests/{id}/reject", response_model=SuccessResponse)
def reject_visitor_request(
    id: int,
    rejection_reason: str = "Request does not meet campus access criteria.",
    db: Session = Depends(get_db),
    faculty = Depends(require_faculty_or_admin)
):
    request = VisitorService.update_request_status(db, id, "Rejected", faculty.id, rejection_reason)
    return SuccessResponse(
        message="Visitor request rejected successfully.",
        data=VisitorRequestResponse.model_validate(request)
    )
