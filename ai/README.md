# AI & GraphRAG Module

This package implements the core algorithmic intelligence:
- `ingestion/`: CSV parsing, entity column identification, row serialization
- `graph/`: In-memory NetworkX knowledge graph construction with pair co-occurrence and statistical lift calculation
- `retrieval/`: Hybrid GraphRAG retriever combining Sentence-Transformers / Hashing embeddings, multi-hop BFS graph traversal, and dynamic statistical profiling
- `reasoning/`: Groq LLM client with token rate-limiting window, model rotation, and Tree-of-Thought (ToT) multi-step reasoning
- `quant/`: Black-Scholes analytical options pricing, Greeks, Newton-Raphson implied volatility solver, and options chain calculator
- `pipelines/`: End-to-end institutional research and due-diligence report generation
- `adapters/`: Dual backend support (NetworkX in-memory default + enterprise Neo4j adapter)

