import pytest
from unittest.mock import MagicMock, patch
import networkx as nx
from ai.adapters.neo4j_adapter import Neo4jAdapter
from backend.app.main import app
from fastapi.testclient import TestClient

def test_neo4j_adapter_unconfigured_offline():
    adapter = Neo4jAdapter(uri="", user="", password="")
    assert adapter.is_connected is False
    health = adapter.health_check()
    assert health["connected"] is False
    assert health["status"] == "offline"

    # Test sync in offline mode
    G = nx.DiGraph()
    G.add_node("test_node", ntype="Entity", label="Test Entity")
    sync_res = adapter.sync_from_networkx(G)
    assert sync_res["status"] == "neo4j_not_connected"
    assert sync_res["synced_nodes"] == 0

def test_neo4j_adapter_connection_error_handling():
    # Attempt connection with invalid port/host
    adapter = Neo4jAdapter(uri="bolt://127.0.0.1:9999", user="neo4j", password="bad_password")
    assert adapter.is_connected is False
    res = adapter.query("MATCH (n) RETURN n")
    assert res == []

def test_neo4j_mocked_sync_cypher_pipeline():
    """Verify that Cypher statements, UNWIND batches, and schema constraints are properly executed."""
    mock_session = MagicMock()
    mock_driver = MagicMock()
    mock_driver.session.return_value.__enter__.return_value = mock_session

    with patch("ai.adapters.neo4j_adapter.Neo4jAdapter._init_driver") as mock_init:
        adapter = Neo4jAdapter(uri="bolt://localhost:7687", user="neo4j", password="password")
        adapter._driver = mock_driver
        adapter._connected = True

        G = nx.DiGraph()
        G.add_node("e1", ntype="Entity", label="Mutual_Funds: 1", col="Mutual_Funds", value="1")
        G.add_node("r1", ntype="Record", label="Record 1", text="Sample record text", row=1)
        G.add_edge("r1", "e1", predicate="Mutual_Funds", lift=2.5, count=5)

        sync_res = adapter.sync_from_networkx(G)

        assert sync_res["status"] == "synchronized"
        assert sync_res["synced_nodes"] == 2
        assert sync_res["synced_edges"] == 1

        # Verify that constraint and UNWIND queries were submitted to session.run
        calls = [c[0][0] for c in mock_session.run.call_args_list]
        assert any("CREATE CONSTRAINT" in str(c) for c in calls)
        assert any("UNWIND $batch AS item" in str(c) for c in calls)

def test_health_api_exposes_graph_backend():
    client = TestClient(app)
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert "graph_backend" in data
    assert "neo4j_connected" in data
    assert isinstance(data["neo4j_connected"], bool)

