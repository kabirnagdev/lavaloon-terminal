# Lavaloon Financial Intelligence & Due Diligence Terminal
## Complete Comprehensive System Documentation & Feature Specification

---

## 1. Executive Platform Overview

The **Lavaloon Financial Intelligence & Due Diligence Terminal** is an institutional-grade financial intelligence workstation engineered to bridge exploratory quantitative research, knowledge graph ontology, multi-hop GraphRAG reasoning, and quantitative derivatives analytics into a unified, high-density terminal interface.

Combining the dense, keyboard-driven operational aesthetic of a **Bloomberg Terminal** with the multi-hop ontology visualization of **Palantir Foundry**, the platform provides institutional analysts, quantitative researchers, and due diligence auditors with verified corporate ground-truth data, statistical association discovery, automated risk synthesis, and derivatives pricing.

### Core Architecture Blueprint
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LAVALOON TERMINAL WORKSTATION                          │
│        (Next.js 14 App Router, TypeScript, Tailwind CSS, Cytoscape.js)      │
│  - Top Nav (Global Search, UTC Clock)    - Bottom Status Bar (Telemetry)    │
│  - F1-F8 Hotkey Navigation Rail          - Sub-millisecond Client State     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON / HTTP 1.1)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION FASTAPI GATEWAY                          │
│  - Endpoint Routing & Schemas            - Pydantic v2 Request Validation   │
│  - In-Memory NetworkX DiGraph Engine     - Service Orchestration Layer      │
└──────────────────┬───────────────────────────────────┬──────────────────────┘
                   │                                   │
                   ▼                                   ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────────┐
