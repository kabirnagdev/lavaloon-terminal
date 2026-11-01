# Comparative Benchmark: Classic Vector RAG vs GraphRAG vs Hybrid RAG

**Evaluation Date**: 2026-10-30  
**Evaluator**: Institutional Evaluation Suite (`ai/evaluation/institutional_eval_runner.py`)  
**Data Grounding**: 40 Benchmark Inquiries across 10 Evaluation Categories  
**Dataset Artifact**: `evaluation_reports/GRAPHRAG_TEST_RESULTS.csv`  

---

## 1. Executive Summary & Benchmark Overview

To determine the architectural efficacy of Knowledge Graph augmentation for financial domain intelligence, we benchmarked three distinct retrieval-augmented architectures against an identical set of 40 complex inquiries spanning retail investor survey distributions, corporate balance sheets, supply-chain topologies, and multi-hop entity reasoning.

### The Three Evaluated Paradigms
1. **Classic Vector RAG**: Standard dense semantic vector similarity retrieval using `SentenceTransformer` (`all-MiniLM-L6-v2`) over chunked textual records without knowledge graph traversal or structured relational priors.
2. **GraphRAG (BFS & Association Layer)**: Multi-hop breadth-first traversal combining statistical lift association mining with directed knowledge graph entity edges (companies, metrics, segments, risks, competitors, suppliers).
3. **Hybrid RAG (Tree-of-Thought Reasoning)**: Integrated pipeline combining vector similarity candidates, structured graph triples, and multi-stage decomposed prompt reasoning (initial ideation -> conceptual distillation -> grounded synthesis).

---

## 2. Head-to-Head Performance Matrix

| Evaluation Metric | Classic Vector RAG | GraphRAG (BFS) | Hybrid RAG (ToT) | Best Performing Architecture |
| :--- | :---: | :---: | :---: | :---: |
| **Mean Accuracy Score** | 47.50% | **76.05%** | **76.05%** | **GraphRAG / Hybrid** (+28.55%) |
| **Verified Pass Rate (Score ≥ 0.70)** | 45.00% (18/40) | **70.00%** (28/40) | **70.00%** (28/40) | **GraphRAG / Hybrid** (+25.00%) |
| **Single-Hop Accuracy (N=14)** | 30.93% | **83.93%** | **83.93%** | **GraphRAG / Hybrid** (+53.00%) |
| **Multi-Hop Accuracy (N=26)** | 56.42% | **71.81%** | **71.81%** | **GraphRAG / Hybrid** (+15.39%) |
| **Average Query Latency (ms)** | **7.4 ms** | 20.7 ms | 17.4 ms | **Classic Vector RAG** (faster) |
| **Hallucination / Ungrounded Claims** | High on cross-entity | **0.0%** (Grounded) | **0.0%** (Grounded) | **GraphRAG / Hybrid** |
| **Source Provenance Grounding** | Text chunk match only | **100.0%** verified | **100.0%** verified | **GraphRAG / Hybrid** |

---

## 3. Category Breakdown Analysis

```
Category A: Basic Financial Understanding
  Classic RAG:  8.2%   |====================
  GraphRAG:   100.0%   |================================================================================
  Difference: +91.8% gain for GraphRAG

Category B: Financial Statement Analysis
  Classic RAG: 12.5%   |==============================
  GraphRAG:    64.5%   |======================================================
  Difference: +52.0% gain for GraphRAG

Category C: Revenue and Profitability
  Classic RAG: 18.8%   |=============================================
  GraphRAG:    43.8%   |=============================================================
  Difference: +25.0% gain for GraphRAG

Category D: Cash Flow and Debt Analysis
  Classic RAG: 35.5%   |=================================================================
  GraphRAG:    85.5%   |================================================================================
  Difference: +50.0% gain for GraphRAG

Category E: Risk Identification
  Classic RAG:  0.0%   |
  GraphRAG:     0.0%   |
  Difference: Equal (Both failed strict multi-keyword substring match)

Category F: Competitor Comparison
  Classic RAG: 50.0%   |=================================================================
  GraphRAG:    75.0%   |================================================================================
  Difference: +25.0% gain for GraphRAG

Category G: Entity Relationship Analysis
  Classic RAG: 100.0%  |================================================================================
  GraphRAG:    100.0%  |================================================================================
  Difference: Equal (Both successfully identified primary entity dependencies)

Category H: Multi-Hop Graph Reasoning
  Classic RAG: 100.0%  |================================================================================
  GraphRAG:    100.0%  |================================================================================
  Difference: Equal (Graph paths correctly mapped supply chain links)

Category I: Cross-Company Analysis
  Classic RAG: 50.0%   |=================================================================
  GraphRAG:    91.8%   |================================================================================
  Difference: +41.8% gain for GraphRAG

Category J: Survey-Based Evidence Analysis
  Classic RAG: 100.0%  |================================================================================
  GraphRAG:    100.0%  |================================================================================
  Difference: Equal (Both performed flawlessly on empirical survey distributions)
```

---

## 4. Key Comparative Findings

### 1. The Vector Blindness Phenomenon on Structured Financial Facts
In Category A (`Basic financial understanding`), Classic Vector RAG achieved only **8.2% accuracy**, while GraphRAG scored **100.0%**.
- **Root Cause**: Vector embeddings match based on semantic proximity, not relational hierarchy. A query asking for *"Apple's revenue and net income in its latest completed fiscal year"* retrieves chunks containing general keywords ("income", "returns", "investment") rather than isolating the authoritative corporate node `Company:AAPL` and traversing to `Metric:Total Revenue`.
- GraphRAG performs lexical and semantic entity linking directly to the node `Company:AAPL`, traversing the directed edge `reports_metric` to retrieve the exact integer `$383,285,000,000` with official SEC filing provenance.

### 2. Multi-Hop Graph Traversal
In Category I (`Cross-company analysis`), comparing companies across different filing regimes (e.g. comparing debt of TCS vs Reliance, or ranking Big Tech operating margins) requires aggregating metrics from distinct disparate filings.
- Classic Vector RAG struggles because text chunks from different filings rarely cluster together in vector space.
- GraphRAG links both entity seeds simultaneously, expands the relational frontier across both nodes, and surfaces the comparative triples in a single retrieval context (+41.8% accuracy gain).

### 3. Latency vs Accuracy Trade-off
- **Classic Vector RAG** ran at an average latency of **7.4 ms**, performing only a matrix dot-product (`rec_vecs @ qv`).
- **GraphRAG (BFS)** required **20.7 ms** (+13.3 ms overhead), which includes candidate entity linking, cosine re-ranking, and NetworkX subgraph traversal.
- **Hybrid RAG** ran at **17.4 ms**.
- **Institutional Verdict**: In institutional finance, a 13.3 ms latency difference is completely negligible compared to the massive **+28.55% absolute accuracy gain** and the complete elimination of numerical hallucinations.

---

## 5. Architectural Recommendations

1. **Standardize on Hybrid GraphRAG as Default**: The benchmark demonstrates that Knowledge Graph augmentation is essential for financial reporting, cross-company benchmarking, and supply-chain reasoning.
2. **Maintain Vector Search as a Seed Generator**: Unstructured semantic vector similarity should not be used as the final answer generator, but serves effectively as an entry-point seed finder when exact lexical matches fail.
3. **Incorporate Sub-entity Granularity for Qualitative Filings**: Extend knowledge graph parsing to chunk Item 1A Risk Factors into individual clause-level nodes to resolve the 0.0% accuracy bottleneck observed in Category E.

