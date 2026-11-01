import time
from typing import Dict, Any
from backend.app.schemas.research import ResearchQueryRequest, ResearchQueryResponse
from backend.app.api.dependencies.database import AppGraphState

SUGGESTED_RESEARCH_QUESTIONS = [
    "What kind of investors prefer Mutual Funds, and what else do they tend to choose?",
    "How many respondents are male and what is their most popular investment avenue?",
    "What savings objectives and investment behaviour are linked in this survey?",
    "What is the most popular investment avenue overall and why?",
    "What factors motivate investors to allocate capital into Government Bonds versus Equity?",
    "What is the statistical association between age demographics and risk tolerance?"
]

class ResearchService:
    def __init__(self, state: AppGraphState):
        self.state = state

    def execute_query(self, req: ResearchQueryRequest) -> ResearchQueryResponse:
        start_time = time.time()
        copilot = self.state.copilot
        retriever = self.state.retriever

        mode = (req.mode or "graph_rag").lower().strip()
        hops = req.hops or 2

        if mode == "tree_of_thought":
            answer, r = copilot.ask_tot(req.question, hops=hops)
        elif mode == "plain_rag":
            answer = copilot.plain_rag(req.question, k=6)
            r = retriever.retrieve(req.question, hops=hops, ent_thr=req.ent_thr, col_thr=req.col_thr)
        else:
            mode = "graph_rag"
            r = retriever.retrieve(req.question, hops=hops, ent_thr=req.ent_thr, col_thr=req.col_thr)
            prompt = retriever.build_prompt(req.question, r)
            answer = self.state.llm_client.generate(prompt)

        latency = (time.time() - start_time) * 1000.0

        confidence = r.get("evidence_confidence", "high")
        if not r.get("triples") and not r.get("seeds"):
            confidence = "insufficient"
        elif len(r.get("triples", [])) < 3 and confidence != "insufficient":
            confidence = "moderate"

        return ResearchQueryResponse(
            question=req.question,
            mode=mode,
            answer=answer,
            keywords=r.get("keywords", []),
            seeds=r.get("seeds", []),
            seed_labels=r.get("seed_labels", []),
            triples=r.get("triples", []),
            records=r.get("records", []),
            statistics=r.get("profile", ""),
            latency_ms=round(latency, 2),
            grounding_confidence=confidence,
            linked_entities=r.get("linked_entities", []),
            records_detail=r.get("records_detail", [])
        )

