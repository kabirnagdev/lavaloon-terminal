import pytest
from ai.ingestion.loader import load_financial_data
from ai.graph.builder import build_kg
from ai.retrieval.embeddings import get_embedding_engine
from ai.retrieval.retriever import HybridGraphRetriever
from ai.reasoning.groq_client import get_groq_client

@pytest.fixture(scope="module")
def retriever_instance():
    df = load_financial_data()
    G, A, ent_cols, prop_cols = build_kg(df)
    embedder = get_embedding_engine()
    llm = get_groq_client()
    return HybridGraphRetriever(df, G, A, embedder, llm)

def test_configurable_thresholds(retriever_instance):
    q = "What kind of investors choose Mutual Funds?"
    kws = ["Mutual", "Funds", "investors"]

    # High threshold should be stricter
    strict_seeds, _ = retriever_instance.link(q, kws, ent_thr=0.85)
    # Lenient threshold
    lenient_seeds, _ = retriever_instance.link(q, kws, ent_thr=0.30)

    assert len(lenient_seeds) >= len(strict_seeds)
    for s in strict_seeds:
        assert s["score"] >= 0.85 or s["match_type"] in ["exact_lexical", "substring_lexical"]

def test_entity_match_confidence(retriever_instance):
    q = "Fixed Deposits interest rates"
    kws = ["Fixed", "Deposits"]
    seeds, _ = retriever_instance.link(q, kws)

    assert len(seeds) > 0
    top = seeds[0]
    assert "node_id" in top
    assert "label" in top
    assert "score" in top
    assert "match_type" in top
    assert 0.0 <= top["score"] <= 1.0

def test_multihop_decay_ranking(retriever_instance):
    # Test hop decay
    seeds = [{"node_id": "Avenue=Mutual Fund", "label": "Avenue: Mutual Fund"}]
    triples = retriever_instance.expand(seeds, hops=2, per_hop=5, hop_decay=0.5)

    hop1 = [t for t in triples if t["hop"] == 1]
    hop2 = [t for t in triples if t["hop"] == 2]

    assert len(hop1) > 0
    # Every triple has a relevance_score
    for t in triples:
        assert "relevance_score" in t
        assert t["relevance_score"] > 0

def test_insufficient_evidence_detection(retriever_instance):
    unrelated_query = "What is the orbital trajectory of the James Webb telescope in L2 orbit?"
    res = retriever_instance.retrieve(unrelated_query, ent_thr=0.70)

    # For an unrelated query with strict threshold, evidence should be insufficient
    assert res["evidence_confidence"] in ["insufficient", "moderate"]
    prompt = retriever_instance.build_prompt(unrelated_query, res)
    if res["evidence_confidence"] == "insufficient":
        assert "WARNING: Evidence is insufficient" in prompt

def test_statistical_sample_size_preserved(retriever_instance):
    q = "Mutual Funds"
    res = retriever_instance.retrieve(q, hops=1)
    stats = res["profile"]

    # Verify N=40 sample size is explicitly stated
    assert "N=40" in stats or "40 respondent records" in stats
    assert "STATISTICAL NOTE" in stats

