import sys, os
sys.path.insert(0, os.path.abspath("."))
import time
import json
from typing import Dict, Any, List

from ai.ingestion.loader import load_financial_data
from ai.graph.builder import build_kg
from ai.retrieval.embeddings import get_embedding_engine
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.groq_client import get_groq_client
from ai.evaluation.dataset import EVALUATION_DATASET
from ai.evaluation.metrics import (
    precision_at_k,
    recall_at_k,
    mean_reciprocal_rank,
    entity_linking_accuracy,
    context_relevance_score
)

def run_evaluation() -> Dict[str, Any]:
    print("=" * 60)
    print("GRAPHRAG EVALUATION FRAMEWORK — BENCHMARK RUNNER")
    print("=" * 60)

    # Initialize Engine
    t0 = time.time()
    df = load_financial_data()
    G, A, ent_cols, prop_cols = build_kg(df)
    embedder = get_embedding_engine()
    llm = get_groq_client()
    retriever = HybridGraphRetriever(df, G, A, embedder, llm)
    init_time = time.time() - t0
    print(f"Engine ready ({init_time:.2f}s). Running {len(EVALUATION_DATASET)} benchmark queries...\n")

    results = []
    p_at_3_list = []
    r_at_3_list = []
    mrr_list = []
    el_acc_list = []
    latencies = []

    for item in EVALUATION_DATASET:
        q_id = item["id"]
        query = item["query"]
        expected = item["expected_seed_contains"]

        start_q = time.time()
        ret_res = retriever.retrieve(query, hops=2)
        latency_ms = (time.time() - start_q) * 1000.0
        latencies.append(latency_ms)

        retrieved_labels = ret_res["seed_labels"]

        if expected:
            p3 = precision_at_k(retrieved_labels, expected, k=3)
            r3 = recall_at_k(retrieved_labels, expected, k=3)
            mrr = mean_reciprocal_rank(retrieved_labels, expected)
            el_acc = entity_linking_accuracy(retrieved_labels, expected)
            p_at_3_list.append(p3)
            r_at_3_list.append(r3)
            mrr_list.append(mrr)
            el_acc_list.append(el_acc)
        else:
            # Unrelated / Insufficient Evidence queries
            el_acc = 1.0 if ret_res["evidence_confidence"] == "insufficient" or len(ret_res["triples"]) == 0 else 0.5
            el_acc_list.append(el_acc)
            p3, r3, mrr = 1.0, 1.0, 1.0

        ctx_score = context_relevance_score(
            triples_count=len(ret_res["triples"]),
            stats_present=len(ret_res["profile"]) > 50,
            confidence=ret_res["evidence_confidence"]
        )

        results.append({
            "id": q_id,
            "category": item["category"],
            "query": query,
            "latency_ms": round(latency_ms, 2),
            "linked_seeds": retrieved_labels,
            "triples_count": len(ret_res["triples"]),
            "evidence_confidence": ret_res["evidence_confidence"],
            "precision_at_3": p3,
            "recall_at_3": r3,
            "mrr": mrr,
            "entity_linking_accuracy": el_acc,
            "context_relevance": ctx_score
        })

        print(f"[{q_id}] ({item['category']}): Latency={latency_ms:.1f}ms | Conf={ret_res['evidence_confidence']} | Seeds={len(retrieved_labels)} | Triples={len(ret_res['triples'])}")

    avg_p3 = round(sum(p_at_3_list) / len(p_at_3_list), 4) if p_at_3_list else 0.0
    avg_r3 = round(sum(r_at_3_list) / len(r_at_3_list), 4) if r_at_3_list else 0.0
    avg_mrr = round(sum(mrr_list) / len(mrr_list), 4) if mrr_list else 0.0
    avg_el_acc = round(sum(el_acc_list) / len(el_acc_list), 4) if el_acc_list else 0.0
    avg_lat = round(sum(latencies) / len(latencies), 2)

    summary = {
        "benchmark_timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "dataset_size_records": len(df),
        "total_queries_evaluated": len(EVALUATION_DATASET),
        "mean_latency_ms": avg_lat,
        "metrics": {
            "mean_precision_at_3": avg_p3,
            "mean_recall_at_3": avg_r3,
            "mean_reciprocal_rank_mrr": avg_mrr,
            "entity_linking_accuracy": avg_el_acc,
            "unsupported_claim_rate_target": 0.0
        },
        "query_details": results
    }

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY RESULTS")
    print(f"Mean Precision@3:          {avg_p3 * 100:.1f}%")
    print(f"Mean Recall@3:             {avg_r3 * 100:.1f}%")
    print(f"Mean Reciprocal Rank (MRR): {avg_mrr:.3f}")
    print(f"Entity Linking Accuracy:   {avg_el_acc * 100:.1f}%")
    print(f"Mean Query Latency:        {avg_lat} ms")
    print("=" * 60)

    return summary

if __name__ == "__main__":
    res = run_evaluation()
    with open("ai/evaluation/benchmark_report.json", "w") as f:
        json.dump(res, f, indent=2)
    print("Saved report to ai/evaluation/benchmark_report.json")
