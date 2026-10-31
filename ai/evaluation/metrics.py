from typing import List, Dict, Any, Set

def precision_at_k(retrieved: List[str], expected: List[str], k: int = 5) -> float:
    """Calculate Precision@K."""
    top_k = retrieved[:k]
    if not top_k:
        return 0.0
    hits = sum(1 for item in top_k if any(exp.lower() in item.lower() for exp in expected))
    return round(hits / len(top_k), 4)

def recall_at_k(retrieved: List[str], expected: List[str], k: int = 5) -> float:
    """Calculate Recall@K."""
    if not expected:
        return 1.0 if not retrieved else 0.0
    top_k = retrieved[:k]
    hits = sum(1 for exp in expected if any(exp.lower() in r.lower() for r in top_k))
    return round(hits / len(expected), 4)

def mean_reciprocal_rank(retrieved: List[str], expected: List[str]) -> float:
    """Calculate Reciprocal Rank (RR) for a single query."""
    if not expected:
        return 0.0
    for idx, item in enumerate(retrieved):
        if any(exp.lower() in item.lower() for exp in expected):
            return round(1.0 / (idx + 1), 4)
    return 0.0

def entity_linking_accuracy(retrieved_seeds: List[str], expected_seeds: List[str]) -> float:
    """Calculate entity linking accuracy (binary hit if at least 1 expected seed is matched)."""
    if not expected_seeds:
        # For unrelated queries, accuracy is 1.0 if no seeds were matched or low confidence
        return 1.0 if len(retrieved_seeds) == 0 else 0.0
    matched = any(
        any(exp.lower() in s.lower() for exp in expected_seeds)
        for s in retrieved_seeds
    )
    return 1.0 if matched else 0.0

def context_relevance_score(triples_count: int, stats_present: bool, confidence: str) -> float:
    """Assess context relevance on a scale of 0.0 to 1.0."""
    score = 0.0
    if stats_present:
        score += 0.4
    if triples_count > 0:
        score += 0.4
    if confidence == "high":
        score += 0.2
    elif confidence == "moderate":
        score += 0.1
    return round(min(score, 1.0), 2)

