# GraphRAG Evaluation Framework & Benchmark Report

**Benchmark Date:** October 30, 2026  
**Execution Environment:** Python 3.13 / Apple Silicon / Sentence-Transformers (all-MiniLM-L6-v2)  
**Dataset:** Empirical Financial Survey Dataset (Finance_data.csv, N=40)  
**Evaluation Script:** `ai/evaluation/runner.py`  
**Raw Metrics Source:** `ai/evaluation/benchmark_report.json`

---

## 1. Evaluation Methodology

The framework evaluates the hybrid GraphRAG retrieval pipeline across diverse query modalities:
1. **Relevant Domain Inquiries**: Standard investor preference queries (e.g., Mutual Funds, Equity).
2. **Multi-Hop Relational Inquiries**: Queries necessitating 2-hop graph expansion across the statistical lift layer.
3. **Statistical Aggregations**: Demographic & feature frequency cross-tabulations.
4. **Ambiguous Inquiries**: Multi-attribute queries with overlapping synonyms.
5. **Unrelated / Insufficient Evidence Queries**: Out-of-domain prompts designed to test hallucination resistance and insufficient evidence detection.

---

## 2. Empirical Benchmark Results

| Metric | Result | Interpretation |
|---|---|---|
| **Entity Linking Accuracy** | **100.0%** | Relevant queries successfully matched true seed nodes; out-of-domain queries correctly yielded zero seeds. |
| **Mean Reciprocal Rank (MRR)** | **0.700** | On average, the first true relevant entity node appears at position ~1.4 in the ranked seed list. |
| **Mean Precision@3** | **50.0%** | Out of the top 3 linked seeds, half represent direct ground-truth feature targets. |
| **Mean Recall@3** | **50.0%** | Captures core target entities within top 3 seeds; remainder captured in 2-hop BFS expansion. |
| **Out-of-Domain Insufficient Detection**| **100.0%** | Zero false seeds linked for out-of-domain queries (e.g. quantum physics, space telescope). |
| **Mean Retrieval Latency** | **183.27 ms** | End-to-end keyword extraction, dense vector search, 2-hop BFS graph expansion, and statistical profiling. |

---

## 3. Detailed Query-by-Query Breakdown

| Query ID | Category | Latency (ms) | Confidence | Linked Seeds | Graph Triples | Context Score |
|---|---|---|---|---|---|---|
| `rel_01` | Relevant Domain (Mutual Funds) | 208.6 | `high` | 6 seeds | 16 triples | 1.00 |
| `rel_02` | Relevant Domain (Govt Bonds) | 213.2 | `high` | 6 seeds | 16 triples | 1.00 |
| `multi_01` | Multi-Hop Relationship (FD & PPF) | 135.8 | `high` | 6 seeds | 16 triples | 1.00 |
| `stat_01` | Statistical Aggregation (Gender) | 30.3 | `high` | 2 seeds | 16 triples | 1.00 |
| `ambig_01` | Ambiguous Query (Returns/Safety) | 524.0 | `high` | 6 seeds | 16 triples | 1.00 |
| `unrel_01` | Out-of-Domain (Hubble Orbit) | 151.6 | `insufficient` | 0 seeds | 0 triples | 0.00 |
| `unrel_02` | Out-of-Domain (Quantum Entangle) | 19.3 | `insufficient` | 0 seeds | 0 triples | 0.00 |

---

## 4. Key Observations & Guardrail Validation

1. **Stopword Filtering in Lexical Matcher**: Eliminating interrogative pronouns (`what`, `which`, `how`) prevents false substring collisions with column names (such as *"What are your savings objectives?"*).
2. **Relevance Ranking with Hop Decay**: Applying a $0.70^{\text{hop}-1}$ decay prioritizes direct high-lift co-occurrences while still enabling 2-hop associative discovery.
3. **Deterministic Boundary Setting**: When evidence confidence is flagged as `insufficient`, the prompt explicitly instructs the LLM that the survey does not cover the topic, preventing ungrounded speculation.

