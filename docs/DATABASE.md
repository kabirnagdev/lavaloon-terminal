# Database & Ontology Architecture

## 1. Storage Paradigm

The platform utilizes a **hybrid in-memory graph model** optimized for low-latency graph traversals, statistical mining, and semantic vector indexing, coupled with an optional Neo4j connector for persistent enterprise deployments.

### In-Memory Graph Structure (NetworkX DiGraph)
- **Nodes**:
  - `Record`: Represents individual data entries (e.g., survey observation, SEC filing row).
    - Properties: `row_id`, `label`, `text`, `props` (key-value property mappings).
  - `Entity`: Distinct categorical financial attributes.
    - Properties: `col` (origin column/domain), `value`, `label`, `frequency`.
- **Edges**:
  - `Record -> Entity`: Attribute membership labeled by feature name.
  - `Entity <-> Entity`: Undirected association edge weighted by **Statistical Lift** and observation co-occurrence frequency ($n \ge 3, \text{Lift} \ge 1.5$).

### Dual Adapter Architecture: NetworkX & Neo4j
- **Default In-Memory Engine**: Fast, zero-dependency, runs natively without requiring external database processes.
- **Neo4j Enterprise Adapter**: When `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD` environment variables are populated, the backend provides Cypher query capabilities and schema synchronizer:
  ```cypher
  CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;
  CREATE CONSTRAINT IF NOT EXISTS FOR (r:Record) REQUIRE r.id IS UNIQUE;
  ```

### RDF / Turtle Semantic Serialization
For semantic web exports, the engine translates the graph into W3C RDF standard format (`FIN` namespace: `http://example.org/finance/`):
- `fin:Record`
- `fin:associated_with`
- Serialized to `data/finance_kg.ttl`

