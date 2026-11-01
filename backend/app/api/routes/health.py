from fastapi import APIRouter, Depends
from backend.app.schemas.health import HealthResponse
from backend.app.api.dependencies.database import get_graph_state, AppGraphState
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health(state: AppGraphState = Depends(get_graph_state)):
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        records_count=len(state.df) if state.df is not None else 0,
        graph_nodes=state.G.number_of_nodes() if state.G is not None else 0,
        graph_edges=state.G.number_of_edges() if state.G is not None else 0,
        association_edges=state.A.number_of_edges() if state.A is not None else 0,
        embedding_backend=state.embedder.backend if state.embedder is not None else "uninitialized",
        graph_backend=state.active_backend,
        llm_connected=bool(state.llm_client and state.llm_client._client is not None),
        neo4j_connected=bool(state.neo4j_adapter and state.neo4j_adapter.is_connected)
    )

