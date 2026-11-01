# Engineering Baseline Audit

**Date:** October 30, 2026  
**Auditor:** Senior AI Architect & Graph Engineer  
**Status:** Completed Baseline Pre-Implementation  

---

## 1. Executive Summary & Existing Architecture

The platform operates as a monorepo consisting of:
1. **AI Core (`ai/`)**: Python-based pipeline for data ingestion, NetworkX graph construction, Sentence-Transformer vector embedding (`all-MiniLM-L6-v2`), hybrid retrieval, and Groq-powered reasoning with heuristic fallback.
2. **Backend API (`backend/`)**: FastAPI application providing REST endpoints for system health, company profiles, Cytoscape knowledge graph serialization, pathfinding, GraphRAG research queries, due diligence reports, and Black-Scholes quantitative calculations.
3. **Frontend Workstation (`frontend/`)**: Next.js 14 client application with Cytoscape.js visualization, Bloomberg-terminal inspired styling, and real-time API integrations.
4. **Data Layer (`data/`)**: Tabular survey dataset (`Finance_data.csv`, 40 rows × 24 columns).

---

## 2. Baseline Test Results & Execution Evidence

The existing test suite was executed against the backend on Python 3.13:

```text
============================= test session starts ==============================
backend/tests/test_api.py::test_health_endpoint PASSED                   [  9%]
backend/tests/test_api.py::test_list_companies PASSED                    [ 18%]
backend/tests/test_api.py::test_get_company_detail PASSED                [ 27%]
backend/tests/test_api.py::test_company_not_found PASSED                 [ 36%]
backend/tests/test_api.py::test_get_relationships PASSED                 [ 45%]
backend/tests/test_api.py::test_cytoscape_graph PASSED                   [ 54%]
backend/tests/test_api.py::test_shortest_path PASSED                     [ 63%]
backend/tests/test_api.py::test_research_query PASSED                    [ 72%]
backend/tests/test_api.py::test_due_diligence_analyze PASSED             [ 81%]
backend/tests/test_api.py::test_black_scholes_quant PASSED               [ 90%]
backend/tests/test_api.py::test_options_chain PASSED                     [100%]
======================= 11 passed in 12.79s ========================
```

---

## 3. Existing Functionality & Mechanics

| Subsystem | Existing Implementation | File Reference | Current Behavior |
|---|---|---|---|
| **Graph Construction** | In-memory NetworkX DiGraph + Graph A | `ai/graph/builder.py` | Pairwise co-occurrence + lift threshold ($\text{Lift} \ge 1.5, n \ge 3$). 147 nodes, 1,144 edges, 184 association edges. |
| **Pathfinding** | `nx.shortest_path(A, ...)` | `backend/app/services/graph_service.py#L163` | Unweighted minimum hop count. Edge lift is returned post-hoc but does not influence path selection. |
| **Entity Linking** | Cosine dot product + substring match | `ai/retrieval/retriever.py#L60-L85` | Pinned thresholds (`ent_thr=0.40`, `col_thr=0.45`). No confidence breakdown. |
| **Graph Traversal** | BFS 2-hop neighbor expansion | `ai/retrieval/retriever.py#L98-L125` | Expands up to `hops=2`, capped at 8 triples per hop, ranked by `lift * log1p(count)`. |
| **Statistical Profiling** | Pandas `value_counts()` on dataframe | `ai/retrieval/retriever.py#L127-L140` | Exact column frequency distribution & subset profiles. |
| **Reasoning & Fallback** | Groq API + Offline Evidence Fallback | `ai/reasoning/groq_client.py#L45-L105` | Calls Groq models (`llama-3.3-70b-versatile`, etc.) with token budget; falls back cleanly to structured evidence synthesis if no API key is present. |
| **Quantitative Desk** | Analytical Black-Scholes & Greeks | `ai/quant/black_scholes.py` | Exact closed-form formulas for Price, Delta, Gamma, Vega, Theta, Rho, and options chain. |
| **Graph Persistence** | Rebuilt in RAM on server start | `backend/app/api/dependencies/database.py` | Transient RAM graph. Neo4j adapter exists in `ai/adapters/neo4j_adapter.py` but is not active in the default query flow. |

---

## 4. Known Architectural Limitations & Bottlenecks

1. **Unweighted Pathfinding**:
   - `nx.shortest_path` minimizes edge count rather than maximizing statistical association. A 1-hop path with weak lift (1.51) will be preferred over a 2-hop path with very strong lift (4.5 each).
2. **Entity Linking Ambiguity**:
   - Static threshold without confidence calibration can cause spurious seed matching or miss synonyms.
3. **Graph Persistence & Scalability**:
   - In-memory graph is rebuilt on every server startup.
   - For $N=40$ rows, graph construction takes ~35ms. For $N=100\text{K}$, $O(N \cdot K^2)$ pairwise loop in pure Python `Counter` will exhaust RAM and take minutes.
4. **Vector Retrieval Scalability**:
   - Full dense matrix multiplication (`rec_vecs @ qv`) is $O(N \cdot D)$. At 100K+ records, an ANN index (FAISS or HNSW) is required.
5. **Evaluation Metric Absence**:
   - No benchmark dataset or automated evaluation harness measuring Precision@K, Recall@K, Context Relevance, or Faithfulness.

---

## 5. Files Requiring Modification Across Phases

| Phase | Files to Create / Modify | Scope |
|---|---|---|
| **Phase 1** | `ai/graph/pathfinder.py` (New), `backend/app/schemas/graph.py`, `backend/app/services/graph_service.py`, `backend/tests/test_pathfinder.py` (New) | Weighted shortest path using $d = 1/\text{lift}$, algorithm selector, validation, backward compatibility. |
| **Phase 2** | `ai/retrieval/retriever.py`, `ai/reasoning/prompt_builder.py`, `backend/app/schemas/research.py`, `backend/tests/test_retrieval_quality.py` (New) | Configurable entity linking thresholds, confidence scoring, path-ranked context expansion, statistical provenance. |
| **Phase 3** | `ai/evaluation/dataset.py` (New), `ai/evaluation/metrics.py` (New), `ai/evaluation/runner.py` (New), `docs/GRAPHRAG_EVALUATION.md` (New) | Precision@K, Recall@K, MRR, Context Relevance, Faithfulness benchmark suite. |
| **Phase 4** | `ai/adapters/neo4j_adapter.py`, `backend/app/api/dependencies/database.py`, `backend/app/core/config.py`, `backend/tests/test_neo4j.py` (New), `docs/NEO4J_SETUP.md` (New) | Dual-backend selector (`NETWORKX` vs `NEO4J`), schema sync, connection pooling, graceful fallback. |
| **Phase 5** | `ai/ingestion/validator.py` (New), `ai/retrieval/vector_index.py` (New), `ai/benchmarks/scalability_test.py` (New), `docs/PERFORMANCE_BENCHMARKS.md` (New) | Data validation, FAISS/HNSW evaluation, scalability benchmarking across 1K, 10K, 100K synthetic records. |
| **Phase 6 & 7**| `backend/tests/`, `docs/ARCHITECTURE.md`, `README.md` | Full regression testing, documentation update, production readiness assessment. |

