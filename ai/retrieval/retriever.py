import re
import json
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
import networkx as nx

from ai.retrieval.embeddings import EmbeddingEngine
from ai.reasoning.groq_client import GroqLLMClient, MAX_CONTEXT_CHARS

class LinkedEntity:
    def __init__(self, node_id: str, label: str, category: str, score: float, match_type: str):
        self.node_id = node_id
        self.label = label
        self.category = category
        self.score = round(float(score), 4)
        self.match_type = match_type

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "label": self.label,
            "category": self.category,
            "confidence_score": self.score,
            "match_type": self.match_type
        }

class HybridGraphRetriever:
    """
    Enhanced production GraphRAG retriever combining:
    - Calibrated semantic + lexical entity linking with confidence scoring
    - Multi-hop BFS traversal with hop decay and association ranking
    - Exact Pandas-based statistical cross-tabulation with sample size boundaries
    - Vector search on individual record representations
    """

    def __init__(
        self,
        df: pd.DataFrame,
        G: nx.DiGraph,
        A: nx.Graph,
        embedder: EmbeddingEngine,
        llm_client: GroqLLMClient,
        default_ent_thr: float = 0.40,
        default_col_thr: float = 0.45
    ):
        self.df = df
        self.G = G
        self.A = A
        self.embedder = embedder
        self.llm_client = llm_client
        self.default_ent_thr = default_ent_thr
        self.default_col_thr = default_col_thr

        self.rec_ids = [n for n, d in G.nodes(data=True) if d.get("ntype") == "Record"]
        self.ent_ids = [n for n, d in G.nodes(data=True) if d.get("ntype") != "Record"]
        self.rec_index = {n: i for i, n in enumerate(self.rec_ids)}
        self.all_cols = list(df.columns)

        # Precompute dense representations
        self.rec_vecs = self.embedder.embed([G.nodes[n].get("text", str(n)) for n in self.rec_ids])
        self.ent_vecs = self.embedder.embed([G.nodes[n].get("label", str(n)) for n in self.ent_ids])
        self.col_vecs = self.embedder.embed(self.all_cols)

        self.overview = (
            f"Dataset Universe: {len(df)} survey observation records across "
            f"{len(self.all_cols)} attributes. (Source: Finance_data.csv)"
        )

    def extract_keywords(self, question: str) -> List[str]:
        """Extract key entities and concepts from the question."""
        cols = "; ".join(self.all_cols)
        prompt = (
            "Extract the key financial entities and concepts from the question for a knowledge-graph lookup.\n"
            f"Dataset columns: {cols}\n"
            "Return ONLY a JSON list of at most 6 short strings.\n"
            f"Question: {question}"
        )
        try:
            out = self.llm_client.generate(prompt, temperature=0.0, max_tokens=150)
            m = re.search(r"\[.*?\]", out, re.S)
            if m:
                kws = [str(k).strip() for k in json.loads(m.group(0)) if str(k).strip()]
                if kws:
                    return kws[:6]
        except Exception:
            pass
        # Lexical regex fallback
        return [w for w in re.findall(r"[A-Za-z_]{4,}", question)][:6]

    def link(
        self,
        question: str,
        keywords: List[str],
        ent_thr: Optional[float] = None,
        col_thr: Optional[float] = None,
        max_seeds: int = 6
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Entity linking with confidence calibration, handling ambiguity and distinguishing
        exact lexical vs semantic embedding matches.
        """
        e_thr = ent_thr if ent_thr is not None else self.default_ent_thr
        c_thr = col_thr if col_thr is not None else self.default_col_thr

        queries = [question] + keywords
        qv = self.embedder.embed(queries)
        sims = qv @ self.ent_vecs.T

        candidates: Dict[str, Dict[str, Any]] = {}

        # 1. Semantic Embedding Matching
        for row in sims:
            for j in np.argsort(-row)[:4]:
                sim_val = float(row[j])
                if sim_val >= e_thr:
                    eid = self.ent_ids[j]
                    current_best = candidates.get(eid, {}).get("score", 0.0)
                    if sim_val > current_best:
                        node_data = self.G.nodes[eid]
                        candidates[eid] = {
                            "node_id": eid,
                            "label": node_data.get("label", eid),
                            "category": node_data.get("col", "General"),
                            "score": sim_val,
                            "match_type": "semantic"
                        }

        # 2. Lexical & Exact Overlap Matching (boosted precision)
        STOPWORDS = {
            "what", "which", "when", "where", "how", "many", "does", "have", "with",
            "from", "that", "this", "then", "than", "they", "them", "their", "there",
            "about", "kind", "type", "also", "more", "most", "some", "tell", "show", "give"
        }
        for kw in keywords:
            k = kw.lower().strip()
            if len(k) < 3 or k in STOPWORDS:
                continue
            for n in self.ent_ids:
                node_data = self.G.nodes[n]
                val_str = str(node_data.get("value", "")).lower()
                lbl_str = str(node_data.get("label", "")).lower()
                name_str = str(node_data.get("name", "")).lower()
                ticker_str = str(node_data.get("ticker", "")).lower().replace(".ns", "")

                if k == val_str or (ticker_str and k == ticker_str) or (name_str and (k == name_str or (len(k) >= 4 and k in name_str))):
                    candidates[n] = {
                        "node_id": n,
                        "label": node_data.get("label", n),
                        "category": node_data.get("col", node_data.get("ntype", "General")),
                        "score": 1.0,
                        "match_type": "exact_lexical"
                    }
                elif (k in val_str or (len(k) >= 4 and f": {k}" in lbl_str)) and len(k) >= 4:
                    score = max(candidates.get(n, {}).get("score", 0.0), 0.90)
                    candidates[n] = {
                        "node_id": n,
                        "label": node_data.get("label", n),
                        "category": node_data.get("col", node_data.get("ntype", "General")),
                        "score": score,
                        "match_type": "substring_lexical"
                    }

        # Rank and select top seeds
        sorted_candidates = sorted(candidates.values(), key=lambda x: -x["score"])[:max_seeds]

        # 3. Column feature matching
        csims = qv @ self.col_vecs.T
        col_scores: Dict[str, float] = {}
        for row in csims:
            for j in np.argsort(-row)[:3]:
                if row[j] >= c_thr:
                    col_name = self.all_cols[j]
                    col_scores[col_name] = max(col_scores.get(col_name, 0.0), float(row[j]))

        for kw in keywords:
            for c in self.all_cols:
                if len(kw) >= 3 and kw.lower() in c.lower():
                    col_scores[c] = 1.0

        top_cols = [c for c, _ in sorted(col_scores.items(), key=lambda x: -x[1])[:3]]

        return sorted_candidates, top_cols

    def expand(
        self,
        seeds: List[Dict[str, Any]],
        hops: int = 2,
        per_hop: int = 8,
        hop_decay: float = 0.70
    ) -> List[Dict[str, Any]]:
        """
        Ranked BFS expansion on association layer A.
        Prioritizes high-lift direct connections, decaying candidate scores across hops.
        """
        triples, seen = [], set()
        seed_ids = [s["node_id"] for s in seeds]
        frontier = set(seed_ids)
        visited = set(seed_ids)

        for h in range(1, hops + 1):
            cands = []
            for n in frontier:
                # 1. Association layer neighbors (statistical lift)
                if n in self.A:
                    for nb in self.A.neighbors(n):
                        d = self.A[n][nb]
                        raw_lift = float(d.get("lift", 1.0))
                        count = int(d.get("count", 1))
                        score = raw_lift * np.log1p(count) * (hop_decay ** (h - 1))
                        cands.append((score, n, "associated_with", nb, d))

                # 2. Directed Knowledge Graph edges in G (corporate metrics, segments, suppliers, risks)
                if n in self.G:
                    # Outgoing edges
                    for nb in (self.G.successors(n) if self.G.is_directed() else self.G.neighbors(n)):
                        if self.G.nodes[nb].get("ntype") == "Record":
                            continue
                        d = self.G[n][nb]
                        pred = d.get("predicate", "related_to")
                        score = 2.5 * (hop_decay ** (h - 1))
                        cands.append((score, n, pred, nb, d))

                    # Incoming edges
                    if self.G.is_directed():
                        for pred_n in self.G.predecessors(n):
                            if self.G.nodes[pred_n].get("ntype") == "Record":
                                continue
                            d = self.G[pred_n][n]
                            pred = f"is_{d.get('predicate', 'related_to')}_of"
                            score = 2.0 * (hop_decay ** (h - 1))
                            cands.append((score, pred_n, pred, n, d))

            cands.sort(key=lambda x: -x[0])
            nxt = set()

            added_this_hop = 0
            for score, n, pred, nb, d in cands:
                key = (n, pred, nb)
                if key in seen:
                    continue
                seen.add(key)
                triples.append({
                    "s": self.G.nodes[n].get("label", n),
                    "p": pred,
                    "o": self.G.nodes[nb].get("label", nb),
                    "hop": h,
                    "count": int(d.get("count", 1)),
                    "lift": round(float(d.get("lift", 1.0)), 2) if "lift" in d else None,
                    "relevance_score": round(float(score), 3)
                })
                if nb not in visited:
                    nxt.add(nb)
                added_this_hop += 1
                if added_this_hop >= per_hop:
                    break

            visited |= nxt
            frontier = nxt

        return triples

    def profile(self, seeds: List[Dict[str, Any]], cols: List[str], top: int = 5) -> str:
        """Compute exact aggregate statistics with sample size and correlation caveats."""
        lines, N = [], len(self.df)
        lines.append(f"TOTAL SURVEY POPULATION (N): {N} respondent records.")
        lines.append("")

        for c in cols:
            vc = self.df[c].value_counts(dropna=True).head(top)
            dist_str = ", ".join(f"{k}: {v} ({100*v/N:.1f}%)" for k, v in vc.items())
            lines.append(f"Aggregate distribution for '{c}' [N={N}]: {dist_str}")

        for s in seeds:
            s_id = s["node_id"]
            d = self.G.nodes[s_id]
            idx = [self.G.nodes[u]["row"] for u, _ in self.G.in_edges(s_id) if self.G.nodes[u].get("ntype") == "Record"]
            sub = self.df.loc[idx]
            n_sub = len(sub)
            lines.append(f"\nSubset Profile for '{d['label']}' [Sub-sample n={n_sub}/{N}, {100*n_sub/N:.1f}%]:")
            for c in [col for col in cols if col != d.get("col")][:2]:
                vc = sub[c].value_counts().head(top)
                dist_str = ", ".join(f"{k}: {v}" for k, v in vc.items())
                lines.append(f"   - Within this group, '{c}': {dist_str}")

        lines.append("\n[STATISTICAL NOTE: Empirical distributions reflect sample responses. Statistical association (lift) denotes co-occurrence frequency, not financial or behavioral causality.]")
        return "\n".join(lines)

    def retrieve(
        self,
        question: str,
        hops: int = 2,
        k_vec: int = 4,
        k_graph: int = 4,
        ent_thr: Optional[float] = None,
        col_thr: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Execute full hybrid GraphRAG retrieval with confidence scoring and evidence tracking.
        """
        kws = self.extract_keywords(question)
        linked_seeds, cols = self.link(question, kws, ent_thr=ent_thr, col_thr=col_thr)
        triples = self.expand(linked_seeds, hops=hops)

        qv = self.embedder.embed([question])[0]
        sims = self.rec_vecs @ qv
        vec_hits = list(np.argsort(-sims)[:k_vec])

        adj_indices = set()
        for s in linked_seeds:
            s_id = s["node_id"]
            for u, _ in self.G.in_edges(s_id):
                if self.G.nodes[u].get("ntype") == "Record":
                    adj_indices.add(self.rec_index[u])

        graph_hits = sorted(adj_indices, key=lambda i: -sims[i])[:k_graph]
        rec_idx = list(dict.fromkeys(graph_hits + vec_hits))

        retrieved_records = []
        for i in rec_idx:
            retrieved_records.append({
                "record_id": self.rec_ids[i],
                "text": self.G.nodes[self.rec_ids[i]]["text"],
                "similarity": round(float(sims[i]), 4)
            })

        evidence_confidence = "high"
        if len(linked_seeds) == 0:
            evidence_confidence = "insufficient"
        elif len(triples) == 0:
            evidence_confidence = "moderate"

        return {
            "keywords": kws,
            "seeds": [s["node_id"] for s in linked_seeds],
            "seed_labels": [s["label"] for s in linked_seeds],
            "linked_entities": linked_seeds,
            "columns": cols,
            "triples": triples,
            "records": [r["text"] for r in retrieved_records],
            "records_detail": retrieved_records,
            "profile": self.profile(linked_seeds, cols),
            "evidence_confidence": evidence_confidence
        }

    def format_context(self, r: Dict[str, Any]) -> str:
        """Format retrieval payload into prompt context."""
        tri = "\n".join(
            f"- ('{t['s']}', '{t['p']}', '{t['o']}') [hop {t['hop']}, n={t['count']}, lift={t['lift']}x, score={t.get('relevance_score', 0)}]"
            for t in r["triples"]
        ) or "(no association triples found)"

        rec = "\n".join(f"- {x}" for x in r["records"]) or "(no direct records matched)"

        ctx = (
            f"EXTRACTED INQUIRY KEYWORDS: {r['keywords']}\n\n"
            f"LINKED SEED ENTITIES: {[s['label'] for s in r.get('linked_entities', [])]}\n\n"
            f"EXACT EMPIRICAL STATISTICS (N=40 respondents):\n{r['profile']}\n\n"
            f"KNOWLEDGE GRAPH RELATIONSHIPS (Directed association layer):\n{tri}\n\n"
            f"CITED SURVEY RECORDS:\n{rec}"
        )
        return ctx[:MAX_CONTEXT_CHARS]

    def build_prompt(self, question: str, r: Dict[str, Any], extra: str = "") -> str:
        """Construct grounded prompt."""
        confidence = r.get("evidence_confidence", "high")
        insufficient_instruction = ""
        if confidence == "insufficient":
            insufficient_instruction = "\nWARNING: Evidence is insufficient to answer this inquiry. State clearly that the survey does not cover this topic.\n"

        return (
            "You are an institutional financial analyst. Answer the question using ONLY the provided evidence below.\n"
            "- EXACT STATISTICS: Use the provided percentages and sample sizes. Never fabricate counts.\n"
            "- KNOWLEDGE GRAPH RELATIONSHIPS: Reflect empirical co-occurrence lift (lift > 1 denotes positive association).\n"
            "- If evidence is missing or ambiguous, state that the dataset does not contain sufficient information.\n"
            f"{insufficient_instruction}\n"
            f"{self.overview}\n\n"
            f"{self.format_context(r)}\n"
            f"{extra}\n"
            f"Question: {question}\n"
            "Answer:"
        )
