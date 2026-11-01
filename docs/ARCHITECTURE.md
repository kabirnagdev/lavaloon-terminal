# System Architecture — Financial Intelligence & Due Diligence Terminal

## 1. Executive Overview

The **Financial Intelligence and Due Diligence Terminal** transforms exploratory Jupyter research on Knowledge Graph RAG and quantitative finance into an institutional-grade financial intelligence workstation. Combining a Bloomberg Terminal-style high-density design with Palantir-style ontology and relationship exploration, the platform bridges tabular financial survey data, corporate intelligence profiles, multi-hop GraphRAG reasoning, and quantitative derivatives analytics.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS / REACT FRONTEND                         │
│   (Bloomberg Terminal Theme #0d1117, High Density, Cytoscape Graph)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI BACKEND                                │
│   - API Routing & Authentication     - Dependency Injection            │
│   - Service Layer (Company, Graph, Diligence, Research, Analytics)     │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
                   ▼                               ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────┐
│           AI CORE ENGINE           │ │      STORAGE & ONTOLOGY         │
│ - Ingestion: Schema Validator      │ │ - In-Memory: NetworkX DiGraph   │
│ - Vector: FAISS HNSW + NumPy Exact │ │ - Persistence: Clustered Neo4j  │
│ - Pathfinder: Dijkstra (1/Lift)    │ │ - Association Layer (Lift)      │
│ - Retrieval: Hybrid Multi-Hop BFS  │ │ - RDF/Turtle Serializer         │
│ - Reasoning: Groq LLM + Fallback   │ │ - Persistent Financial Datasets │
│ - Quant: Black-Scholes Greeks      │ └─────────────────────────────────┘
└────────────────────────────────────┘
```

---

## 2. Directory Structure

```
lavaloon-terminal/
├── frontend/                     # Next.js 14, Tailwind, Cytoscape.js, ECharts
│   ├── public/                   # Static assets, branding icons
│   └── src/
│       ├── app/                  # App router pages (dashboard, explorer, graph, research, diligence, options)
│       ├── components/           # Terminal UI, Cytoscape viewer, metrics, tables, copilot
│       ├── services/             # Axios/Fetch API client
│       ├── types/                # TypeScript interface definitions
│       └── styles/               # Terminal dark palette & monospace typography
│
├── backend/                      # Production FastAPI service
│   ├── app/
│   │   ├── api/routes/           # Endpoints: companies, graph, research, diligence, quant
│   │   ├── core/                 # Config, security, logging
│   │   ├── services/             # Orchestration & business logic (Graph, Research, Diligence, Quant)
│   │   ├── schemas/              # Pydantic validation schemas (Pathfinder, Retrieval, Company)
│   │   └── main.py               # Application entrypoint & lifespan
│   ├── tests/                    # Comprehensive pytest test suite (30 automated tests)
│   └── requirements.txt
│
├── ai/                           # Modular AI & GraphRAG engine
│   ├── ingestion/                # CSV loader, Pydantic schema validator, entity slugifiers
│   ├── graph/                    # Knowledge Graph builder, lift calculation, Dijkstra pathfinder
│   ├── retrieval/                # Hybrid retriever: FAISS HNSW / vector search + multi-hop BFS
│   ├── reasoning/                # Groq client, prompt engineering, offline synthesis fallback
│   ├── evaluation/               # Precision@K, Recall@K, MRR, Context Relevance benchmark runner
│   ├── quant/                    # Black-Scholes pricing, Greeks, Newton-Raphson IV
│   └── adapters/                 # Enterprise Neo4j Aura / Docker clustered graph adapter
│
├── data/                         # Persistent CSV data (Finance_data.csv, etc.)
├── notebooks/                    # Preserved original exploratory research notebooks
├── docs/                         # Architecture, API, Baseline, Evaluation, Benchmarks, Neo4j guides
├── infrastructure/               # Dockerfiles and docker-compose configurations
├── pytest.ini                    # Pytest configuration
└── docker-compose.yml
```

---

## 3. Core Knowledge Graph & Weighted Pathfinder Model

1. **Record Nodes**: Represent individual survey respondents or filing records (`ntype="Record"`, attributes, row index, serialized text).
2. **Entity Nodes**: Categorical attributes extracted according to distinct value thresholds (`ntype="Entity"`, column, value, label).
3. **Directed Predicates**: `Record -> Entity` edges marked by column name.
4. **Association Layer**: Statistical co-occurrence edges computed via **Lift**:
   $$\text{Lift}(A, B) = \frac{P(A \cap B)}{P(A) \cdot P(B)} = \frac{\text{co} \times N}{\text{count}(A) \times \text{count}(B)}$$
   Edges are formed when $\text{co} \ge 3$ and $\text{Lift} \ge 1.5$.
5. **Weighted Dijkstra Pathfinding**:
   To find the path of strongest statistical affinity between disparate financial entities, the terminal converts Lift into a physical resistance distance:
   $$\text{Distance} = \frac{1}{\text{Lift}}$$
   - Higher Lift implies tighter co-occurrence and smaller distance.
   - NetworkX Dijkstra algorithm minimizes the cumulative distance along the path.
   - Handles disconnected nodes, competing multi-hop routes, and unweighted BFS minimum-hop mode.

---

## 4. Graph Persistence: In-Memory NetworkX vs Neo4j

The terminal features a dual-backend architecture configured via `GRAPH_BACKEND`:
- **NetworkX (Default)**: Zero-dependency in-memory graph. Ideal for local development, testing, and datasets up to 50,000 records. Multi-hop lookups execute in sub-millisecond time.
- **Neo4j Adapter (`ai/adapters/neo4j_adapter.py`)**: Clustered graph database support with connection pooling, unique node constraints, and batched `UNWIND` synchronization.
- **Graceful Fallback**: If `GRAPH_BACKEND="NEO4J"` is requested but the database is unreachable, the system logs a warning and falls back to in-memory NetworkX with zero service disruption.

---

## 5. Vector Indexing & ANN Architecture

Semantic retrieval in `ai/retrieval/vector_index.py`:
1. **NumPy Exact Matrix Multiplication**:
   $$\text{Score} = X_{\text{normalized}} \cdot q_{\text{normalized}}^T$$
   Provides exact cosine similarity for small datasets (<10,000 vectors).
2. **FAISS Flat IP (`IndexFlatIP`)**: SIMD/BLAS accelerated exact inner-product search.
3. **FAISS HNSW (`IndexHNSWFlat`)**: Logarithmic $O(\log N)$ graph-based Approximate Nearest Neighbors retrieval.
   - At 100,000 records, delivers **0.416 ms** query latency (2,403 QPS), a **5.3x speedup** over NumPy exact search.

---

## 6. GraphRAG Hybrid Retrieval Pipeline

```
User Query
   │
   ▼
1. Query Parsing & Stopword Filtering
   │  - Strips question interrogatives ("what", "which", "how") to prevent spurious column matches
   ▼
2. Calibrated Entity Linking
   │  - Exact lexical, substring lexical, and dense semantic vector similarity
   │  - Match types tagged with confidence scores [0.0 - 1.0] and configurable thresholds
   ▼
3. Multi-Hop BFS Graph Expansion with Hop Decay
   │  - Expands outward from linked seed entities
   │  - Scores ranked with geometric decay: Weight = Lift × (0.70)^(hop - 1)
   ▼
4. Exact Statistical Grounding
   │  - Exact Pandas frequency profiling on raw records (N = 40)
   │  - Disclaims correlation vs causation
   ▼
5. Context Assembly & Insufficient Evidence Detection
   │  - Out-of-domain queries flag "insufficient evidence" before LLM invocation
   ▼
6. Grounded Answer Generation
   │  - Groq LLaMA 3.3 70B Versatile with offline analytical fallback
```

---

## 7. Quantitative Derivatives Engine

Implemented in `ai/quant/black_scholes.py`:
- Closed-form Black-Scholes-Merton European option valuation for Calls and Puts.
- Analytical first and second-order Greeks: Delta ($\Delta$), Gamma ($\Gamma$), Theta ($\Theta$), Vega ($\nu$), and Rho ($\rho$).
- Newton-Raphson numerical iterative solver for Implied Volatility ($\sigma_{\text{implied}}$).
- Synthetic dynamic options chain generation with strike ladder and open interest modeling.
