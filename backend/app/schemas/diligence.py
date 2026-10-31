from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DiligenceRequest(BaseModel):
    target_id: str
    scope: Optional[List[str]] = None

class DiligenceResponse(BaseModel):
    target: str
    executive_summary: str
    graph_associations: List[Dict[str, Any]]
    triples: List[Dict[str, Any]]
    statistical_profile: str
    records: List[str]
    verified_facts: List[str]
    disclaimers: List[str]

