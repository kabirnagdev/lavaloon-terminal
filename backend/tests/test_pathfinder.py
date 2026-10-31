import pytest
import math
import networkx as nx
from ai.graph.pathfinder import lift_to_distance, annotate_distance_weights, GraphPathfinder

def test_lift_to_distance_valid():
    assert lift_to_distance(2.0) == 0.5
    assert lift_to_distance(4.0) == 0.25
    assert lift_to_distance(1.0) == 1.0

def test_lift_to_distance_invalid():
    with pytest.raises(ValueError):
        lift_to_distance(0.0)
    with pytest.raises(ValueError):
        lift_to_distance(-1.5)
    with pytest.raises(ValueError):
        lift_to_distance(float("nan"))
    with pytest.raises(ValueError):
        lift_to_distance(float("inf"))
    with pytest.raises(ValueError):
        lift_to_distance("invalid")

def test_competing_paths_weighted_vs_unweighted():
    """
    Construct a competing paths test:
    Node A -> Node C directly with Lift = 1.2 (Distance = 1/1.2 = 0.833) [1 hop, distance 0.833]
    Node A -> Node B with Lift = 5.0 (Distance = 0.20)
    Node B -> Node C with Lift = 5.0 (Distance = 0.20) [2 hops, total distance 0.40]

    Expected:
    - Unweighted BFS must select the 1-hop path [A -> C] (hops=1, distance=0.833).
    - Weighted Dijkstra must select the 2-hop path [A -> B -> C] (hops=2, distance=0.40).
    """
    A = nx.Graph()
    G = nx.DiGraph()

    for node_id in ["A", "B", "C"]:
        G.add_node(node_id, label=f"Label_{node_id}")

    A.add_edge("A", "C", lift=1.2, count=3)
    A.add_edge("A", "B", lift=5.0, count=10)
    A.add_edge("B", "C", lift=5.0, count=10)

    pf = GraphPathfinder(A, G)

    # 1. Test Unweighted
    unweighted_res = pf.find_path("Label_A", "Label_C", algorithm="unweighted")
    assert unweighted_res["found"] is True
    assert unweighted_res["hops"] == 1
    assert unweighted_res["path"] == ["Label_A", "Label_C"]
    assert unweighted_res["algorithm"] == "unweighted"

    # 2. Test Weighted (Inverse Lift)
    weighted_res = pf.find_path("Label_A", "Label_C", algorithm="weighted_inverse_lift")
    assert weighted_res["found"] is True
    assert weighted_res["hops"] == 2
    assert weighted_res["path"] == ["Label_A", "Label_B", "Label_C"]
    assert weighted_res["algorithm"] == "weighted_inverse_lift"
    assert weighted_res["total_distance"] == 0.40

def test_disconnected_and_missing_nodes():
    A = nx.Graph()
    G = nx.DiGraph()
    A.add_node("X")
    A.add_node("Y")
    G.add_node("X", label="Label_X")
    G.add_node("Y", label="Label_Y")

    pf = GraphPathfinder(A, G)

    # Disconnected nodes
    res = pf.find_path("Label_X", "Label_Y")
    assert res["found"] is False
    assert "No path exists" in res["message"]

    # Missing node
    res_missing = pf.find_path("Label_X", "NonExistent")
    assert res_missing["found"] is False
    assert "not found" in res_missing["message"]

def test_api_pathfinder_endpoint():
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)

    # Test default (unweighted)
    r1 = client.post("/api/v1/graph/paths", json={
        "source": "Mutual Fund",
        "target": "Safe Investment",
        "max_depth": 3
    })
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["found"] is True
    assert d1["algorithm"] == "unweighted"
    assert "distance" in d1["edges"][0]

    # Test explicit weighted_inverse_lift
    r2 = client.post("/api/v1/graph/paths", json={
        "source": "Mutual Fund",
        "target": "Safe Investment",
        "max_depth": 3,
        "algorithm": "weighted_inverse_lift"
    })
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["found"] is True
    assert d2["algorithm"] == "weighted_inverse_lift"
    assert d2["total_distance"] > 0

