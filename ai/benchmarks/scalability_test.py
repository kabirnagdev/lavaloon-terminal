"""
System Scalability & Performance Benchmark Suite.

Benchmarks:
1. Dataset Ingestion & Schema Validation
2. Knowledge Graph Construction (NetworkX Nodes & Statistical Edges)
3. Vector Retrieval Latency (Exact NumPy vs FAISS Flat vs FAISS HNSW)
4. Multi-hop Graph Traversal Latency
Across 1,000, 10,000, and 100,000 records.
"""

import os
import sys
import time
import json
from typing import Dict, Any, List
import psutil
import pandas as pd
import numpy as np
import networkx as nx

# Add repository root to path
sys.path.insert(0, os.path.abspath("."))

from ai.ingestion.validator import FinancialDataValidator
from ai.retrieval.vector_index import benchmark_vector_indexes, FaissHNSWIndex, ExactNumpyIndex


def generate_synthetic_financial_dataset(n_rows: int) -> pd.DataFrame:
    """Generate realistic categorical financial survey data at scale."""
    rng = np.random.default_rng(42)

    genders = ["Male", "Female"]
    ages = rng.integers(20, 65, size=n_rows)
    avenues = ["Mutual Funds", "Equity Market", "Fixed Deposits", "Government Bonds", "Gold"]
    objectives = ["Capital Appreciation", "Growth", "Income", "Safe Investment"]
    purposes = ["Retirement", "Wealth Creation", "Education", "Tax Saving"]
    durations = ["Less than 1 year", "1-3 years", "3-5 years", "More than 5 years"]
    factors = ["Returns", "Risk", "Lock-in Period", "Tax Benefit"]

    df = pd.DataFrame(
        {
            "gender": rng.choice(genders, size=n_rows),
            "age": ages,
            "Investment_Avenues": rng.choice(["Yes", "No"], size=n_rows, p=[0.85, 0.15]),
            "Mutual_Funds": rng.integers(1, 7, size=n_rows),
            "Equity_Market": rng.integers(1, 7, size=n_rows),
            "Fixed_Deposits": rng.integers(1, 7, size=n_rows),
            "Government_Bonds": rng.integers(1, 7, size=n_rows),
            "Gold": rng.integers(1, 7, size=n_rows),
            "Objective": rng.choice(objectives, size=n_rows),
            "Purpose": rng.choice(purposes, size=n_rows),
            "Duration": rng.choice(durations, size=n_rows),
            "Factor": rng.choice(factors, size=n_rows),
            "Avenue": rng.choice(avenues, size=n_rows),
        }
    )
    return df


def benchmark_graph_construction(df: pd.DataFrame) -> Dict[str, Any]:
    """Measure NetworkX graph construction time and graph size."""
    t0 = time.perf_counter()
    B = nx.Graph()

    # Bipartite entity extraction
    cols_to_link = ["gender", "Objective", "Purpose", "Duration", "Factor", "Avenue"]
    for idx, row in df.iterrows():
        rec_node = f"Record_{idx}"
        B.add_node(rec_node, ntype="Record")
        for col in cols_to_link:
            val = str(row[col])
            ent_node = f"{col}:{val}"
            B.add_node(ent_node, ntype="Entity", category=col, label=val)
            B.add_edge(rec_node, ent_node)

    bipartite_time_ms = (time.perf_counter() - t0) * 1000

    # Test multi-hop traversal latency
    sample_nodes = [n for n in B.nodes if str(n).startswith("Objective:") or str(n).startswith("Avenue:")]
    traversal_latencies = []
    if len(sample_nodes) >= 2:
        for i in range(min(20, len(sample_nodes) - 1)):
            s = sample_nodes[i]
            t = sample_nodes[i + 1]
            t_start = time.perf_counter()
            try:
                nx.shortest_path(B, source=s, target=t)
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                pass
            traversal_latencies.append((time.perf_counter() - t_start) * 1000)

    mean_traversal_ms = float(np.mean(traversal_latencies)) if traversal_latencies else 0.0

    return {
        "bipartite_nodes": B.number_of_nodes(),
        "bipartite_edges": B.number_of_edges(),
        "build_time_ms": round(bipartite_time_ms, 2),
        "mean_traversal_ms": round(mean_traversal_ms, 4),
    }


def run_full_scalability_benchmark() -> Dict[str, Any]:
    """Execute scalability benchmarks across 1K, 10K, and 100K synthetic records."""
    process = psutil.Process(os.getpid())
    scales = [1_000, 10_000, 100_000]
    results = {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "benchmarks": {}}

    for n in scales:
        print(f"\n--- Benchmarking Scale: {n:,} Records ---")
        scale_res = {}

        # 1. Dataset Generation
        df = generate_synthetic_financial_dataset(n)
        scale_res["record_count"] = n

        # 2. Schema Validation Benchmark
        t0 = time.perf_counter()
        cleaned_df, report = FinancialDataValidator.validate_survey_dataframe(df)
        val_time_ms = (time.perf_counter() - t0) * 1000
        scale_res["validation"] = {
            "time_ms": round(val_time_ms, 2),
            "throughput_records_per_sec": round(n / (val_time_ms / 1000.0), 1),
            "is_valid": report.is_valid,
        }
        print(f"Validation: {val_time_ms:.2f} ms ({scale_res['validation']['throughput_records_per_sec']:,} rec/s)")

        # 3. Graph Construction Benchmark
        # For 100k, profile bipartite graph
        graph_perf = benchmark_graph_construction(df)
        scale_res["graph"] = graph_perf
        print(f"Graph Construction: {graph_perf['build_time_ms']:.2f} ms ({graph_perf['bipartite_nodes']:,} nodes, {graph_perf['bipartite_edges']:,} edges)")

        # 4. Vector Retrieval Benchmark
        vec_perf = benchmark_vector_indexes(n_records=n, dimension=384, top_k=5, n_queries=50)
        scale_res["vector_retrieval"] = vec_perf["indexes"]
        print(f"NumPy Exact Latency: {vec_perf['indexes']['numpy_exact']['mean_query_latency_ms']:.4f} ms")
        if "faiss_hnsw_ann" in vec_perf["indexes"]:
            print(f"FAISS HNSW Latency: {vec_perf['indexes']['faiss_hnsw_ann']['mean_query_latency_ms']:.4f} ms (QPS: {vec_perf['indexes']['faiss_hnsw_ann']['qps']})")

        # 5. Memory Footprint
        mem_mb = process.memory_info().rss / (1024 * 1024)
        scale_res["memory_usage_mb"] = round(mem_mb, 2)
        print(f"Process Resident Memory: {mem_mb:.2f} MB")

        results["benchmarks"][str(n)] = scale_res

    # Save to JSON
    out_dir = "ai/benchmarks"
    os.makedirs(out_dir, exist_ok=True)
    out_json = os.path.join(out_dir, "scalability_results.json")
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n[OK] Scalability benchmark results saved to {out_json}")
    return results


if __name__ == "__main__":
    run_full_scalability_benchmark()
