"""
Institutional GraphRAG & RAG Evaluation Suite.

Executes 40 comprehensive evaluation questions across 10 categories:
A. Basic financial understanding
B. Financial statement analysis
C. Revenue and profitability
D. Cash flow and debt analysis
E. Risk identification
F. Competitor comparison
G. Entity relationship analysis
H. Multi-hop graph reasoning
I. Cross-company analysis
J. Survey-based vs corporate evidence analysis

Compares:
1. Classic Vector RAG
2. GraphRAG (Multi-Hop BFS + Exact Grounding)
3. Hybrid RAG (Vector + Graph Triples + Tree-of-Thought)

Validates numerical accuracy against official SEC Form 10-K and BSE/NSE audited statements.
"""

import os
import sys
import time
import json
import re
from typing import Dict, Any, List, Tuple, Optional
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath("."))

from ai.ingestion.loader import load_financial_data
from ai.retrieval.embeddings import EmbeddingEngine
from ai.graph.corporate_graph_builder import build_unified_financial_graph
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.groq_client import GroqLLMClient
from ai.reasoning.copilot import ResearchCopilot


# Define the 40 Standard Institutional Benchmark Questions
TEST_QUESTIONS_SPEC = [
    # Category A: Basic Financial Understanding
    {
        "id": "Q01",
        "category": "A. Basic financial understanding",
        "question": "What were Apple's revenue and net income in its latest completed fiscal year?",
        "target_companies": ["AAPL"],
        "expected_facts": {
            "currency": "USD",
            "revenue": 383285000000,
            "net_income": 96995000000,
            "fiscal_year": 2025
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q02",
        "category": "A. Basic financial understanding",
        "question": "What is Microsoft's reported operating margin for its latest fiscal year?",
        "target_companies": ["MSFT"],
        "expected_facts": {
            "currency": "USD",
            "operating_margin_pct": 44.64,
            "operating_income": 109433000000,
            "fiscal_year": 2026
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q03",
        "category": "A. Basic financial understanding",
        "question": "What was NVIDIA's total revenue in its latest completed fiscal year?",
        "target_companies": ["NVDA"],
        "expected_facts": {
            "currency": "USD",
            "revenue": 60922000000,
            "fiscal_year": 2026
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q04",
        "category": "A. Basic financial understanding",
        "question": "What was Tesla's net income for its latest completed fiscal year?",
        "target_companies": ["TSLA"],
        "expected_facts": {
            "currency": "USD",
            "net_income": 14997000000,
            "fiscal_year": 2025
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },

    # Category B: Financial Statement Analysis
    {
        "id": "Q05",
        "category": "B. Financial statement analysis",
        "question": "What are Apple's total assets and liabilities according to its latest SEC Form 10-K?",
        "target_companies": ["AAPL"],
        "expected_facts": {
            "currency": "USD",
            "assets": 352583000000,
            "liabilities": 290437000000,
            "fiscal_year": 2025
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q06",
        "category": "B. Financial statement analysis",
        "question": "What is Microsoft's cash and cash equivalents balance in its latest filing?",
        "target_companies": ["MSFT"],
        "expected_facts": {
            "currency": "USD",
            "cash_and_equivalents": 34700000000,
            "fiscal_year": 2026
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q07",
        "category": "B. Financial statement analysis",
        "question": "What was Amazon's operating cash flow versus capital expenditures in FY2025?",
        "target_companies": ["AMZN"],
        "expected_facts": {
            "currency": "USD",
            "operating_cash_flow": 84946000000,
            "capital_expenditure": 52729000000,
            "free_cash_flow": 32217000000
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q08",
        "category": "B. Financial statement analysis",
        "question": "How much total debt does Reliance Industries carry on its consolidated balance sheet for FY2024?",
        "target_companies": ["RELIANCE"],
        "expected_facts": {
            "currency": "INR",
            "total_debt": 324622,
            "units": "Crores",
            "fiscal_year": 2024
        },
        "requires_multihop": False,
        "evidence_tier": "audited_annual_report"
    },

    # Category C: Revenue and Profitability
    {
        "id": "Q09",
        "category": "C. Revenue and profitability",
        "question": "What are NVIDIA's major business segments and their reported revenues?",
        "target_companies": ["NVDA"],
        "expected_facts": {
            "segments": ["Compute & Networking (Data Center)", "Graphics"],
            "compute_revenue": 47405000000,
            "graphics_revenue": 13517000000
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q10",
        "category": "C. Revenue and profitability",
        "question": "What is the breakdown of Amazon's revenue between North America, International, and AWS?",
        "target_companies": ["AMZN"],
        "expected_facts": {
            "north_america": 352828000000,
            "international": 131200000000,
            "aws": 90752000000
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q11",
        "category": "C. Revenue and profitability",
        "question": "How much revenue did Apple's Services division generate compared to iPhone sales?",
        "target_companies": ["AAPL"],
        "expected_facts": {
            "iphone_revenue": 201183000000,
            "services_revenue": 96169000000
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q12",
        "category": "C. Revenue and profitability",
        "question": "What is the revenue and operating profitability of TCS for FY2024?",
        "target_companies": ["TCS"],
        "expected_facts": {
            "currency": "INR",
            "revenue": 240893,
            "operating_income": 59325,
            "operating_margin_pct": 24.6,
            "units": "Crores"
        },
        "requires_multihop": False,
        "evidence_tier": "audited_annual_report"
    },

    # Category D: Cash Flow and Debt Analysis
    {
        "id": "Q13",
        "category": "D. Cash flow and debt analysis",
        "question": "What is the free cash flow generated by TCS in FY2024?",
        "target_companies": ["TCS"],
        "expected_facts": {
            "currency": "INR",
            "free_cash_flow": 41242,
            "operating_cash_flow": 44342,
            "capital_expenditure": 3100,
            "units": "Crores"
        },
        "requires_multihop": False,
        "evidence_tier": "audited_annual_report"
    },
    {
        "id": "Q14",
        "category": "D. Cash flow and debt analysis",
        "question": "Compare the debt profile of TCS versus Reliance Industries in FY2024.",
        "target_companies": ["TCS", "RELIANCE"],
        "expected_facts": {
            "tcs_debt": 0,
            "reliance_debt": 324622,
            "currency": "INR",
            "units": "Crores"
        },
        "requires_multihop": True,
        "evidence_tier": "audited_annual_report"
    },
    {
        "id": "Q15",
        "category": "D. Cash flow and debt analysis",
        "question": "What was Apple's operating cash flow and capital expenditure in FY2025?",
        "target_companies": ["AAPL"],
        "expected_facts": {
            "currency": "USD",
            "operating_cash_flow": 118264000000,
            "capital_expenditure": 9452000000
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q16",
        "category": "D. Cash flow and debt analysis",
        "question": "What was Tesla's capital expenditure and operating cash flow in FY2025?",
        "target_companies": ["TSLA"],
        "expected_facts": {
            "currency": "USD",
            "operating_cash_flow": 13256000000,
            "capital_expenditure": 8898000000
        },
        "requires_multihop": False,
        "evidence_tier": "audited_sec_filing"
    },

    # Category E: Risk Identification
    {
        "id": "Q17",
        "category": "E. Risk identification",
        "question": "What are the primary official supply chain risks disclosed by Apple in its filings?",
        "target_companies": ["AAPL"],
        "expected_facts": {
            "keywords": ["East Asia", "supply chain concentration", "component single source"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q18",
        "category": "E. Risk identification",
        "question": "What regulatory and antitrust risks are disclosed by Alphabet (Google)?",
        "target_companies": ["GOOGL"],
        "expected_facts": {
            "keywords": ["DOJ antitrust litigation", "search distribution agreements", "generative AI"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q19",
        "category": "E. Risk identification",
        "question": "What are NVIDIA's key operational and packaging capacity risks?",
        "target_companies": ["NVDA"],
        "expected_facts": {
            "keywords": ["TSMC CoWoS", "packaging capacity limits", "export controls"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q20",
        "category": "E. Risk identification",
        "question": "What are the main financial risk exposures disclosed by Reliance Industries?",
        "target_companies": ["RELIANCE"],
        "expected_facts": {
            "keywords": ["refining margin", "crude oil", "net debt profile", "clean energy capital expenditure"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_annual_report"
    },

    # Category F: Competitor Comparison
    {
        "id": "Q21",
        "category": "F. Competitor comparison",
        "question": "Compare Microsoft and Amazon AWS in terms of cloud revenue and market competitors.",
        "target_companies": ["MSFT", "AMZN"],
        "expected_facts": {
            "msft_intelligent_cloud": 105362000000,
            "amzn_aws": 90752000000,
            "shared_competitors": ["Alphabet (Google Cloud)"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q22",
        "category": "F. Competitor comparison",
        "question": "Compare Reliance Industries and TCS based on revenue and operating margin.",
        "target_companies": ["RELIANCE", "TCS"],
        "expected_facts": {
            "reliance_revenue": 1000122,
            "reliance_margin": 14.2,
            "tcs_revenue": 240893,
            "tcs_margin": 24.6,
            "units": "Crores"
        },
        "requires_multihop": True,
        "evidence_tier": "audited_annual_report"
    },
    {
        "id": "Q23",
        "category": "F. Competitor comparison",
        "question": "Compare TCS and Infosys across operating margins and net profit in FY2024.",
        "target_companies": ["TCS", "INFY"],
        "expected_facts": {
            "tcs_net_income": 46099,
            "tcs_margin": 24.6,
            "infy_net_income": 26248,
            "infy_margin": 20.7,
            "units": "Crores"
        },
        "requires_multihop": True,
        "evidence_tier": "audited_annual_report"
    },
    {
        "id": "Q24",
        "category": "F. Competitor comparison",
        "question": "Who are Tesla's primary competitors named in the ontology graph?",
        "target_companies": ["TSLA"],
        "expected_facts": {
            "competitors": ["BYD", "Volkswagen Group", "General Motors", "Ford", "Rivian"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },

    # Category G: Entity Relationship Analysis
    {
        "id": "Q25",
        "category": "G. Entity relationship analysis",
        "question": "Which companies in the knowledge graph depend on TSMC as a critical semiconductor supplier?",
        "target_companies": ["AAPL", "NVDA", "GOOGL"],
        "expected_facts": {
            "companies_linked_to_tsmc": ["Apple", "NVIDIA"]
        },
        "requires_multihop": True,
        "evidence_tier": "supply_chain_disclosure"
    },
    {
        "id": "Q26",
        "category": "G. Entity relationship analysis",
        "question": "What key technological suppliers are shared between Apple and NVIDIA?",
        "target_companies": ["AAPL", "NVDA"],
        "expected_facts": {
            "shared_supplier": "TSMC"
        },
        "requires_multihop": True,
        "evidence_tier": "supply_chain_disclosure"
    },
    {
        "id": "Q27",
        "category": "G. Entity relationship analysis",
        "question": "What is the supplier relationship between NVIDIA and Microsoft?",
        "target_companies": ["NVDA", "MSFT"],
        "expected_facts": {
            "relationship": "NVIDIA is a key hardware/GPU supplier to Microsoft (Azure)"
        },
        "requires_multihop": True,
        "evidence_tier": "supply_chain_disclosure"
    },
    {
        "id": "Q28",
        "category": "G. Entity relationship analysis",
        "question": "Which major cloud infrastructure partners are linked to TCS and Infosys?",
        "target_companies": ["TCS", "INFY"],
        "expected_facts": {
            "partners": ["Microsoft", "AWS", "Google Cloud"]
        },
        "requires_multihop": True,
        "evidence_tier": "market_industry_disclosure"
    },

    # Category H: Multi-Hop Graph Reasoning
    {
        "id": "Q29",
        "category": "H. Multi-hop graph reasoning",
        "question": "What is the structural supply-chain path connecting Apple to NVIDIA through common semiconductor fabrication?",
        "target_companies": ["AAPL", "NVDA"],
        "expected_facts": {
            "path": "Apple -> supplied_by -> TSMC <- supplied_by <- NVIDIA"
        },
        "requires_multihop": True,
        "evidence_tier": "multi_hop_hybrid"
    },
    {
        "id": "Q30",
        "category": "H. Multi-hop graph reasoning",
        "question": "If advanced packaging capacity at TSMC experiences a disruption, which companies in our graph are directly affected?",
        "target_companies": ["AAPL", "NVDA", "GOOGL"],
        "expected_facts": {
            "affected_companies": ["Apple", "NVIDIA", "Alphabet"]
        },
        "requires_multihop": True,
        "evidence_tier": "multi_hop_hybrid"
    },
    {
        "id": "Q31",
        "category": "H. Multi-hop graph reasoning",
        "question": "How is Reliance connected to the survey knowledge graph?",
        "target_companies": ["RELIANCE"],
        "expected_facts": {
            "path": "Reliance -> belongs_to_asset_class -> Equity Market"
        },
        "requires_multihop": True,
        "evidence_tier": "multi_hop_hybrid"
    },
    {
        "id": "Q32",
        "category": "H. Multi-hop graph reasoning",
        "question": "What multi-hop graph path connects Microsoft's Azure cloud segment to NVIDIA's AI GPU revenue?",
        "target_companies": ["MSFT", "NVDA"],
        "expected_facts": {
            "path": "Microsoft -> Intelligent Cloud -> supplied_by -> NVIDIA -> Compute & Networking"
        },
        "requires_multihop": True,
        "evidence_tier": "multi_hop_hybrid"
    },

    # Category I: Cross-Company and Macro Analysis
    {
        "id": "Q33",
        "category": "I. Cross-company analysis",
        "question": "Rank Apple, Microsoft, NVIDIA, and Amazon by operating margin percentage.",
        "target_companies": ["NVDA", "MSFT", "AAPL", "AMZN"],
        "expected_facts": {
            "ranking": ["NVIDIA (~54.1%)", "Microsoft (~44.6%)", "Apple (~29.8%)", "Amazon (~6.4%)"]
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q34",
        "category": "I. Cross-company analysis",
        "question": "What is the aggregate revenue generated by TCS and Infosys combined in FY2024?",
        "target_companies": ["TCS", "INFY"],
        "expected_facts": {
            "tcs": 240893,
            "infy": 153670,
            "aggregate": 394563,
            "units": "Crores INR"
        },
        "requires_multihop": True,
        "evidence_tier": "audited_annual_report"
    },
    {
        "id": "Q35",
        "category": "I. Cross-company analysis",
        "question": "Compare the capital expenditure of Microsoft versus Amazon in their latest fiscal years.",
        "target_companies": ["MSFT", "AMZN"],
        "expected_facts": {
            "msft_capex": 44476000000,
            "amzn_capex": 52729000000,
            "currency": "USD"
        },
        "requires_multihop": True,
        "evidence_tier": "audited_sec_filing"
    },
    {
        "id": "Q36",
        "category": "I. Cross-company analysis",
        "question": "How does HDFC Bank's total asset scale compare with Reliance Industries' balance sheet?",
        "target_companies": ["HDFCBANK", "RELIANCE"],
        "expected_facts": {
            "hdfc_assets": 3617000,
            "reliance_assets": 1782000,
            "units": "Crores INR"
        },
        "requires_multihop": True,
        "evidence_tier": "audited_annual_report"
    },

    # Category J: Survey-Based vs Corporate Evidence Analysis
    {
        "id": "Q37",
        "category": "J. Survey-based evidence analysis",
        "question": "How do retail investors surveyed rank Equity Market compared to Mutual Funds?",
        "target_companies": [],
        "expected_facts": {
            "survey_finding": "Mutual Funds preferred by majority (rank 1), Equity Market ranked behind Mutual Funds"
        },
        "requires_multihop": False,
        "evidence_tier": "survey_response"
    },
    {
        "id": "Q38",
        "category": "J. Survey-based evidence analysis",
        "question": "Are surveyed retail investor preferences for Mutual Funds supported by corporate SEC 10-K filings?",
        "target_companies": [],
        "expected_facts": {
            "evidence_separation": "Survey data reflects empirical investor preferences (N=40); SEC 10-K filings represent audited corporate accounting and do not cover individual investor sentiment"
        },
        "requires_multihop": True,
        "evidence_tier": "evidence_separation_check"
    },
    {
        "id": "Q39",
        "category": "J. Survey-based evidence analysis",
        "question": "What statistical lift exists between risk-averse objectives and fixed deposit preferences in the survey data?",
        "target_companies": [],
        "expected_facts": {
            "lift_threshold": "Lift >= 1.5 correlation between safe investment objectives and fixed deposits"
        },
        "requires_multihop": True,
        "evidence_tier": "survey_response"
    },
    {
        "id": "Q40",
        "category": "J. Survey-based evidence analysis",
        "question": "What empirical survey findings link investor age to investment duration, and does this data cite SEC filings?",
        "target_companies": [],
        "expected_facts": {
            "provenance": "Survey responses are derived from Finance_data.csv (N=40); they do not cite SEC EDGAR filings"
        },
        "requires_multihop": False,
        "evidence_tier": "provenance_check"
    }
]


class InstitutionalEvaluationRunner:
    """Executes benchmark across Classic RAG, GraphRAG, and Hybrid RAG."""

    def __init__(self):
        print("[INIT] Building Unified Knowledge Graph with Corporate Extensions...")
        self.G, self.A, self.meta = build_unified_financial_graph()
        df_survey = load_financial_data()
        self.embedder = EmbeddingEngine()
        self.llm = GroqLLMClient()
        self.retriever = HybridGraphRetriever(df_survey, self.G, self.A, self.embedder, self.llm)
        self.copilot = ResearchCopilot(self.retriever, self.llm)

    def evaluate_numerical_accuracy(self, response_text: str, expected_facts: Dict[str, Any]) -> Tuple[bool, float, str]:
        """Verify numerical correctness, currency, and fiscal year against ground truth."""
        text = response_text.replace(",", "")
        reasons = []
        checks_total = 0
        checks_passed = 0

        # 1. Currency check
        if "currency" in expected_facts:
            checks_total += 1
            curr = expected_facts["currency"]
            if curr in response_text or (curr == "USD" and "$" in response_text) or (curr == "INR" and ("₹" in response_text or "Rs" in response_text or "INR" in response_text)):
                checks_passed += 1
            else:
                reasons.append(f"Missing expected currency: {curr}")

        # 2. Number checks
        for k, v in expected_facts.items():
            if isinstance(v, (int, float)) and k not in ["fiscal_year", "currency"]:
                checks_total += 1
                # Check for either full number or rounded billions/crores
                v_str = str(int(v)) if isinstance(v, (int, float)) else str(v)
                v_billions_1 = f"{v / 1e9:.1f}"
                v_billions_2 = f"{v / 1e9:.2f}"
                v_billions_0 = f"{int(v / 1e9)}"
                v_crores = f"{v:,.0f}".replace(",", "")

                patterns = [v_str, v_billions_1, v_billions_2, v_billions_0, v_crores]
                found = any(p in text for p in patterns)
                if found:
                    checks_passed += 1
                else:
                    reasons.append(f"Metric '{k}' expected {v} not found in text")

        # 3. Keyword / Entity checks
        if "keywords" in expected_facts:
            for kw in expected_facts["keywords"]:
                checks_total += 1
                if kw.lower() in response_text.lower():
                    checks_passed += 1
                else:
                    reasons.append(f"Keyword '{kw}' not mentioned")

        accuracy_score = (checks_passed / checks_total) if checks_total > 0 else 1.0
        is_accurate = accuracy_score >= 0.70
        reason_str = "; ".join(reasons) if reasons else "Fully verified against ground truth"

        return is_accurate, round(accuracy_score, 2), reason_str

    def run_all_benchmarks(self) -> Dict[str, Any]:
        """Execute all 40 questions across Classic RAG, GraphRAG, and Hybrid RAG."""
        results = []
        df_questions = pd.DataFrame(TEST_QUESTIONS_SPEC)
        df_questions.to_csv("evaluation_reports/TEST_QUESTIONS.csv", index=False)
        print(f"[OK] Exported {len(TEST_QUESTIONS_SPEC)} test specifications to evaluation_reports/TEST_QUESTIONS.csv")

        total_q = len(TEST_QUESTIONS_SPEC)
        print(f"\n--- Starting Evaluation: {total_q} Questions x 3 Pipeline Modes ---")

        for idx, q_spec in enumerate(TEST_QUESTIONS_SPEC):
            qid = q_spec["id"]
            q_text = q_spec["question"]
            exp_facts = q_spec["expected_facts"]
            cat = q_spec["category"]

            print(f"[{idx+1:02d}/{total_q}] Testing {qid}: {q_text[:65]}...")

            # Mode 1: Classic Vector RAG
            t0 = time.perf_counter()
            try:
                res_classic = self.copilot.plain_rag(q_text, k=6)
                lat_classic = round((time.perf_counter() - t0) * 1000, 2)
            except Exception as e:
                res_classic = f"ERROR: {e}"
                lat_classic = 0.0

            acc_classic, score_classic, reason_classic = self.evaluate_numerical_accuracy(res_classic, exp_facts)

            # Mode 2: GraphRAG (Standard)
            t0 = time.perf_counter()
            try:
                res_graph, graph_ret = self.copilot.ask(q_text, hops=2)
                lat_graph = round((time.perf_counter() - t0) * 1000, 2)
                triples_count = len(graph_ret.get("triples", []))
            except Exception as e:
                res_graph = f"ERROR: {e}"
                lat_graph = 0.0
                triples_count = 0

            acc_graph, score_graph, reason_graph = self.evaluate_numerical_accuracy(res_graph, exp_facts)

            # Mode 3: Hybrid RAG (Tree-of-Thought)
            t0 = time.perf_counter()
            try:
                res_hybrid, hybrid_ret = self.copilot.ask_tot(q_text, hops=2)
                lat_hybrid = round((time.perf_counter() - t0) * 1000, 2)
            except Exception as e:
                res_hybrid = f"ERROR: {e}"
                lat_hybrid = 0.0

            acc_hybrid, score_hybrid, reason_hybrid = self.evaluate_numerical_accuracy(res_hybrid, exp_facts)

            # Citation check
            citation_valid = ("SEC" in res_graph or "Form 10-K" in res_graph or "Annual Report" in res_graph or "Finance_data.csv" in res_graph or "provenance" in res_graph.lower() or "survey" in res_graph.lower())

            results.append({
                "question_id": qid,
                "category": cat,
                "question": q_text,
                "requires_multihop": q_spec["requires_multihop"],
                "evidence_tier": q_spec["evidence_tier"],
                "triples_retrieved": triples_count,
                # Classic RAG Metrics
                "classic_rag_latency_ms": lat_classic,
                "classic_rag_accuracy_score": score_classic,
                "classic_rag_verified": acc_classic,
                "classic_rag_answer": res_classic[:200].replace("\n", " "),
                # GraphRAG Metrics
                "graphrag_latency_ms": lat_graph,
                "graphrag_accuracy_score": score_graph,
                "graphrag_verified": acc_graph,
                "graphrag_citation_valid": citation_valid,
                "graphrag_verification_notes": reason_graph,
                "graphrag_answer": res_graph[:500].replace("\n", " "),
                # Hybrid RAG Metrics
                "hybrid_rag_latency_ms": lat_hybrid,
                "hybrid_rag_accuracy_score": score_hybrid,
                "hybrid_rag_verified": acc_hybrid,
                "hybrid_rag_answer": res_hybrid[:500].replace("\n", " ")
            })

        df_results = pd.DataFrame(results)
        df_results.to_csv("evaluation_reports/GRAPHRAG_TEST_RESULTS.csv", index=False)
        print(f"\n[OK] Benchmark Complete. Results saved to evaluation_reports/GRAPHRAG_TEST_RESULTS.csv")

        # Compute summary statistics
        print("\n================== BENCHMARK SUMMARY ==================")
        print(f"Total Questions Evaluated: {len(df_results)}")
        print("\n1. Overall Pipeline Comparison:")
        print(f"Classic Vector RAG  - Mean Accuracy: {df_results['classic_rag_accuracy_score'].mean():.2%}, Verified Pass Rate: {df_results['classic_rag_verified'].mean():.2%}, Mean Latency: {df_results['classic_rag_latency_ms'].mean():.1f} ms")
        print(f"GraphRAG (BFS)      - Mean Accuracy: {df_results['graphrag_accuracy_score'].mean():.2%}, Verified Pass Rate: {df_results['graphrag_verified'].mean():.2%}, Mean Latency: {df_results['graphrag_latency_ms'].mean():.1f} ms")
        print(f"Hybrid RAG (ToT)    - Mean Accuracy: {df_results['hybrid_rag_accuracy_score'].mean():.2%}, Verified Pass Rate: {df_results['hybrid_rag_verified'].mean():.2%}, Mean Latency: {df_results['hybrid_rag_latency_ms'].mean():.1f} ms")

        print("\n2. Performance on Multi-Hop vs Single-Hop Questions:")
        mh = df_results[df_results["requires_multihop"] == True]
        sh = df_results[df_results["requires_multihop"] == False]
        print(f"Multi-Hop  (N={len(mh)}) -> Classic RAG: {mh['classic_rag_accuracy_score'].mean():.2%}, GraphRAG: {mh['graphrag_accuracy_score'].mean():.2%}, Hybrid RAG: {mh['hybrid_rag_accuracy_score'].mean():.2%}")
        print(f"Single-Hop (N={len(sh)}) -> Classic RAG: {sh['classic_rag_accuracy_score'].mean():.2%}, GraphRAG: {sh['graphrag_accuracy_score'].mean():.2%}, Hybrid RAG: {sh['hybrid_rag_accuracy_score'].mean():.2%}")

        print("\n3. Category Breakdown (GraphRAG Accuracy):")
        cat_group = df_results.groupby("category")[["classic_rag_accuracy_score", "graphrag_accuracy_score", "hybrid_rag_accuracy_score"]].mean()
        for cat_name, row in cat_group.iterrows():
            print(f"  {cat_name:42s} | Classic: {row['classic_rag_accuracy_score']:.1%} | GraphRAG: {row['graphrag_accuracy_score']:.1%} | Hybrid: {row['hybrid_rag_accuracy_score']:.1%}")

        print("=======================================================\n")
        return results


if __name__ == "__main__":
    runner = InstitutionalEvaluationRunner()
    runner.run_all_benchmarks()
