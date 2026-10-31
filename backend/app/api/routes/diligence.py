from fastapi import APIRouter, Depends
from backend.app.schemas.diligence import DiligenceRequest, DiligenceResponse
from backend.app.services.diligence_service import DiligenceService
from backend.app.api.dependencies.database import get_graph_state, AppGraphState

router = APIRouter(prefix="/diligence", tags=["diligence"])

def get_diligence_service(state: AppGraphState = Depends(get_graph_state)) -> DiligenceService:
    return DiligenceService(state)

@router.post("/analyze", response_model=DiligenceResponse)
def analyze_due_diligence(
    req: DiligenceRequest,
    service: DiligenceService = Depends(get_diligence_service)
):
    return service.analyze_target(req)