│          AI & GRAPHRAG CORE          │ │         STORAGE & ONTOLOGY         │
│  - Calibrated Entity Linker          │ │ - In-Memory NetworkX DiGraph       │
│  - FAISS HNSW + Dense NumPy Search   │ │ - Clustered Neo4j Aura Adapter     │
│  - Multi-Hop BFS with Hop Decay      │ │ - Statistical Lift Association     │
│  - Groq LLaMA 3.3 70B Reasoning      │ │ - Corporate Ground-Truth Database  │
│  - Black-Scholes & Analytical Greeks │ │ - Empirical Survey Dataset (N=40)  │
└──────────────────────────────────────┘ └────────────────────────────────────┘
```

---

## 2. Technology Stack & Directory Structure

### 2.1 Technology Matrix
| Layer | Technologies | Role / Responsibility |
| :--- | :--- | :--- |
| **Frontend Workstation** | Next.js 14.2.15, React 18, TypeScript 5.6, Tailwind CSS 3.4, Lucide Icons | High-density terminal client, reactive hotkeys, tabular layouts |
| **Graph Visualization** | Cytoscape.js 3.30, cytoscape-cola 2.5 | Interactive force-directed ontology canvas, shortest path rendering |
| **Backend API Service** | Python 3.10+, FastAPI 0.110+, Uvicorn, Pydantic v2 | High-performance asynchronous REST API, dependency injection |
| **Graph Engines** | NetworkX 3.2+ (Primary In-Memory), Neo4j 5.x (Clustered Adapter) | Dual-backend ontology storage, Dijkstra pathfinding, batched UNWIND sync |
| **Vector Engine** | Sentence-Transformers (`all-MiniLM-L6-v2`), FAISS HNSW, NumPy Exact | 384-dimensional dense semantic embedding, sub-millisecond ANN search |
| **AI Reasoning** | Groq SDK (`qwen/qwen3.8-27b`, `openai/gpt-oss-120b`), Fallback Heuristic Engine | Grounded GraphRAG synthesis, Tree-of-Thought, hallucination guards |
| **Quantitative Desk** | SciPy, NumPy, Python Math | Analytical Black-Scholes pricing, first/second-order Greeks, Newton-Raphson IV |
| **Validation & Testing**| Pytest, Hypothesis, Pydantic Validator | 30 automated integration/unit tests, automated schema enforcement |

### 2.2 Directory Map
```
lavaloon-terminal/
├── frontend/                     # Next.js 14 client application
│   ├── src/
│   │   ├── app/                  # Terminal workstation application shell (page.tsx, layout.tsx)
│   │   ├── components/
│   │   │   ├── layout/           # TopNav.tsx, Sidebar.tsx, BottomStatusBar.tsx
│   │   │   ├── dashboard/        # OverviewDashboard.tsx (F1)
│   │   │   ├── companies/        # CompanyExplorer.tsx (F2)
│   │   │   ├── financials/       # FinancialIntelligenceWorkspace.tsx (F3)
│   │   │   ├── graph/            # CytoscapeGraph.tsx (F4)
│   │   │   ├── research/         # ResearchWorkspace.tsx (F5 - Copilot)
│   │   │   ├── diligence/        # DueDiligenceView.tsx (F6)
│   │   │   ├── quant/            # OptionsDesk.tsx (F7)
│   │   │   ├── settings/         # SettingsView.tsx (F8)
│   │   │   └── ingestion/        # DataIngestionModal.tsx
│   │   ├── services/             # api.ts (Typed API client with graceful fallbacks)
│   │   ├── types/                # index.ts (Full TypeScript interface contracts)
│   │   └── styles/               # globals.css (Terminal theme variables & styles)
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                      # Production FastAPI service
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/           # health, companies, graph, research, diligence, quant
│   │   │   └── dependencies/     # database.py, service providers
│   │   ├── core/                 # config.py, logging.py, security.py
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Orchestration & business logic
│   │   └── main.py               # FastAPI lifespan & middleware entrypoint
│   └── tests/                    # 30 passing unit & integration tests
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
├── data/                         # Persistent CSV data (Finance_data.csv) & verified corporate financials
├── docs/                         # ARCHITECTURE.md, API.md, SYSTEM_DOCUMENTATION.md
├── figma_export/                 # Vector SVG screens & Figma plugin generator
└── docker-compose.yml
```

---

## 3. Global Terminal Shell & Navigation

### 3.1 Function Key Hotkey Engine (F1 – F8)
The entire terminal is keyboard-operable via dedicated hotkeys bound to `window.addEventListener("keydown")`:
* **`F1`** ➔ Overview Dashboard
* **`F2`** ➔ Entity Explorer & Fundamental Dossier
* **`F3`** ➔ Financial Intelligence & Statement Waterfalls
* **`F4`** ➔ Knowledge Graph Ontology Canvas
* **`F5`** ➔ GraphRAG Copilot & Institutional Research
* **`F6`** ➔ Due Diligence & Risk Room
* **`F7`** ➔ Quant & Derivatives Options Desk
* **`F8`** ➔ System Settings & Telemetry

### 3.2 Top Navigation Bar (`TopNav.tsx`)
* **Height**: 48px fixed header (`h-11`), border bottom `#1a2234`.
* **Brand Identity**: Lavaloon Terminal badge with sky-blue icon.
* **Active Workspace Indicator**: Displays currently focused module title (`Overview`, `Graph`, etc.).
* **Global Search Box**: Omnibar searching across tickers (`AAPL`, `MSFT`), companies (`Apple`, `Microsoft`), SEC filings, and ontology concepts (`Mutual Funds`, `Equity Market`).
* **UTC Live Clock**: Real-time ticker displaying 24-hour synchronized UTC time (`HH:MM:SS UTC`).
* **System Health Badge**: Real-time heartbeat indicator showing active engine state.

### 3.3 Left Navigation Rail (`Sidebar.tsx`)
* **Width**: 52px compact icon rail with expandable 208px view (`w-52`).
* **Module Buttons**: Dedicated icons with high-contrast active states, sky-blue indicators, and hotkey pill badges (`F1`–`F8`).

### 3.4 Bottom Status Bar (`BottomStatusBar.tsx`)
* **Height**: 24px institutional terminal footer.
* **Real-time Telemetry Indicators**:
  * `CORE:ONLINE`: Operational gateway.
  * `GRAPH: NETWORKX/RDF (444N/1448E)`: In-memory ontology status.
  * `EMBED: all-MiniLM-L6-v2`: Active vector indexer.
  * `SEC EDGAR: 134 FACTS AUDITED`: Provenance ground-truth count.
  * `LLM: GROQ (CONNECTED)`: Cloud inference status.
  * `UTC CLOCK`: Current system time.

---

## 4. Detailed Feature Breakdown of All 8 Modules

