# Lavaloon Terminal — Institutional Figma UI Assets

This directory contains complete Figma vector assets and an automated Figma Plugin script to recreate the entire 8-module **Lavaloon Financial Intelligence Workstation** inside Figma.

---

## Method 1: Instant Drag & Drop (Zero Setup)
You can directly drag and drop the vector SVG files into any open Figma canvas:

1. Open **Figma** (Desktop App or Web Browser at [figma.com](https://figma.com)).
2. Create a new empty Design file.
3. Open your file manager and go to:
   `lavaloon-terminal/figma_export/svgs/`
4. Select all 8 `.svg` files and **drag & drop them directly onto your Figma canvas**:
   - `01_overview_dashboard.svg` — Overview Dashboard & Market Status Strip
   - `02_entity_explorer.svg` — 3-Region Palantir Dossier (Corporates & Survey Avenues)
   - `03_financial_intelligence.svg` — Comparative Multi-Statement Table & Segments
   - `04_knowledge_graph.svg` — Palantir-style Dark Ontology Explorer with Pathfinder
   - `05_graphrag_copilot.svg` — Multi-Hop BFS Research Console & Evidence Inspector
   - `06_due_diligence.svg` — Audited SEC 10-K Due Diligence Dossier & Risk Radar
   - `07_options_desk.svg` — Black-Scholes Quant Derivatives Desk & Greeks Matrix
   - `08_system_config.svg` — System Architecture Telemetry & Integrity Diagnostics

> **Tip:** Figma will instantly parse every layer, vector path, rectangle, and typography block into fully editable native Figma layers and frames!

---

## Method 2: Native Figma Plugin Generator
If you prefer running a script to generate organized autolayout frames:

1. In Figma, open the top menu: **Plugins** &#8594; **Development** &#8594; **Import plugin from manifest...**
2. Select the file:
   `lavaloon-terminal/figma_export/figma_plugin/manifest.json`
3. Click **Run Plugin**.
4. The plugin will programmatically construct all 8 1440x900 frames side-by-side with exact terminal color variables (`#080b11`, `#0c1017`, `#111622`, `#1a2234`, `#38bdf8`, `#2dd4bf`).
