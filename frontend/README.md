# Financial Intelligence Terminal — Frontend

Institutional-grade financial workstation built with **Next.js 14**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Cytoscape.js**.

## Core Features
- **High-Density Terminal Layout**: Inspired by Bloomberg Terminal (#070b12 dark theme, monospace numbers, thin borders, live telemetry).
- **Palantir Ontology Graph**: Interactive Cytoscape.js canvas with pan, zoom, min-lift filtering, degree-weighted nodes, shortest pathfinding, and contextual intelligence inspector.
- **GraphRAG Research Copilot**: Multi-mode inquiry (Graph RAG, Tree-of-Thought, Plain RAG) with triples inspector, exact dataset distribution metrics, and cited survey observations.
- **Due Diligence Dossier**: 8-section institutional executive assessment with verified baseline facts vs analytical limitations separation and printable layout.
- **Quantitative Derivatives Desk**: Black-Scholes European call/put calculator, Greeks ($\Delta, \Gamma, \nu, \Theta, \rho$), and multi-strike options chain.

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open `http://localhost:3000` in your browser.
Configure backend endpoint in `.env.local` if running outside localhost:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

