# API Specification — Financial Intelligence Terminal

Base URL: `/api/v1`

## System & Health
- `GET /api/v1/health`
  - Returns backend health, version, loaded dataset size, graph nodes/edges count, and embedding backend status.

## Companies & Entities
- `GET /api/v1/companies`
  - Returns list of tracked financial entities, investment avenues, and corporate benchmarks.
- `GET /api/v1/companies/{company_id}`
  - Returns detailed profile, classification, metrics, and risk tier for the entity.
- `GET /api/v1/companies/{company_id}/financials`
  - Returns financial breakdown, metrics, reporting period, and data source citations.
- `GET /api/v1/companies/{company_id}/relationships`
  - Returns direct ontology neighbors, counterparty connections, and statistical lift associations.

## Knowledge Graph & Ontology
- `GET /api/v1/graph/overview`
  - Returns summary topology of the knowledge graph (node count, edge count, top entities by degree).
- `GET /api/v1/graph/cytoscape`
  - Returns Cytoscape.js compatible JSON payload `{ elements: { nodes: [...], edges: [...] } }` with category styling, lift weights, and filter metadata.
- `GET /api/v1/graph/entity/{entity_id}`
  - Returns entity details, incident edges, statistics, and connected record count.
- `GET /api/v1/graph/paths`
  - Query parameters: `source`, `target`, `max_depth` (default: 3). Finds shortest association paths between two financial concepts.

## GraphRAG Research Copilot
- `POST /api/v1/research/query`
  - Body: `{ question: string, hops: int, mode: "graph_rag" | "tree_of_thought" | "plain_rag" }`
  - Returns: `{ answer: string, keywords: string[], seeds: string[], triples: object[], records: string[], statistics: string, latency_ms: float }`
- `GET /api/v1/research/suggested-questions`
  - Returns curated institutional prompt templates for due diligence.

## Company Due Diligence
- `POST /api/v1/diligence/analyze`
  - Body: `{ target_id: string, scope: string[] }`
  - Returns comprehensive 8-section due diligence report with verified facts, statistical indicators, inferred risks, and graph provenance.

## Quantitative Analytics (Black-Scholes & Greeks)
- `POST /api/v1/quant/black-scholes`
  - Body: `{ S: float, K: float, T_days: float, r: float, sigma: float, option_type: "call" | "put" }`
  - Returns calculated price, full Greeks ($\Delta, \Gamma, \nu, \Theta, \rho$), and parameter sensitivity.
- `POST /api/v1/quant/options-chain`
  - Computes complete multi-strike options pricing and Greeks table.

