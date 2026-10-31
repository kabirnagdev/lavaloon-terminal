from typing import Dict, Any
from backend.app.schemas.diligence import DiligenceRequest, DiligenceResponse
from backend.app.api.dependencies.database import AppGraphState

class DiligenceService:
    def __init__(self, state: AppGraphState):
        self.state = state

    def analyze_target(self, req: DiligenceRequest) -> DiligenceResponse:
        res = self.state.diligence_pipeline.generate_report(req.target_id, req.scope)
        return DiligenceResponse(
            target=res["target"],
            executive_summary=res["executive_summary"],
            graph_associations=res["graph_associations"],
            triples=res["triples"],
            statistical_profile=res["statistical_profile"],
            records=res["records"],
            verified_facts=res["verified_facts"],
            disclaimers=res["disclaimers"]
        )

