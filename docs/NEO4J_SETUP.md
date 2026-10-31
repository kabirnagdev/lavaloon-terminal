# Enterprise Neo4j Integration & Migration Guide

## 1. Overview & Dual Backend Strategy

The platform provides a **dual graph backend architecture**:
1. **NetworkX In-Memory (Default)**: Zero external dependency, instantaneous startup, ideal for local research and development.
2. **Neo4j Enterprise Mode**: Full Cypher query engine, graph persistence across restarts, schema indexing, and distributed graph query capabilities.

Configuration is governed by the environment variable:
```env
GRAPH_BACKEND=NETWORKX  # or NEO4J
```

When `GRAPH_BACKEND=NEO4J` is active, the backend attempts to connect to the configured Neo4j instance. If connection fails or times out, the backend **gracefully falls back to NetworkX in-memory mode**, ensuring 100% API uptime.

---

## 2. Local Neo4j Setup (Docker)

To spin up a local persistent Neo4j Community instance:

```bash
docker run -d \
  --name terminal-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/financial_secret_2026 \
  -v neo4j_data:/data \
  neo4j:5-community
```

Once running:
- **Neo4j Browser UI**: `http://localhost:7474`
- **Bolt Protocol Port**: `bolt://localhost:7687`
- **Username**: `neo4j`
- **Password**: `financial_secret_2026`

---

## 3. Environment Configuration

Add the following to your `.env` file:

```env
GRAPH_BACKEND=NEO4J
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=financial_secret_2026
```

Restart the FastAPI backend service:
```bash
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. Automatic Schema & Synchronization

Upon startup in Neo4j mode, `Neo4jAdapter` executes:
1. **Uniqueness Constraints**:
   ```cypher
   CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;
   CREATE CONSTRAINT IF NOT EXISTS FOR (r:Record) REQUIRE r.id IS UNIQUE;
   ```
2. **Property Indexes**:
   ```cypher
   CREATE INDEX IF NOT EXISTS FOR (e:Entity) ON (e.label);
   CREATE INDEX IF NOT EXISTS FOR (e:Entity) ON (e.col);
   CREATE INDEX IF NOT EXISTS FOR (e:Entity) ON (e.value);
   ```
3. **Batch UNWIND Synchronization**:
   Entities, Records, and statistical association edges are merged in chunks of 200 items.

---

## 5. Verification & Health Check

Query the health endpoint:
```bash
curl http://localhost:8000/api/v1/health
```
Expected response:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "records_count": 40,
  "graph_nodes": 147,
  "graph_edges": 1144,
  "association_edges": 184,
  "embedding_backend": "all-MiniLM-L6-v2",
  "graph_backend": "NEO4J",
  "neo4j_connected": true
}
```

