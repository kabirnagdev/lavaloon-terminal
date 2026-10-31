from typing import Dict, Any, List
import pandas as pd
import networkx as nx
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.groq_client import GroqLLMClient

class DueDiligencePipeline:
    """Generates an 8-section institutional Due Diligence report for an entity or company."""

    def __init__(self, retriever: HybridGraphRetriever, llm_client: GroqLLMClient):
        self.retriever = retriever
        self.llm_client = llm_client

    def generate_report(self, target_entity: str, scope: List[str] = None) -> Dict[str, Any]:
        """Produce structured due-diligence dossier with full source provenance."""
        # Retrieve context specific to the target
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

        # Structured Prompt for Executive Due Diligence
        report_prompt = f"""Generate an institutional-grade Due Diligence Dossier for '{target_entity}'.
Follow this exact 8-part executive structure:
1. Executive Summary & Classification
2. Financial & Empirical Penetration
3. Business & Graph Relationships
4. Competitive & Market Landscape
5. Risk & Red-Flag Assessment
6. Behavioral & Preference Intelligence
7. Evidentiary Traceability
8. Research Verdict & Recommendations

Data Context:
{self.retriever.format_context(retrieval_res)}

Ensure all claims are explicitly grounded in the context provided.
Do not fabricate numbers or treat correlation as established fact.
"""
        generated_synthesis = self.llm_client.generate(report_prompt, temperature=0.1, max_tokens=1800)

        return {
            "target": target_entity,
            "executive_summary": generated_synthesis,
            "graph_associations": associations[:15],
            "triples": retrieval_res["triples"],
            "statistical_profile": retrieval_res["profile"],
            "records": retrieval_res["records"][:6],
            "verified_facts": [
                f"Empirically observed in {len(retrieval_res['records'])} survey respondent records.",
                f"Statistically significant associations identified across {len(associations)} related entities (min lift 1.5).",
                f"Dataset scope: {len(self.retriever.df)} records across {len(self.retriever.all_cols)} financial dimensions."
            ],
            "disclaimers": [
                "Survey intelligence denotes respondent investment preferences, not audited corporate financial filings.",
                "Statistical lift represents sample correlation, not deterministic financial causality.",
                "Generated models are for research guidance and do not constitute formal investment advice."
            ]
        }

