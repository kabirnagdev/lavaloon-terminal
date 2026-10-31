import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["records_count"] == 40
    assert data["graph_nodes"] > 100
    assert data["graph_edges"] > 500

def test_list_companies():
    response = client.get("/api/v1/companies")
    assert response.status_code == 200
    companies = response.json()
    assert len(companies) >= 4
    ids = [c["id"] for c in companies]
    assert "mutual-funds" in ids
    assert "equity-market" in ids
    assert "nvda" in ids

def test_get_company_detail():
    response = client.get("/api/v1/companies/mutual-funds")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "mutual-funds"
    assert len(data["metrics"]) > 0
    assert data["metrics"][0]["is_audited"] is False

def test_company_not_found():
    response = client.get("/api/v1/companies/non-existent-entity")
    assert response.status_code == 404

def test_get_relationships():
    response = client.get("/api/v1/companies/mutual-funds/relationships")
    assert response.status_code == 200
    rels = response.json()
    assert isinstance(rels, list)

def test_cytoscape_graph():
    response = client.get("/api/v1/graph/cytoscape?min_lift=1.5&max_nodes=50")
    assert response.status_code == 200
    data = response.json()
    assert "elements" in data
    assert "nodes" in data["elements"]
    assert "edges" in data["elements"]
    assert len(data["elements"]["nodes"]) > 0
    assert len(data["categories"]) > 0

def test_shortest_path():
    response = client.post("/api/v1/graph/paths", json={
        "source": "Mutual Fund",
        "target": "Safe Investment",
        "max_depth": 3
    })
    assert response.status_code == 200
    data = response.json()
    assert "found" in data

def test_research_query():
    response = client.post("/api/v1/research/query", json={
        "question": "What is the most popular investment avenue overall?",
        "hops": 2,
        "mode": "graph_rag"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 10
    assert "keywords" in data
    assert "triples" in data
    assert data["grounding_confidence"] in ["high", "moderate", "exploratory"]

def test_due_diligence_analyze():
    response = client.post("/api/v1/diligence/analyze", json={
        "target_id": "Mutual Funds"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["target"] == "Mutual Funds"
    assert "executive_summary" in data
    assert len(data["verified_facts"]) > 0
    assert len(data["disclaimers"]) > 0

def test_black_scholes_quant():
    response = client.post("/api/v1/quant/black-scholes", json={
        "S": 100.0,
        "K": 100.0,
        "T_days": 30.0,
        "r": 0.05,
        "sigma": 0.25,
        "option_type": "call"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["price"] > 0
    assert 0.4 < data["greeks"]["delta_call"] < 0.6
    assert data["greeks"]["gamma"] > 0

def test_options_chain():
    response = client.post("/api/v1/quant/options-chain", json={
        "S": 100.0,
        "strikes": [90.0, 95.0, 100.0, 105.0, 110.0],
        "T_days": 30.0,
        "r": 0.05,
        "sigma": 0.25
    })
    assert response.status_code == 200
    chain = response.json()
    assert len(chain) == 5
    assert chain[2]["strike"] == 100.0

