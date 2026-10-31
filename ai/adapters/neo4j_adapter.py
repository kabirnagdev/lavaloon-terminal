import os
import time
from typing import Dict, Any, List, Optional
import networkx as nx

class Neo4jAdapter:
    """
    Enterprise Neo4j database adapter with:
    - Connection pooling & health checks
    - Batch-parameterized UNWIND synchronization
    - Schema constraints and composite property indexes
    - Parameterized Cypher query execution
    - Graceful non-blocking offline fallback
    """

    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None
    ):
        self.uri = uri or os.getenv("NEO4J_URI", "")
        self.user = user or os.getenv("NEO4J_USER", "neo4j")
        self.password = password or os.getenv("NEO4J_PASSWORD", "")
        self._driver = None
        self._connected = False
        self._init_driver()

    def _init_driver(self):
        if not self.uri or not self.password:
            self._connected = False
            return
        try:
            from neo4j import GraphDatabase
            self._driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
                max_connection_lifetime=3600,
                max_connection_pool_size=50,
                connection_acquisition_timeout=5.0
            )
            # Test connectivity
            with self._driver.session() as session:
                session.run("RETURN 1 AS ping")
            self._connected = True
        except Exception as e:
            self._connected = False
            self._driver = None

    @property
    def is_connected(self) -> bool:
        return self._connected

    def health_check(self) -> Dict[str, Any]:
        """Perform active database health check."""
        if not self._connected or not self._driver:
            return {"status": "offline", "connected": False, "latency_ms": 0.0}
        t0 = time.time()
        try:
            with self._driver.session() as session:
                res = session.run("RETURN 1 AS ping").single()
                latency = (time.time() - t0) * 1000.0
                return {
                    "status": "online",
                    "connected": True,
                    "latency_ms": round(latency, 2)
                }
        except Exception as e:
            self._connected = False
            return {"status": "error", "connected": False, "error": str(e), "latency_ms": 0.0}

    def init_schema(self) -> List[str]:
        """Ensure enterprise constraints and indexes are established."""
        if not self._connected or not self._driver:
            return []

        queries = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (r:Record) REQUIRE r.id IS UNIQUE",
            "CREATE INDEX IF NOT EXISTS FOR (e:Entity) ON (e.label)",
            "CREATE INDEX IF NOT EXISTS FOR (e:Entity) ON (e.col)",
            "CREATE INDEX IF NOT EXISTS FOR (e:Entity) ON (e.value)"
        ]
        applied = []
        with self._driver.session() as session:
            for q in queries:
                try:
                    session.run(q)
                    applied.append(q)
                except Exception:
                    pass
        return applied

    def sync_from_networkx(self, G: nx.DiGraph, batch_size: int = 200) -> Dict[str, Any]:
        """Batch-synchronize in-memory NetworkX DiGraph nodes and edges to Neo4j."""
        if not self._connected or not self._driver:
            return {"synced_nodes": 0, "synced_edges": 0, "status": "neo4j_not_connected"}

        self.init_schema()

        # 1. Batch Entities
        entity_batch = []
        record_batch = []
        for node, data in G.nodes(data=True):
            if data.get("ntype") == "Record":
                record_batch.append({
                    "id": str(node),
                    "label": str(data.get("label", "")),
                    "text": str(data.get("text", "")),
                    "row": int(data.get("row", 0))
                })
            else:
                entity_batch.append({
                    "id": str(node),
                    "label": str(data.get("label", "")),
                    "col": str(data.get("col", "")),
                    "value": str(data.get("value", ""))
                })

        with self._driver.session() as session:
            # Sync Entity nodes
            if entity_batch:
                session.run(
                    """
                    UNWIND $batch AS item
                    MERGE (e:Entity {id: item.id})
                    SET e.label = item.label, e.col = item.col, e.value = item.value
                    """,
                    batch=entity_batch
                )

            # Sync Record nodes
            if record_batch:
                session.run(
                    """
                    UNWIND $batch AS item
                    MERGE (r:Record {id: item.id})
                    SET r.label = item.label, r.text = item.text, r.row = item.row
                    """,
                    batch=record_batch
                )

            # Sync edges in chunks
            edges_list = []
            for u, v, d in G.edges(data=True):
                edges_list.append({
                    "source": str(u),
                    "target": str(v),
                    "predicate": str(d.get("predicate", "related_to")),
                    "count": int(d.get("count", 1)),
                    "lift": float(d.get("lift", 1.0))
                })

            for i in range(0, len(edges_list), batch_size):
                chunk = edges_list[i : i + batch_size]
                session.run(
                    """
                    UNWIND $batch AS item
                    MATCH (a {id: item.source})
                    MATCH (b {id: item.target})
                    MERGE (a)-[r:ASSOCIATED_WITH {predicate: item.predicate}]->(b)
                    SET r.count = item.count, r.lift = item.lift
                    """,
                    batch=chunk
                )

        return {
            "synced_nodes": len(entity_batch) + len(record_batch),
            "synced_edges": len(edges_list),
            "status": "synchronized"
        }

    def query(self, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Execute parameterized Cypher query."""
        if not self._connected or not self._driver:
            return []
        with self._driver.session() as session:
            result = session.run(cypher, parameters or {})
            return [record.data() for record in result]

    def close(self):
        if self._driver:
            self._driver.close()
            self._connected = False
