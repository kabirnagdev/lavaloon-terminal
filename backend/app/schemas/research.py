from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ResearchQueryRequest(BaseModel):
    question: str
    hops: Optional[int] = 2
    mode: Optional[str] = "graph_rag"  # "graph_rag" | "tree_of_thought" | "plain_rag"
    company_id: Optional[str] = None
    ent_thr: Optional[float] = None
    col_thr: Optional[float] = None

class ResearchQueryResponse(BaseModel):
    question: str
    mode: str
    answer: str
    keywords: List[str]
    seeds: List[str]
    seed_labels: List[str]
    triples: List[Dict[str, Any]]
    records: List[str]
    statistics: str
    latency_ms: float
    grounding_confidence: str  # high | moderate | exploratory | insufficient
    linked_entities: Optional[List[Dict[str, Any]]] = None
    records_detail: Optional[List[Dict[str, Any]]] = None
