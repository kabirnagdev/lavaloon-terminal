# Lavaloon Terminal

A clean, data-first financial workstation for analyzing company fundamentals, comparing financial statements, and conducting grounded research on regulatory filings.

---

## 1. What It Does

Lavaloon Terminal provides 5 core workstations:
1. **Dashboard**: Cross-sectional performance overview, verified filings table, and time-series trends.
2. **Company**: Detailed corporate dossiers, revenue history, business segment breakdowns, and balance sheet metrics.
3. **Financials & Compare**: Side-by-side statement comparison with currency isolation and stated FX conversion (`1 USD = 84.50 INR`).
4. **Ask the Data**: Natural-language question answering grounded in raw filings with exact row citations and missing-data refusal.
5. **Report Export**: Assembles audited diligence memos with one-click Markdown (`.md`) and PDF export.

Every chart, table, and number in the application is strictly driven by the **Data Layer** through `getSeries(company, metric, periodRange)`. No numbers are typed into UI components.

---

## 2. Data Sources & Architecture

All data flows strictly from raw filings to clean normalized JSON:
```
data/
├── raw/
│   ├── company_financials.csv              <-- Master editable raw CSV (396 rows)
│   ├── company_segments.csv                <-- Segment revenue breakdown (42 rows)
│   ├── verified_corporate_financials.json  <-- SEC & BSE filings metadata
│   └── sec_edgar/                          <-- Raw SEC Form 10-K filings
└── clean/
    ├── financials_clean.json               <-- Canonical normalized records
    ├── segments_clean.json                 <-- Segment breakdowns
    └── companies_clean.json                <-- Clean company metadata
```

- **US Corporations**: Apple (AAPL), Microsoft (MSFT), NVIDIA (NVDA), Amazon (AMZN), Tesla (TSLA), Alphabet (GOOGL) — sourced directly from **SEC Form 10-K** filings.
- **Indian Corporations**: Reliance Industries (RELIANCE), TCS (TCS), Infosys (INFY), HDFC Bank (HDFCBANK) — sourced from **BSE Audited Financial Reports**.

---

## 3. How to Refresh Data

Editing any number in the raw CSV immediately propagates across the entire terminal:

1. **Edit raw data**:
   Open `data/raw/company_financials.csv` and modify any value.
2. **Run the Loader**:
   ```bash
   python3 scripts/load_data.py
   ```
3. **Run the Validator**:
   ```bash
   python3 scripts/validate_data.py
   ```
   Checks for duplicates, missing periods, mixed units, negative revenues, and accounting totals mismatches.
4. **Verify Propagation**:
   ```bash
   python3 scripts/verify_chart_points.py
   ```

---

## 4. Running the Application

### Backend (FastAPI)
```bash
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Suite
```bash
pytest tests/
```
Runs 25 automated tests covering metrics formulas, data loader, accounting validator, Black-Scholes benchmark cases, and 10 grounded test questions.

---

## 5. 5-Minute Demo Script

1. **Verify Live Data (Dashboard)**:
   - Open `http://localhost:3000`.
   - Point out the 3 revenue and margin charts (Apple, NVIDIA, Microsoft).
   - Show the Audited Filings Master Table. Notice all numbers are right-aligned tabular figures with source citations.
2. **Change CSV Value & Prove Live Propagation**:
   - Open `data/raw/company_financials.csv` in terminal or editor.
   - Edit Apple FY2025 revenue (e.g. change to `425000000000`).
   - Run `python3 scripts/load_data.py`.
   - Refresh the dashboard: the chart and table immediately reflect `$425.00B` without touching any UI code!
   - Restore the audited figure (`416161000000`) and rerun loader.
3. **Inspect Segments & Fundamentals (Company)**:
   - Click "Company" in the sidebar. Select **Apple Inc.**
   - Show the Business Segment Revenue Split (iPhone, Services, Wearables, Mac, iPad).
   - Point out that segment totals reconcile with reported total revenue.
4. **Compare Across Currencies (Financials & Compare)**:
   - Click "Financials & Compare". Select **AAPL** vs **RELIANCE**.
   - Show the Currency selector:
     - `Native`: AAPL in USD, RELIANCE in INR Crores.
     - `USD Normal`: Reliance normalized to USD at stated rate `1 USD = 84.50 INR`.
     - `INR Normal`: Apple normalized to INR Crores at stated rate.
5. **Ask the Data (Grounded QA)**:
   - Click "Ask the data".
   - Click the suggested question: *"What was Apple's total revenue and net income in FY2025?"*
   - Show the answer with row-level provenance (`source_file`, `source_row`, `period`).
   - Ask an unanswerable question (e.g. *"What is Ferrari's quarterly dividend?"*): notice the refusal *"Not available in provided data."* (Zero hallucination).
6. **Export Diligence Memo (Report Export)**:
   - Click "Report Export".
   - Click "Markdown" to download `Report_AAPL_FY2025.md` or "Print / PDF" to print.

---

## 6. Known Limits

1. **Historical Period Depth**: Detailed multi-statement historical breakdowns cover FY2022 to FY2025/FY2026. Prior fiscal years require populating older 10-K filings into `data/raw/`.
2. **Static FX Rate**: Currency conversion defaults to a benchmark rate of `1 USD = 84.50 INR`. Real-time FX feeds can be plugged into `normalize_currency()`.
3. **Scope of Coverage**: Currently configured for 10 premier US and Indian blue-chips. Additional companies can be added by appending rows to `data/raw/company_financials.csv`.