### Module 1: Overview Dashboard (F1)
* **System Coverage Strip**: Displays coverage metrics: **10 Listed Multinationals (SEC / BSE)** + **4 Survey Investment Avenues**.
* **Verified Ground-Truth Corporate Highlights**:
  * **AAPL (Apple Inc.)**: Revenue `$383.29B` (FY2025, SEC Form 10-K CIK 0000320193).
  * **MSFT (Microsoft Corp.)**: Operating Margin `44.64%` (FY2024, SEC Form 10-K CIK 0000789019).
  * **NVDA (NVIDIA Corp.)**: Compute Revenue `$96.31B` (FY2025, SEC Form 10-K CIK 0001045810).
  * **AMZN (Amazon.com)**: Operating Cash Flow `$115.88B` (FY2024, SEC Form 10-K CIK 0001018724).
  * **RELIANCE.NS (Reliance Industries)**: Gross Revenue `₹10,00,122 Cr` (FY2024, Audited Consolidated Financials).
  * **TCS.NS (Tata Consultancy Services)**: Free Cash Flow `₹41,200 Cr` (FY2024, MCA Annual Filing).
* **Four Institutional KPI Cards**: Corporate filers, verified XBRL facts, knowledge graph ties, and reasoning engine status.
* **Interactive Verified Filings Table**: Sortable list of covered entities with period, standards (US-GAAP / Ind-AS), and filing links.

### Module 2: Entity Explorer (F2)
* **3-Region Layout**:
  * *Left*: Entity directory with search & filters (All, Corporate Equities, Survey Avenues).
  * *Center*: Comprehensive company dossier (12-metric audited highlights grid, segment revenue breakdown, Item 1A risk disclosures).
  * *Right*: Contextual intelligence (peer competitors, supply chain partners, graph relationship ties).

### Module 3: Financial Intelligence Workspace (F3)
* **Comparative Financial Statement Matrix**: Side-by-side multi-statement table (Revenue, Net Income, Operating Margins, Operating Cash Flow, Total Debt, Free Cash Flow).
* **Segment Diversification**: Proportional bar visualizers.
* **Strict Currency Isolation**: Explicit separation between USD Billions and INR Crores.

### Module 4: Knowledge Graph Ontology (F4)
* **Cytoscape.js Interactive Canvas**: Force-directed CoSE physical layout simulation with smooth pan/zoom and collision prevention.
* **Weighted Dijkstra Pathfinding Engine**: Calculates the route of maximum statistical affinity ($1/\text{Lift}$).
* **Entity & Tie Inspector**: Detailed attributes, degree centrality, supporting records count, and predicate breakdown.

### Module 5: GraphRAG Copilot & Research Workspace (F5)
* **Three Dynamic Reasoning Modes**: `graph_rag`, `tree_of_thought`, and `plain_rag`.
* **Calibrated Entity Linking**: Multi-strategy lexical substring matching + dense cosine similarity.
* **Multi-Hop BFS Graph Expansion with Hop Decay**: Ranks ties with geometric decay $\text{Lift} \times (0.70)^{\text{hop}-1}$.
* **Evidentiary Tabs**: Structured synthesis, graph triples, statistical distributions, and cited source records.

### Module 6: Due Diligence Dossier (F6)
* **Institutional Due Diligence Report**: Real-time generation via Groq LLM across any corporate filer or survey avenue.
* **Verified Baseline Disclosures**: Audited 10-K facts, liquidity, and solvency metrics.
* **Export Controls**: Direct export to clean Markdown or formatted PDF (print).

### Module 7: Quant & Derivatives Desk (F7)
* **Black-Scholes-Merton Option Pricing**: Closed-form European option valuation.
* **Analytical Greeks Suite**: Delta ($\Delta$), Gamma ($\Gamma$), Vega ($\nu$), Theta ($\Theta$), Rho ($\rho$).
* **Options Chain Matrix**: Multi-strike ladder displaying Call/Put prices, moneyness, and Greeks across the spectrum.

### Module 8: System Configuration & Telemetry (F8)
* **Gateway Diagnostics**: FastAPI REST status and ping latency.
* **Graph Backend**: NetworkX in-memory active store and optional Neo4j connection.
* **Vector Indexer**: `all-MiniLM-L6-v2` dense embedding model.
* **Groq Cloud LLM Inference**: Active models and rate governor status.

---

## 5. Verification & Test Suite Status
All **30 automated tests** pass with 100% green execution:
```
30 passed, 2 warnings in 122.62s
```
* Coverage: API endpoints, Neo4j adapter, weighted pathfinder, retrieval quality, validation schemas, and Black-Scholes analytics.
