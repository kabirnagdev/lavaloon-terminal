"""
Research Service (Ask the Data) for Lavaloon Terminal.
Strictly grounded in clean data layer with citations (file, row, period) and answer-guarding.
"""

import time
import re
import difflib
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

# Pre-mapped entities and metrics for institutional corporate filings
TICKER_CODES = {
    "aapl": "AAPL",
    "msft": "MSFT",
    "nvda": "NVDA",
    "amzn": "AMZN",
    "tsla": "TSLA",
    "googl": "GOOGL",
    "ril": "RELIANCE",
    "tcs": "TCS",
    "infy": "INFY",
    "hdfc": "HDFCBANK",
    "hdfcbank": "HDFCBANK",
}

COMPANY_NAMES = {
    "apple": "AAPL",
    "microsoft": "MSFT",
    "nvidia": "NVDA",
    "amazon": "AMZN",
    "tesla": "TSLA",
    "google": "GOOGL",
    "gogle": "GOOGL",
    "alphabet": "GOOGL",
    "reliance": "RELIANCE",
    "infosys": "INFY",
    "hdfc bank": "HDFCBANK",
}

# Words that should NEVER be fuzzy-matched to company names or tickers
COMMON_NON_ENTITIES = {
    "most", "more", "many", "much", "best", "cost", "post", "host",
    "channel", "category", "data", "rate", "value", "share", "total",
    "growth", "figure", "figures", "year", "years", "which", "what",
    "where", "when", "how", "earn", "earning", "earnings", "view", "views",
    "list", "tell", "show", "give", "find", "have", "with", "from", "into",
    "highest", "lowest", "average", "median", "rank", "ranking", "rankings"
}

METRIC_MAP = {
    "revenue": "total_revenue",
    "revenues": "total_revenue",
    "sales": "total_revenue",
    "turnover": "total_revenue",
    "gross profit": "gross_profit",
    "operating income": "operating_income",
    "operating profit": "operating_income",
    "net income": "net_income",
    "income": "net_income",
    "profit": "net_income",
    "profits": "net_income",
    "margin": "operating_margin_pct",
    "margins": "operating_margin_pct",
    "operating margin": "operating_margin_pct",
    "debt": "total_debt",
    "debts": "total_debt",
    "assets": "total_assets",
    "cash": "cash_and_equivalents",
    "fcf": "free_cash_flow",
    "free cash flow": "free_cash_flow",
    "operating cash flow": "operating_cash_flow",
    "capex": "capital_expenditure",
    "capital expenditure": "capital_expenditure"
}


def detect_tickers(q_lower: str, llm_client=None, is_custom_dataset: bool = False) -> List[str]:
    """Detects corporate stock tickers via exact ticker matching, company name matching, and typo tolerance."""
    matched = []
    # 1. Exact ticker boundary matching (never fuzzy match 3-4 letter acronyms like 'msft' vs 'most')
    for code, ticker in TICKER_CODES.items():
        if re.search(r'\b' + re.escape(code) + r'\b', q_lower):
            if ticker not in matched:
                matched.append(ticker)

    # 2. Exact company name matching
    for name, ticker in COMPANY_NAMES.items():
        if re.search(r'\b' + re.escape(name) + r'\b', q_lower):
            if ticker not in matched:
                matched.append(ticker)

    # 3. Fuzzy match for typos in full company names ONLY (e.g. "gogle" -> "google", "aple" -> "apple", "nvida" -> "nvidia")
    if not matched:
        words = re.findall(r"\b[a-zA-Z]+\b", q_lower)
        for w in words:
            if len(w) >= 4 and w not in COMMON_NON_ENTITIES:
                candidates = difflib.get_close_matches(w, COMPANY_NAMES.keys(), n=1, cutoff=0.76)
                if candidates:
                    t = COMPANY_NAMES[candidates[0]]
                    if t not in matched:
                        matched.append(t)

    # 4. LLM semantic entity resolution fallback (only if not on a custom uploaded dataset)
    if not matched and llm_client and not is_custom_dataset:
        prompt = (
            f"Identify if this financial question refers to any of these corporate tickers:\n"
            f"[AAPL, MSFT, NVDA, AMZN, TSLA, GOOGL, RELIANCE, TCS, INFY, HDFCBANK]\n"
            f"Question: \"{q_lower}\"\n"
            f"If a company is mentioned (even with typos or alternative phrasing), return ONLY its exact ticker. If none, return NONE."
        )
        try:
            res = llm_client.generate(prompt, temperature=0.0, max_tokens=10).strip().upper()
            for t in ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "GOOGL", "RELIANCE", "TCS", "INFY", "HDFCBANK"]:
                if t in res:
                    matched.append(t)
                    break
        except Exception:
            pass

    return matched


