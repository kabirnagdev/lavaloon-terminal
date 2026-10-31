"""
High-Performance Vector Indexing Engine.

Provides exact inner product / cosine similarity indexing alongside
logarithmic Approximate Nearest Neighbors (ANN) indexing via FAISS (IndexHNSWFlat / IndexFlatIP)
with pure NumPy fallback for scalable semantic retrieval.
"""

import time
from typing import List, Tuple, Dict, Any, Optional
import numpy as np

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    faiss = None
    FAISS_AVAILABLE = False


class VectorIndexBase:
    """Base interface for vector retrieval indexes."""

    def build(self, embeddings: np.ndarray, ids: Optional[List[str]] = None) -> None:
        raise NotImplementedError

    def search(self, query_vec: np.ndarray, top_k: int = 5) -> List[Tuple[int, float]]:
        """Return list of (index, similarity_score)."""
        raise NotImplementedError

    @property
    def total_vectors(self) -> int:
        raise NotImplementedError


class ExactNumpyIndex(VectorIndexBase):
    """
    Exact dense matrix multiplication cosine retrieval.
    Complexity: O(N * D) per query. Baseline for small N (< 10,000).
    """

    def __init__(self):
        self.vectors: Optional[np.ndarray] = None
        self.ids: Optional[List[str]] = None

    def build(self, embeddings: np.ndarray, ids: Optional[List[str]] = None) -> None:
        # Normalize for cosine similarity
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self.vectors = (embeddings / norms).astype(np.float32)
        self.ids = ids

    def search(self, query_vec: np.ndarray, top_k: int = 5) -> List[Tuple[int, float]]:
        if self.vectors is None or len(self.vectors) == 0:
            return []

        # Ensure query is 1D or 2D and normalized
        q = query_vec.reshape(1, -1).astype(np.float32)
        q_norm = np.linalg.norm(q)
        if q_norm > 0:
            q = q / q_norm

        scores = np.dot(self.vectors, q.T).flatten()
        top_k = min(top_k, len(scores))
        top_indices = np.argpartition(-scores, top_k - 1)[:top_k]
        top_indices = top_indices[np.argsort(-scores[top_indices])]

        return [(int(idx), float(scores[idx])) for idx in top_indices]

    @property
    def total_vectors(self) -> int:
        return len(self.vectors) if self.vectors is not None else 0


class FaissFlatIndex(VectorIndexBase):
    """
    Exact Inner Product (Cosine) index backed by FAISS IndexFlatIP.
    Vectorized SIMD / BLAS acceleration.
    """

    def __init__(self, dimension: int):
        self.dimension = dimension
        self.index = None
        self.ids: Optional[List[str]] = None

    def build(self, embeddings: np.ndarray, ids: Optional[List[str]] = None) -> None:
        if not FAISS_AVAILABLE:
            raise RuntimeError("FAISS is not installed. Install faiss-cpu or use ExactNumpyIndex.")

        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized = (embeddings / norms).astype(np.float32)

        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(normalized)
        self.ids = ids

    def search(self, query_vec: np.ndarray, top_k: int = 5) -> List[Tuple[int, float]]:
        if self.index is None or self.index.ntotal == 0:
            return []

        q = query_vec.reshape(1, -1).astype(np.float32)
        q_norm = np.linalg.norm(q)
        if q_norm > 0:
            q = q / q_norm

        top_k = min(top_k, self.index.ntotal)
        distances, indices = self.index.search(q, top_k)
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != -1:
                results.append((int(idx), float(dist)))
        return results

    @property
    def total_vectors(self) -> int:
        return self.index.ntotal if self.index is not None else 0


