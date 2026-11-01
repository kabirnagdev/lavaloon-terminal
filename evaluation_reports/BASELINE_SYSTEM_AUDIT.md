# Baseline System Audit: Financial Intelligence & GraphRAG Platform

**Audit Timestamp:** 2026-10-30  
**Lead Auditor:** Senior AI Engineer & Financial Knowledge Graph Specialist  
**Target Repository:** `lavaloon-terminal-main`  

---

## 1. Executive Summary

This audit establishes the baseline architectural and functional capabilities of the existing AI research project prior to autonomous data ingestion, real-world GraphRAG stress-testing, and accuracy benchmarking.

The repository originates from exploratory Jupyter notebooks (`GraphRAG+knowledgegraph.ipynb`, `Knowledge_graph_finance_RAG_2.ipynb`, `Microsoft_GraphRag.ipynb`, and `Classic_csv_RAG.ipynb`), which implemented a hybrid statistical graph retrieval pipeline over personal finance survey data.

---

## 2. Notebook Analysis & Source of Truth

| Notebook | Purpose | Status / Viability | Code Cells | Key Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **`Knowledge_graph_finance_RAG_2.ipynb`** | Full end-to-end GraphRAG pipeline with executed visualization cells, frequency profiling, and prompt construction. | **Primary Source of Truth**. Most complete, reproducible, and executed implementation. | 18 | `networkx`, `pandas`, `groq`, `sentence-transformers`, `rdflib` |
| **`GraphRAG+knowledgegraph.ipynb`** | Identical architecture to `Knowledge_graph_finance_RAG_2.ipynb`, Kaggle-ready headless runner. | Functional mirror of the primary notebook. | 18 | `networkx`, `pandas`, `groq`, `sentence-transformers`, `rdflib` |
| **`Microsoft_GraphRag.ipynb`** | Experimental trial using Microsoft's `graphrag` CLI (`graphrag.index`, `graphrag.query`). | **Incomplete/Experimental**. Requires external Azure/OpenAI API keys; not connected to the local terminal runtime. | 10 | `graphrag` CLI, `yaml`, `subprocess` |
| **`Classic_csv_RAG.ipynb`** | Baseline vector RAG over `customers-100.csv` using LangChain and FAISS. | **Baseline Reference**. Used for comparing pure vector similarity against graph-augmented retrieval. | 8 | `langchain_community`, `faiss-cpu`, `groq` |

---

## 3. Existing Graph Schema & Ontology Modeling

### In-Memory NetworkX Bipartite Graph
The core graph engine (`ai/graph/builder.py`) structures data as a directed bipartite graph:
1. **`Record` Nodes**: Represent individual survey respondents or filing entries.
   - Node ID format: `record:{index}` (e.g., `record:0`)
   - Attributes: `ntype="Record"`, `row=int`, `label="Record i"`, `text=str` (serialized row), `props=dict` (continuous variables).
2. **`Entity` Nodes**: Extracted categorical values exceeding distinct threshold rules ($1 < \text{nunique} \le 25$ and $\text{nunique} \le 0.6 \times N$).
   - Node ID format: `{column}={value}` (e.g., `Investment_Avenues=Yes`, `Avenue=Mutual Funds`)
   - Attributes: `ntype="Entity"`, `col=str`, `value=str`, `label=str`.
3. **Directed Predicate Edges**:
   - `(Record) -[:predicate]-> (Entity)` where `predicate` is the source column name.
4. **Undirected Statistical Association Layer (`A`)**:
   - Formed directly between `Entity` nodes across different columns based on statistical **Lift**:
     $$\text{Lift}(A, B) = \frac{P(A \cap B)}{P(A) \cdot P(B)} = \frac{\text{co} \times N}{\text{count}(A) \times \text{count}(B)}$$
   - Pruning criteria: Co-occurrence $\ge \max(3, 0.05 \times N)$ and $\text{Lift} \ge 1.5$.
   - Edge attributes: `predicate="associated_with"`, `count=int`, `lift=float`.

### Neo4j Enterprise Schema
Integrated via `ai/adapters/neo4j_adapter.py`:
- Unique constraints: `(e:Entity {id})`, `(r:Record {id})`.
- Property indexes: `Entity.label`, `Entity.col`, `Entity.value`.
- Batched parameterized Cypher `UNWIND` statements synchronize the NetworkX graph to Neo4j.
- **Failover**: When `NEO4J_URI` is unconfigured, the adapter cleanly falls back to the high-performance in-memory NetworkX DiGraph.

---

## 4. Existing Datasets & Company Coverage

1. **`data/Finance_data.csv`** ($N = 40$ rows, 24 columns):
   - Survey of 40 individual retail investors covering demographic attributes (Gender, Age) and investment preferences (Mutual Funds, Equity Market, Debentures, Government Bonds, Fixed Deposits, PPF, Gold).
2. **`data/Original_data.csv`** ($N = 40$ rows, 24 columns):
   - Unsanitized verbatim survey responses with raw column questions.
3. **Company Coverage in Baseline**:
   - The original research notebooks contained **zero corporate 10-K or equity filings**. They focused exclusively on retail investment avenues (`Mutual Funds`, `Equity Market`, `Fixed Deposits`, `Government Bonds`, `Gold`).
   - The production backend introduced baseline corporate equity profiles for benchmarking (`AAPL`, `MSFT`, `NVDA`, `RELIANCE.NS`, `TCS.NS`), but their graph structures have not yet been populated with multi-year audited financial statements, segment breakdowns, and supply-chain dependencies.

---

## 5. Ingestion, Embedding & Vector Retrieval

1. **Ingestion Logic**:
   - Bipartite projection splits tabular records into categorical Entity nodes and numerical Record attributes.
   - Schema validation (`ai/ingestion/validator.py`) enforces type safety, age bounds [16–120], and recognized categories.
2. **Embeddings**:
   - Model: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
   - Fallback: Local character n-gram hashing embedder when internet or HuggingFace hub is unreachable.
3. **Vector Indexing**:
   - `ai/retrieval/vector_index.py` supports dense NumPy dot-product and logarithmic FAISS `IndexHNSWFlat` ANN indexing.

---

## 6. LLM Configuration & Question Answering

1. **Provider**: Groq API Client (`ai/reasoning/groq_client.py`).
2. **Model Selection Hierarchy**:
   - Primary: `llama-3.3-70b-versatile` / `openai/gpt-oss-120b`
   - Secondary: `llama-3.1-8b-instant` / `openai/gpt-oss-20b`
   - Tertiary: `qwen/qwen3.8-27b`
3. **Offline Fallback**: When `GROQ_API_KEY` is omitted or quota is exhausted, an offline analytical synthesis engine formats the retrieved graph triples and empirical statistics directly.
4. **Reasoning Modes Supported**:
   - `ask()`: Standard GraphRAG (Seeds → 2-Hop BFS with Decay → Exact Statistics → Grounded Response).
   - `ask_tot()`: Tree-of-Thought reasoning (Initial thoughts → Key concepts → Final synthesis).
   - `plain_rag()`: Baseline vector-only retrieval without graph traversal.

---

## 7. Baseline Limitations Identified

1. **Domain Narrowness**: Baseline data is restricted to 40 personal survey respondents; no balance sheet or P&L statement parsing exists.
2. **Lack of Provenance**: Survey triples do not track document pages, filing URLs, or filing dates.
3. **Single Evidence Type**: Financial survey statistics and audited corporate SEC filings were not separated into distinct evidence tiers.
4. **Multi-Hop Traversal on Corporate Networks**: Current graph lacks corporate supplier-customer-competitor relationships.

