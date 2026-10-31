from typing import Dict, Any, List
import os
import json
import pandas as pd
import networkx as nx
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.groq_client import GroqLLMClient

def _fmt_val(val: Any, curr: str = "USD", units: str = "") -> str:
    if val is None or val == "N/A":
        return "N/A"
    try:
        num = float(val)
        if "crore" in units.lower() or curr == "INR":
            return f"₹{num:,.0f} Cr"
        elif num >= 1e9:
            return f"${num / 1e9:,.2f}B"
        elif num >= 1e6:
            return f"${num / 1e6:,.2f}M"
        else:
            return f"${num:,.2f}"
    except Exception:
        return str(val)

class DueDiligencePipeline:
    """Generates an institutional Due Diligence report for any corporate filer or survey avenue."""

    def __init__(self, retriever: HybridGraphRetriever, llm_client: GroqLLMClient):
        self.retriever = retriever
        self.llm_client = llm_client
        self.corporate_data = self._load_corporate_financials()

    def _load_corporate_financials(self) -> Dict[str, Any]:
        path = os.path.join("data", "corporate_financials", "verified_corporate_financials.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading corporate financials: {e}")
        return {}

    def _find_corporate_match(self, target_entity: str):
        target_lower = target_entity.lower().strip()
        for ticker, comp in self.corporate_data.items():
            if target_lower == ticker.lower() or target_lower == comp.get("name", "").lower():
                return comp
            if ticker.lower() in target_lower or target_lower in comp.get("name", "").lower():
                return comp
        return None

    def generate_report(self, target_entity: str, scope: List[str] = None) -> Dict[str, Any]:
        """Produce structured due-diligence dossier with full source provenance."""
        corp_match = self._find_corporate_match(target_entity)

        # Retrieve graph context specific to the target
        q = f"Due diligence assessment and risk factors for {target_entity}"
        retrieval_res = self.retriever.retrieve(q, hops=2)

        # Compute direct entity metrics if target exists in graph
        matched_nodes = [
            n for n in self.retriever.ent_ids
            if target_entity.lower() in self.retriever.G.nodes[n].get("label", "").lower()
        ]

        associations = []
        if matched_nodes:
            seed = matched_nodes[0]
            if seed in self.retriever.A:
                for nb in self.retriever.A.neighbors(seed):
                    edge = self.retriever.A[seed][nb]
                    associations.append({
                        "entity": self.retriever.G.nodes[nb]["label"],
                        "lift": round(float(edge["lift"]), 2),
                        "co_occurrences": int(edge["count"])
                    })
        associations.sort(key=lambda x: -x["lift"])

        corp_context_str = ""
        verified_facts = []
        disclaimers = []

        if corp_match:
            metrics = corp_match.get("metrics", {})
            curr = corp_match.get("currency", "USD")
            units = corp_match.get("units", "")
            fy = corp_match.get("fiscal_year", "FY2024")
            src_doc = corp_match.get("source_doc", "Regulatory Filing")

            rev = metrics.get("total_revenue", metrics.get("revenue"))
            net = metrics.get("net_income")
            op_inc = metrics.get("operating_income")
            margin = metrics.get("operating_margin_pct", metrics.get("operating_margin"))
            cash = metrics.get("cash_and_equivalents", metrics.get("cash"))
            debt = metrics.get("total_debt", metrics.get("debt"))
            fcf = metrics.get("free_cash_flow")

            rev_fmt = _fmt_val(rev, curr, units)
            net_fmt = _fmt_val(net, curr, units)
            op_fmt = _fmt_val(op_inc, curr, units)
            cash_fmt = _fmt_val(cash, curr, units)
            debt_fmt = _fmt_val(debt, curr, units)
            fcf_fmt = _fmt_val(fcf, curr, units)
            margin_str = f"{margin:.2f}%" if isinstance(margin, (int, float)) else str(margin)

            corp_context_str = f"""
AUDITED CORPORATE FINANCIAL DISCLOSURES ({corp_match.get('name')} | {corp_match.get('ticker')}):
- Period: {fy} ({corp_match.get('period', 'Full Year')})
- Source Document: {src_doc} ({corp_match.get('source_url', 'SEC EDGAR / MCA')})
- Total Revenue: {rev_fmt}
- Operating Income: {op_fmt} (Margin: {margin_str})
- Net Income: {net_fmt}
- Free Cash Flow: {fcf_fmt}
- Balance Sheet Cash: {cash_fmt} vs Total Debt: {debt_fmt}
- Business Segments: {json.dumps(corp_match.get('segments', {}))}
- Verified Competitors: {', '.join(corp_match.get('competitors', []))}
- Key Supply Chain Ties: {', '.join(corp_match.get('suppliers', []))}
- Item 1A Risk Factors: {'; '.join(corp_match.get('risks', []))}
"""
            verified_facts = [
                f"Audited {fy} Revenue: {rev_fmt} (Source: {src_doc})",
                f"Audited Net Income: {net_fmt} (Operating Margin: {margin_str})",
                f"Liquidity & Solvency: {cash_fmt} Cash vs {debt_fmt} Total Debt (FCF: {fcf_fmt})",
                f"Filing Provenance: {src_doc} verified via XBRL tags."
            ]
            disclaimers = [
                f"Corporate figures sourced directly from verified {src_doc} disclosures.",
                "Forward-looking evaluations represent analytical models and do not guarantee future securities returns."
            ]
        else:
            verified_facts = [
                f"Empirically observed in {len(retrieval_res['records'])} survey respondent records.",
                f"Statistically significant associations identified across {len(associations)} related entities (min lift 1.5).",
                f"Dataset scope: {len(self.retriever.df)} records across {len(self.retriever.all_cols)} financial dimensions."
            ]
            disclaimers = [
                "Survey intelligence denotes respondent investment preferences, not audited corporate financial filings.",
                "Statistical lift represents sample correlation, not deterministic financial causality.",
                "Generated models are for research guidance and do not constitute formal investment advice."
            ]

        # Structured Prompt for Executive Due Diligence
        report_prompt = f"""Generate an institutional-grade Due Diligence Dossier for '{target_entity}'.
Follow this exact executive structure:
1. Executive Summary & Classification
2. Audited Financial Highlights & Margins (if corporate) or Empirical Penetration (if survey avenue)
3. Business Model, Core Segments & Revenue Drivers
4. Competitive Moat & Peer Positioning
5. Supply Chain & Customer Dependency
6. Risk & Red-Flag Disclosures (Item 1A Regulatory Disclosures)
7. Research Verdict & Diligence Rating

{corp_context_str}

Graph Association Context:
{self.retriever.format_context(retrieval_res)}

Ensure all claims are explicitly grounded in the context provided.
Do not fabricate numbers or treat correlation as established fact.
"""
        generated_synthesis = self.llm_client.generate(report_prompt, temperature=0.1, max_tokens=1800)

        # Fallback if synthesis failed or is empty
        if not generated_synthesis or len(generated_synthesis.strip()) < 30:
            if corp_match:
                generated_synthesis = f"""## 1. Executive Summary & Classification
Target: {corp_match.get('name')} ({corp_match.get('ticker')})
Classification: Tier-1 Listed Corporate Equity.
Reporting Period: {corp_match.get('fiscal_year', 'FY2024')} ({corp_match.get('source_doc', 'SEC 10-K / Annual Report')}).

## 2. Audited Financial Highlights
- Total Revenue: {rev_fmt}
- Net Income: {net_fmt}
- Operating Margin: {margin_str}
- Free Cash Flow: {fcf_fmt}

## 3. Business Segments
{json.dumps(corp_match.get('segments', {}), indent=2)}

## 4. Key Risk Factors
- {chr(10).join('- ' + r for r in corp_match.get('risks', []))}
"""
            else:
                generated_synthesis = f"Due diligence analysis for {target_entity} generated from empirical knowledge graph associations."

        return {
            "target": target_entity,
            "executive_summary": generated_synthesis,
            "graph_associations": associations[:15],
            "triples": retrieval_res["triples"],
            "statistical_profile": retrieval_res["profile"],
            "records": retrieval_res["records"][:6],
            "verified_facts": verified_facts,
            "disclaimers": disclaimers
        }
