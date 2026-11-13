"""
Research Service (Ask the Data) for Lavaloon Terminal.
Strictly grounded in clean data layer with citations (file, row, period) and answer-guarding.
"""

import time
import re
from typing import Dict, Any, List, Optional
from backend.app.schemas.research import ResearchQueryRequest, ResearchQueryResponse
from backend.app.api.dependencies.database import AppGraphState
from backend.app.data_layer.data_service import data_service
from backend.app.analytics.answer_guard import answer_guard_check, format_grounded_answer
from backend.app.analytics.metrics import calculate_yoy_growth, calculate_operating_margin, normalize_currency

SUGGESTED_RESEARCH_QUESTIONS = [
    "What was Apple's total revenue and net income in FY2025?",
    "Compare Microsoft and Apple operating margins over recent fiscal periods.",
    "What are NVIDIA's revenue growth figures between FY2023 and FY2025?",
    "What are the reported revenues of Reliance Industries in INR Crores?",
    "What percentage of surveyed investors prefer Mutual Funds for wealth creation?"
]

KNOWN_ENTITIES = {
    "aapl": "AAPL",
    "apple": "AAPL",
    "msft": "MSFT",
    "microsoft": "MSFT",
    "nvda": "NVDA",
    "nvidia": "NVDA",
    "amzn": "AMZN",
    "amazon": "AMZN",
    "tsla": "TSLA",
    "tesla": "TSLA",
    "googl": "GOOGL",
    "alphabet": "GOOGL",
    "google": "GOOGL",
    "reliance": "RELIANCE",
    "tcs": "TCS",
    "infy": "INFY",
    "infosys": "INFY",
    "hdfc": "HDFCBANK",
    "hdfcbank": "HDFCBANK"
}

METRIC_MAP = {
    "revenue": "total_revenue",
    "sales": "total_revenue",
    "turnover": "total_revenue",
    "gross profit": "gross_profit",
    "operating income": "operating_income",
    "operating profit": "operating_income",
    "net income": "net_income",
    "profit": "net_income",
    "margin": "operating_margin_pct",
    "operating margin": "operating_margin_pct",
    "debt": "total_debt",
    "assets": "total_assets",
    "cash": "cash_and_equivalents",
    "fcf": "free_cash_flow",
    "free cash flow": "free_cash_flow",
    "operating cash flow": "operating_cash_flow",
    "capex": "capital_expenditure",
    "capital expenditure": "capital_expenditure"
}


class ResearchService:
    def __init__(self, state: AppGraphState):
        self.state = state

    def execute_query(self, req: ResearchQueryRequest) -> ResearchQueryResponse:
        start_time = time.time()
        q_lower = req.question.lower()

        # 1. Detect if the question targets corporate financial entities
        matched_tickers = []
        for word, ticker in KNOWN_ENTITIES.items():
            if re.search(r'\b' + re.escape(word) + r'\b', q_lower):
                if ticker not in matched_tickers:
                    matched_tickers.append(ticker)

        # Detect metrics
        matched_metrics = []
        for m_term, m_key in METRIC_MAP.items():
            if m_term in q_lower:
                if m_key not in matched_metrics:
                    matched_metrics.append(m_key)
        if not matched_metrics:
            matched_metrics = ["total_revenue", "net_income", "operating_margin_pct"]

        # If corporate entities detected, answer directly from clean data layer with citations
        if matched_tickers:
            retrieved_records: List[Dict[str, Any]] = []
            for ticker in matched_tickers:
                for m_key in matched_metrics:
                    series = data_service.get_series(ticker, m_key)
                    retrieved_records.extend(series)

            if not retrieved_records:
                answer = "Not available in provided data."
                confidence = "insufficient"
            else:
                lines = []
                for ticker in matched_tickers:
                    t_recs = [r for r in retrieved_records if r["ticker"] == ticker]
                    comp_name = t_recs[0]["company"] if t_recs else ticker
                    lines.append(f"### {comp_name} ({ticker})")
                    for m_key in matched_metrics:
                        pts = [r for r in t_recs if r["metric"] == m_key]
                        if pts:
                            pt_strs = []
                            for p in pts:
                                v = p["value"]
                                u = p["unit"]
                                c = p["currency"]
                                if u == "%":
                                    formatted = f"{v:.2f}%"
                                elif c == "USD":
                                    formatted = f"${v/1e9:.2f}B" if abs(v) >= 1e9 else f"${v:,}"
                                else:
                                    formatted = f"₹{v:,} Cr"
                                pt_strs.append(f"{p['period']}: {formatted}")
                            lines.append(f"- **{m_key.replace('_', ' ').title()}**: " + ", ".join(pt_strs))
                    lines.append("")

                base_answer = "\n".join(lines)
                answer = format_grounded_answer(req.question, base_answer, retrieved_records)
                confidence = "high"

            latency = (time.time() - start_time) * 1000.0
            return ResearchQueryResponse(
                question=req.question,
                mode="data_layer_grounded",
                answer=answer,
                keywords=matched_tickers + matched_metrics,
                seeds=matched_tickers,
                seed_labels=matched_tickers,
                triples=[],
                records=[f"{r['ticker']} {r['metric']} {r['period']}: {r['value']}" for r in retrieved_records[:10]],
                statistics="",
                latency_ms=round(latency, 2),
                grounding_confidence=confidence,
                linked_entities=[],
                records_detail=retrieved_records[:15]
            )

        # 2. Otherwise fallback to survey GraphRAG
        copilot = self.state.copilot
        retriever = self.state.retriever
        mode = (req.mode or "graph_rag").lower().strip()
        hops = req.hops or 2

        try:
            r = retriever.retrieve(req.question, hops=hops, ent_thr=req.ent_thr, col_thr=req.col_thr)
            prompt = retriever.build_prompt(req.question, r)
            raw_answer = self.state.llm_client.generate(prompt)

            if not r.get("records") and not r.get("triples"):
                answer = "Not available in provided data."
                confidence = "insufficient"
            else:
                answer = raw_answer
                confidence = "high" if len(r.get("records", [])) > 0 else "moderate"
        except Exception:
            answer = "Not available in provided data."
            confidence = "insufficient"
            r = {}

        latency = (time.time() - start_time) * 1000.0
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
