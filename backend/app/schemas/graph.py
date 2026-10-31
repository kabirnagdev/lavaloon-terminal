from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CytoscapeNodeData(BaseModel):
    id: str
    label: str
    ntype: str
    category: str
    col: Optional[str] = None
    value: Optional[str] = None
    degree: int = 0
    records_count: int = 0
    color: Optional[str] = None

class CytoscapeNode(BaseModel):
    data: CytoscapeNodeData

class CytoscapeEdgeData(BaseModel):
    id: str
    source: str
    target: str
    predicate: str
    count: int = 1
    lift: float = 1.0

class CytoscapeEdge(BaseModel):
    data: CytoscapeEdgeData

class CytoscapePayload(BaseModel):
    elements: Dict[str, Any]  # {"nodes": [...], "edges": [...]}
    categories: List[str]
    total_nodes: int
    total_edges: int

class ShortestPathRequest(BaseModel):
    source: str
    target: str
    max_depth: Optional[int] = 3
    algorithm: Optional[str] = "unweighted"  # "unweighted" | "weighted_inverse_lift"

class PathEdge(BaseModel):
    source: str
    target: str
    lift: float
    distance: Optional[float] = None
    count: int

class ShortestPathResponse(BaseModel):
    found: bool
    path: List[str]
    hops: Optional[int] = 0
    edges: List[PathEdge] = []
    total_distance: Optional[float] = 0.0
    algorithm: Optional[str] = "unweighted"
    message: Optional[str] = None
