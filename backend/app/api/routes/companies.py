from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from backend.app.schemas.company import CompanySummary, CompanyDetail, RelationshipNode
from backend.app.services.company_service import CompanyService
from backend.app.api.dependencies.database import get_graph_state, AppGraphState

router = APIRouter(prefix="/companies", tags=["companies"])

def get_company_service(state: AppGraphState = Depends(get_graph_state)) -> CompanyService:
    return CompanyService(state)

@router.get("", response_model=List[CompanySummary])
def list_companies(
    coverage_type: Optional[str] = None,
    service: CompanyService = Depends(get_company_service)
):
    return service.list_companies(coverage_type)

@router.get("/{company_id}", response_model=CompanyDetail)
def get_company(
    company_id: str,
    service: CompanyService = Depends(get_company_service)
):
    company = service.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company or avenue '{company_id}' not found.")
    return company

@router.get("/{company_id}/relationships", response_model=List[RelationshipNode])
def get_relationships(
    company_id: str,
    service: CompanyService = Depends(get_company_service)
):
    return service.get_relationships(company_id)

