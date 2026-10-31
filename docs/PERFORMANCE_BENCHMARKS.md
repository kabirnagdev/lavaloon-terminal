# Performance & Scalability Benchmarks

**Execution Date:** 2026-10-30  
**Hardware:** Apple Silicon (macOS Darwin arm64)  
**Dataset:** Categorical Financial Survey Ontologies (1K, 10K, 100K synthetic records)  
**Embedding Dimension:** 384-dimensional dense vectors (`all-MiniLM-L6-v2` compatible)  

---

## 1. Executive Summary

As financial intelligence systems scale from exploratory prototypes ($N = 40$) to production-scale transaction histories and market surveys ($N = 1,000$ to $100,000+$), system bottlenecks shift dramatically:

1. **Ingestion & Validation**: Linear $O(N)$ with sub-35 ms runtimes for 100,000 records (>2.8 million records/second throughput).
2. **NetworkX In-Memory Graph**: NetworkX easily sustains 100,000 nodes and 600,000 edges in ~365 MB resident RAM. However, construction time scales linearly with edge count (1.29s for 600K edges). For graphs $> 500,000$ edges, offloading to persistent **Neo4j** graph clusters avoids per-process heap inflation.
3. **Vector Semantic Search**:
   - Up to $N = 10,000$: Dense NumPy vector matrix multiplication is fast enough (<0.25 ms per query).
   - At $N = 100,000$: **FAISS HNSW** delivers **0.416 ms** per query (2,403 QPS), **5.3x faster** than dense matrix multiplication ($2.216$ ms).

---

## 2. Empirical Benchmark Matrix

| Scale | Stage | Metric | Measured Value | Theoretical Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **1,000 Records** | Schema Validation | Duration | 3.45 ms | $O(N)$ |
| | | Throughput | 289,446 rec/sec | |
| | Graph Construction | Time | 11.69 ms | $O(N \cdot K)$ |
| | | Graph Size | 1,023 nodes, 6,000 edges | |
| | Vector Search | NumPy Exact Latency | 0.0410 ms | $O(N \cdot D)$ |
| | | FAISS HNSW Latency | 0.0468 ms (21,345 QPS) | $O(\log N)$ |
| | Resource Usage | Resident Memory | 141.67 MB | Baseline process |
| **10,000 Records** | Schema Validation | Duration | 5.25 ms | $O(N)$ |
| | | Throughput | 1,904,625 rec/sec | |
| | Graph Construction | Time | 115.88 ms | $O(N \cdot K)$ |
| | | Graph Size | 10,023 nodes, 60,000 edges | |
| | Vector Search | NumPy Exact Latency | 0.2541 ms | $O(N \cdot D)$ |
| | | FAISS HNSW Latency | 0.1071 ms (9,339 QPS) | $O(\log N)$ |
| | Resource Usage | Resident Memory | 256.33 MB | |
| **100,000 Records** | Schema Validation | Duration | 34.58 ms | $O(N)$ |
| | | Throughput | 2,891,458 rec/sec | |
| | Graph Construction | Time | 1,291.85 ms (1.29 s) | $O(N \cdot K)$ |
| | | Graph Size | 100,023 nodes, 600,000 edges | |
| | Vector Search | NumPy Exact Latency | 2.2162 ms | $O(N \cdot D)$ |
| | | FAISS HNSW Latency | 0.4160 ms (2,403 QPS) | $O(\log N)$ |
| | Resource Usage | Resident Memory | 364.55 MB | |

---

## 3. Bottleneck Analysis & Production Guidelines

### When to use NetworkX vs Neo4j
- **$N < 50,000$ records (or $< 200,000$ edges)**: NetworkX in-memory graph is optimal. It offers zero network latency, sub-millisecond multi-hop BFS, and no external infrastructure requirement.
- **$N \ge 50,000$ records (or multi-replica backend)**: NetworkX memory footprint and worker restart costs grow ($>1.3$ s per restart). The backend should enable `GRAPH_BACKEND="NEO4J"` in `.env` to offload graph storage to a clustered graph database with APOC indexing.

### When to switch from NumPy Dot Product to FAISS HNSW
- **$N < 5,000$ records**: Dense NumPy dot-product is fast (<0.1 ms) and requires zero indexing overhead.
- **$N \ge 10,000$ records**: `FaissHNSWIndex` (`ai/retrieval/vector_index.py`) should be enabled for semantic retrieval to cap query latency under 0.5 ms and sustain high concurrent throughput.

