# backend/app/routes/network_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.routes.user_routes import require_admin
from app.schemas.schemas import (
    SubnetCreate, SubnetResponse, PaginatedSubnetsResponse, SuccessResponse
)
from app.repositories.repos import SubnetRepo
from app.services.services import ModuleService

router = APIRouter(prefix="/api/network", tags=["network"])

@router.get("/subnets", response_model=SuccessResponse)
def get_subnets(
    search: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    skip = (page - 1) * limit
    items, total = SubnetRepo.get_subnets(db, search, skip, limit)
    pages = (total + limit - 1) // limit

    return SuccessResponse(
        message="Subnets loaded successfully.",
        data={
            "items": [SubnetResponse.model_validate(i) for i in items],
            "total": total,
            "page": page,
            "pages": pages
        }
    )

@router.post("/subnets", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def create_subnet(
    payload: SubnetCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    subnet = ModuleService.create_subnet(db, payload)
    return SuccessResponse(
        message="Subnet provisioned successfully.",
        data=SubnetResponse.model_validate(subnet)
    )

@router.delete("/subnets/{id}", response_model=SuccessResponse)
def delete_subnet(
    id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    subnet = ModuleService.delete_subnet(db, id)
    return SuccessResponse(
        message="Subnet de-provisioned successfully.",
        data=SubnetResponse.model_validate(subnet)
    )