def detect_metrics(q_lower: str) -> List[str]:
    """Detects financial metrics via exact phrase matching and typo-tolerant fuzzy matching."""
    matched = []
    # 1. Exact phrase/word match
    for m_term, m_key in METRIC_MAP.items():
        if m_term in q_lower:
            if m_key not in matched:
                matched.append(m_key)

    # 2. Fuzzy match individual words (e.g. "revenu" -> "revenue", "margn" -> "margin", "incme" -> "income")
    if not matched:
        words = re.findall(r"\b[a-zA-Z]+\b", q_lower)
        single_word_metrics = {k: v for k, v in METRIC_MAP.items() if " " not in k}
        for w in words:
            if len(w) >= 4:
                candidates = difflib.get_close_matches(w, single_word_metrics.keys(), n=1, cutoff=0.72)
                if candidates:
                    m_key = single_word_metrics[candidates[0]]
                    if m_key not in matched:
                        matched.append(m_key)

    if not matched:
        matched = ["total_revenue", "net_income", "operating_margin_pct"]
    return matched


def extract_requested_periods(text: str) -> List[str]:
    """Extracts target fiscal periods (e.g. FY2025, FY24, 2025, or between FY2023 and FY2025) from the query."""
    text_upper = text.upper()
    found_periods = set()

    # 1. Range match: "between FY2023 and FY2025" or "from 2023 to 2025"
    range_match = re.search(r"\b(?:BETWEEN|FROM)\s+(?:FY)?(\d{4})\s+(?:AND|TO)\s+(?:FY)?(\d{4})\b", text_upper)
    if range_match:
        y1, y2 = sorted([int(range_match.group(1)), int(range_match.group(2))])
        for yr in range(y1, y2 + 1):
            found_periods.add(f"FY{yr}")
    else:
        # 2. FY patterns: FY2022, FY2023, FY 2024, FY24, FY25, FY26
        fy_matches = re.findall(r"\bFY\s*(\d{2,4})\b", text_upper)
        for m in fy_matches:
            if len(m) == 2:
                found_periods.add(f"FY20{m}")
            elif len(m) == 4:
                found_periods.add(f"FY{m}")

        # 3. Standalone 4-digit years: 2020 to 2028 (if not preceded/followed by CIK or other IDs)
        year_matches = re.findall(r"(?<![A-Z0-9_])(202[0-9])(?![A-Z0-9_])", text_upper)
        for y in year_matches:
            found_periods.add(f"FY{y}")

    return sorted(list(found_periods))


def format_metric_value(val: float, unit: str, currency: str) -> str:
    """Formats a numeric metric value based on currency and unit."""
    if unit == "%":
        return f"{val:.2f}%"
    elif currency == "USD":
        return f"${val/1e9:.2f}B" if abs(val) >= 1e9 else f"${val:,}"
    else:
        return f"₹{val:,} Cr"


class ResearchService:
    def __init__(self, state: AppGraphState):
        self.state = state

    def execute_query(self, req: ResearchQueryRequest) -> ResearchQueryResponse:
        start_time = time.time()
        q_lower = req.question.lower()

        active_dataset = getattr(self.state, "active_dataset_name", "")
        is_custom = bool(active_dataset and active_dataset != "Finance_data.csv")

        # 1. Detect if the question targets corporate financial entities (with exact, fuzzy typo, and LLM fallback)
        matched_tickers = detect_tickers(q_lower, llm_client=self.state.llm_client, is_custom_dataset=is_custom)

        # Detect metrics (with exact and fuzzy typo matching)
        matched_metrics = detect_metrics(q_lower)

        # If corporate entities detected, answer directly from clean data layer with citations
        if matched_tickers:
            requested_periods = extract_requested_periods(req.question)

            raw_records: List[Dict[str, Any]] = []
            for ticker in matched_tickers:
                for m_key in matched_metrics:
                    series = data_service.get_series(ticker, m_key)
                    raw_records.extend(series)

            # If specific periods/years were requested, filter strictly to them!
            if requested_periods:
                retrieved_records = [r for r in raw_records if r.get("period") in requested_periods]
            else:
                retrieved_records = raw_records

            if not retrieved_records:
                answer = "Not available in provided data."
                confidence = "insufficient"
            else:
                lines = []
                for ticker in matched_tickers:
                    t_recs = [r for r in retrieved_records if r["ticker"] == ticker]
                    if not t_recs:
                        continue
                    comp_name = t_recs[0]["company"] if t_recs else ticker
                    lines.append(f"### {comp_name} ({ticker})")
                    for m_key in matched_metrics:
                        pts = [r for r in t_recs if r["metric"] == m_key]
                        if pts:
                            if len(pts) == 1:
                                p = pts[0]
                                formatted = format_metric_value(p["value"], p["unit"], p["currency"])
                                lines.append(f"- **{m_key.replace('_', ' ').title()}** ({p['period']}): **{formatted}**")
                            else:
                                pt_strs = []
                                for p in pts:
                                    formatted = format_metric_value(p["value"], p["unit"], p["currency"])
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
                keywords=matched_tickers + matched_metrics + requested_periods,
                seeds=matched_tickers,
                seed_labels=matched_tickers,
                triples=[],
                records=[f"{r['ticker']} {r['metric']} {r['period']}: {r['value']}" for r in retrieved_records[:10]],
                statistics="",
                latency_ms=round(latency, 2),
                grounding_confidence=confidence,
                linked_entities=[],
                records_detail=retrieved_records
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
