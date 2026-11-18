# Lavaloon Terminal

<img width="735" height="420" alt="Lavaloon Terminal" src="https://github.com/user-attachments/assets/e6c75473-627a-4ac9-8640-995a97c4bb5c" />

Beyond Traditional RAG. Combining vector similarity, entity relationships and graph traversal to retrieve connected financial insights.

## 2. Architecture & Data Flow


<img width="1024" height="507" alt="GraphRAG Architecture" src="https://github.com/user-attachments/assets/0ffb34b6-4748-47b3-a8c3-fda5178e5e52" />

### Retrieval & Query Flow
<img width="1312" height="1199" alt="Query Flow" src="https://github.com/user-attachments/assets/c817aa4d-c2db-4de5-862b-cb8fd6fa19b8" />

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
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Suite
```bash
pytest tests/
```
Runs 25 automated tests covering metrics formulas, data loader, accounting validator, Black-Scholes benchmark cases, and 10 grounded test questions.

---


## 6. Known Limits

1. **Historical Period Depth**: Detailed multi-statement historical breakdowns cover FY2022 to FY2025/FY2026. Prior fiscal years require populating older 10-K filings into `data/raw/`.
2. **Static FX Rate**: Currency conversion defaults to a benchmark rate of `1 USD = 84.50 INR`. Real-time FX feeds can be plugged into `normalize_currency()`.
3. **Scope of Coverage**: Currently configured for 10 premier US and Indian blue-chips. Additional companies can be added by appending rows to `data/raw/company_financials.csv`.

---

**Authors:** [Kabir Nagdev](https://github.com/kabirnagdev), [Ayush Gupta](https://github.com/ayuzzgupta)
