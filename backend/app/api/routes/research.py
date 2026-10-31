from typing import List
from fastapi import APIRouter, Depends
from backend.app.schemas.research import ResearchQueryRequest, ResearchQueryResponse
from backend.app.services.research_service import ResearchService, SUGGESTED_RESEARCH_QUESTIONS
from backend.app.api.dependencies.database import get_graph_state, AppGraphState

router = APIRouter(prefix="/research", tags=["research"])

def get_research_service(state: AppGraphState = Depends(get_graph_state)) -> ResearchService:
    return ResearchService(state)

@router.post("/query", response_model=ResearchQueryResponse)
def execute_query(
    req: ResearchQueryRequest,
    service: ResearchService = Depends(get_research_service)
):
    return service.execute_query(req)

@router.get("/suggested-questions", response_model=List[str])
def get_suggested_questions():
    return SUGGESTED_RESEARCH_QUESTIONS

