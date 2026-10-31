# Financial Intelligence & Due Diligence Terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI: 0.110+](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com/)
[![Tests: 30 Passed](https://img.shields.io/badge/Tests-30%20Passed-green.svg)](backend/tests/)

An institutional-grade financial intelligence workstation combining a **Bloomberg Terminal-inspired research interface**, **Palantir-inspired knowledge graph ontology**, **hybrid GraphRAG retrieval**, and **quantitative derivatives analytics**.

---

## Platform Architecture

```
finance-intelligence-terminal/
├── frontend/                     # Next.js 14, React, TypeScript, Tailwind, Cytoscape.js
│   ├── src/app/                  # Terminal workstation application shell
│   ├── src/components/           # Cytoscape graph, Copilot, Diligence, Options desk
│   ├── src/services/             # Typed API client
│   └── src/types/                # Pydantic-mirrored TypeScript interfaces
│
├── backend/                      # Production FastAPI service
│   ├── app/api/routes/           # Health, Companies, Graph, Research, Diligence, Quant
│   ├── app/core/                 # Config, security, logging
│   ├── app/services/             # Orchestration & business logic
│   └── tests/                    # Automated pytest suite (30 unit & integration tests)
│
├── ai/                           # Modular AI & GraphRAG engine
│   ├── ingestion/                # CSV loader, Pydantic schema validator, entity slugifiers
│   ├── graph/                    # Knowledge Graph builder, lift calculation, Dijkstra pathfinder
│   ├── retrieval/                # Hybrid retriever: FAISS HNSW + multi-hop graph BFS with hop decay
│   ├── reasoning/                # Groq client, prompt engineering, offline synthesis fallback
│   ├── quant/                    # Black-Scholes pricing, analytical Greeks, Newton-Raphson IV
│   ├── evaluation/               # Precision@K, Recall@K, MRR, Context Relevance benchmark runner
│   ├── benchmarks/               # Scalability benchmarks (1K, 10K, 100K synthetic records)
│   └── adapters/                 # In-memory NetworkX + enterprise Neo4j adapter
│
├── data/                         # Persistent CSV data (Finance_data.csv)
├── notebooks/                    # Preserved original research notebooks
├── docs/                         # ARCHITECTURE.md, API.md, ENGINEERING_BASELINE.md,
│                                 # GRAPHRAG_EVALUATION.md, PERFORMANCE_BENCHMARKS.md, NEO4J_SETUP.md
├── infrastructure/               # Dockerfiles and deployment configs
├── pytest.ini                    # Pytest configuration
└── docker-compose.yml
```

---

## Quick Start

### Option 1: Docker Compose (Recommended)

1. Clone the repository and configure `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start the services:
   ```bash
   docker-compose up --build -d
   ```
3. Open `http://localhost:3000` in your browser. API docs are at `http://localhost:8000/docs`.

---

### Option 2: Local Manual Setup

#### 1. Backend Service
```bash
# From repository root
python3 -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Access the workstation at `http://localhost:3000`.

---

## Running Automated Tests

Run the complete test suite verifying all API endpoints, Pydantic validation, GraphRAG retrieval, Dijkstra pathfinding, and Black-Scholes formulas:

```bash
# Run all 30 automated tests
pytest -v
```

### Running GraphRAG Benchmark & Scalability Tests
```bash
# Run GraphRAG evaluation (Precision, Recall, MRR, Accuracy)
python3 ai/evaluation/runner.py

# Run Scalability benchmarks across 1K, 10K, and 100K records
python3 ai/benchmarks/scalability_test.py
```

---

## Key Capabilities

1. **Palantir Ontology Graph**:
   - High-performance Cytoscape.js canvas visualizing ontology entities and statistical lift ties.
   - Dynamic filtering by column category, minimum lift slider, and real-time weighted Dijkstra pathfinder ($distance = 1 / lift$).
2. **GraphRAG Research Copilot**:
   - Hybrid semantic retrieval combining FAISS HNSW vector similarity with directed multi-hop BFS graph traversal.
   - Calibrated entity linking with confidence scores and interrogative stopword filtering.
   - Out-of-domain query detection ("insufficient evidence") to eliminate hallucinations.
3. **Institutional Due Diligence Matrix**:
   - Multi-pillar scoring (Governance, Market Position, Financial Health, ESG, Regulatory Compliance).
   - Automated Red-Flag and Bull/Bear risk synthesis.
4. **Quantitative Options Desk**:
   - Real-time Black-Scholes-Merton European option valuation and analytical Greeks ($\Delta, \Gamma, \Theta, \nu, \rho$).
   - Newton-Raphson solver for Implied Volatility and dynamic options strike chain modeling.
5. **Dual Graph Engine & Scalability**:
   - Default zero-dependency NetworkX in-memory graph with seamless fallback.
   - Enterprise Neo4j adapter for clustered graph persistence and APOC indexing.
