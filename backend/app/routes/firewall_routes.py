# backend/app/routes/firewall_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    SecurityPolicyCreate, SecurityPolicyResponse, PaginatedSecurityPoliciesResponse, SuccessResponse
)
from app.repositories.repos import PolicyRepo
from app.services.services import ModuleService

router = APIRouter(prefix="/api/firewall", tags=["firewall"])

@router.get("/rules", response_model=SuccessResponse)
def get_rules(
    search: str = None,
    protocol: str = None,
    policy_action: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = PolicyRepo.get_policies(db, search, protocol, policy_action, skip, limit)
    pages = (total + limit - 1) // limit

    return SuccessResponse(
        message="Security policies loaded successfully.",
        data={
            "items": [SecurityPolicyResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.post("/rules", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_rule(
    payload: SecurityPolicyCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    policy = ModuleService.create_policy(db, payload)
    return SuccessResponse(
        message="Security policy rule created successfully.",
        data=SecurityPolicyResponse.model_validate(policy)
    )

@router.delete("/rules/{id}", response_model=SuccessResponse)
def delete_rule(
    id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    policy = ModuleService.delete_policy(db, id)
    return SuccessResponse(
        message="Security policy rule deleted successfully.",
        data=SecurityPolicyResponse.model_validate(policy)
    )
