from typing import Optional
from fastapi import APIRouter, Depends, Query
from backend.app.schemas.graph import CytoscapePayload, ShortestPathRequest, ShortestPathResponse
from backend.app.services.graph_service import GraphService
from backend.app.api.dependencies.database import get_graph_state, AppGraphState

router = APIRouter(prefix="/graph", tags=["graph"])

def get_graph_service(state: AppGraphState = Depends(get_graph_state)) -> GraphService:
    return GraphService(state)

@router.get("/cytoscape", response_model=CytoscapePayload)
def get_cytoscape_graph(
    category: Optional[str] = Query(None, description="Filter by column category e.g. Avenue, Factor"),
    min_lift: float = Query(1.5, ge=1.0, le=10.0, description="Minimum association lift filter"),
    max_nodes: int = Query(100, ge=10, le=300, description="Maximum entity nodes returned"),
    search: Optional[str] = Query(None, description="Search term for node labels or values"),
    service: GraphService = Depends(get_graph_service)
):
    return service.get_cytoscape_elements(
        category=category,
        min_lift=min_lift,
        max_nodes=max_nodes,
        search_query=search
    )

@router.post("/paths", response_model=ShortestPathResponse)
def find_path(
    req: ShortestPathRequest,
    service: GraphService = Depends(get_graph_service)
):
    return service.find_shortest_path(
        source=req.source,
        target=req.target,
        max_depth=req.max_depth,
        algorithm=req.algorithm or "unweighted"
    )

