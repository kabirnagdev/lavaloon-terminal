# Lavaloon Terminal — System Feature Documentation

Lavaloon Terminal is a data-first financial workstation driven by a single audited data layer.

### Core Workstations
1. **Dashboard**: Cross-sectional performance master table, real-time time-series trends (Apple, NVIDIA, Microsoft), and key corporate indicators.
2. **Company**: Comprehensive corporate dossier, historical revenue trajectory, business segment revenue breakdown, and audited balance sheet metrics.
3. **Financials & Compare**: Side-by-side statement matrix with currency isolation (USD vs INR Crores) and benchmark FX normalization (`1 USD = 84.50 INR`).
4. **Ask the Data**: Natural-language query interface grounded in raw filings with exact row citations (`source_file`, `source_row`, `period`) and zero-hallucination refusal.
5. **Report Export**: Audited diligence memo generation with one-click Markdown (`.md`) and printable PDF export.

### Data Layer
- **Raw Layer (`data/raw/`)**: Master editable CSVs (`company_financials.csv`, `company_segments.csv`) and raw SEC Form 10-K / BSE filings.
- **Clean Layer (`data/clean/`)**: Normalized canonical records (`financials_clean.json`, `segments_clean.json`, `companies_clean.json`).
- **Data Service (`getSeries`)**: The single trusted function through which all charts, tables, and screens query data.
- **Validator**: Automated accounting integrity check enforcing zero duplicates, currency isolation, and financial identities ($FCF = OCF - \text{CapEx}$, $\text{Gross Profit} \le \text{Revenue}$).
