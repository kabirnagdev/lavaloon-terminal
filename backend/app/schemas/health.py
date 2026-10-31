from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    records_count: int
    graph_nodes: int
    graph_edges: int
    association_edges: int
    embedding_backend: str
    graph_backend: str
    llm_connected: bool
    neo4j_connected: bool