class FaissHNSWIndex(VectorIndexBase):
    """
    Hierarchical Navigable Small World (HNSW) graph-based ANN index.
    Logarithmic O(log N) retrieval complexity for enterprise datasets (100K to 10M+).
    """

    def __init__(self, dimension: int, m: int = 32, ef_search: int = 64):
        self.dimension = dimension
        self.m = m
        self.ef_search = ef_search
        self.index = None
        self.ids: Optional[List[str]] = None

    def build(self, embeddings: np.ndarray, ids: Optional[List[str]] = None) -> None:
        if not FAISS_AVAILABLE:
            raise RuntimeError("FAISS is not installed. Install faiss-cpu or use ExactNumpyIndex.")

        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized = (embeddings / norms).astype(np.float32)

        # IndexHNSWFlat with INNER_PRODUCT metric for cosine similarity
        self.index = faiss.IndexHNSWFlat(self.dimension, self.m, faiss.METRIC_INNER_PRODUCT)
        self.index.hnsw.efSearch = self.ef_search
        self.index.add(normalized)
        self.ids = ids

    def search(self, query_vec: np.ndarray, top_k: int = 5) -> List[Tuple[int, float]]:
        if self.index is None or self.index.ntotal == 0:
            return []

        q = query_vec.reshape(1, -1).astype(np.float32)
        q_norm = np.linalg.norm(q)
        if q_norm > 0:
            q = q / q_norm

        top_k = min(top_k, self.index.ntotal)
        distances, indices = self.index.search(q, top_k)
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != -1:
                results.append((int(idx), float(dist)))
        return results

    @property
    def total_vectors(self) -> int:
        return self.index.ntotal if self.index is not None else 0


def benchmark_vector_indexes(
    n_records: int, dimension: int = 384, top_k: int = 5, n_queries: int = 100
) -> Dict[str, Any]:
    """
    Benchmark indexing and query latency between Exact NumPy, FAISS Flat, and FAISS HNSW.
    """
    rng = np.random.default_rng(42)
    data = rng.standard_normal((n_records, dimension)).astype(np.float32)
    queries = rng.standard_normal((n_queries, dimension)).astype(np.float32)

    results = {"dataset_size": n_records, "dimension": dimension, "queries": n_queries, "indexes": {}}

    # 1. NumPy Exact
    np_index = ExactNumpyIndex()
    t0 = time.perf_counter()
    np_index.build(data)
    np_build_ms = (time.perf_counter() - t0) * 1000

    t0 = time.perf_counter()
    for q in queries:
        np_index.search(q, top_k=top_k)
    np_query_ms = ((time.perf_counter() - t0) / n_queries) * 1000

    results["indexes"]["numpy_exact"] = {
        "build_time_ms": round(np_build_ms, 2),
        "mean_query_latency_ms": round(np_query_ms, 4),
        "qps": round(1000.0 / np_query_ms, 1) if np_query_ms > 0 else 0,
    }

    # 2. FAISS Flat IP
    if FAISS_AVAILABLE:
        flat_index = FaissFlatIndex(dimension)
        t0 = time.perf_counter()
        flat_index.build(data)
        flat_build_ms = (time.perf_counter() - t0) * 1000

        t0 = time.perf_counter()
        for q in queries:
            flat_index.search(q, top_k=top_k)
        flat_query_ms = ((time.perf_counter() - t0) / n_queries) * 1000

        results["indexes"]["faiss_flat_exact"] = {
            "build_time_ms": round(flat_build_ms, 2),
            "mean_query_latency_ms": round(flat_query_ms, 4),
            "qps": round(1000.0 / flat_query_ms, 1) if flat_query_ms > 0 else 0,
        }

        # 3. FAISS HNSW
        hnsw_index = FaissHNSWIndex(dimension)
        t0 = time.perf_counter()
        hnsw_index.build(data)
        hnsw_build_ms = (time.perf_counter() - t0) * 1000

        t0 = time.perf_counter()
        for q in queries:
            hnsw_index.search(q, top_k=top_k)
        hnsw_query_ms = ((time.perf_counter() - t0) / n_queries) * 1000

        results["indexes"]["faiss_hnsw_ann"] = {
            "build_time_ms": round(hnsw_build_ms, 2),
            "mean_query_latency_ms": round(hnsw_query_ms, 4),
            "qps": round(1000.0 / hnsw_query_ms, 1) if hnsw_query_ms > 0 else 0,
        }

    return results

