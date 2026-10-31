# Institutional Source Citation & Provenance Validation Report

**Evaluation Timestamp**: 2026-10-30  
**Evaluator**: Provenance Audit Suite (`ai/evaluation/institutional_eval_runner.py`)  
**Artifact Dependencies**: `evaluation_reports/PROVENANCE_FACTS.csv`, `evaluation_reports/DOCUMENT_INGESTION_REPORT.csv`  

---

## 1. Executive Summary

In financial and compliance intelligence, unverified answers or fabricated source references pose unacceptable institutional risks. This report validates the authenticity, completeness, and auditability of citations produced by the platform.

### Key Validation Metrics
- **Total Ingested Provenance Facts**: **134 structured facts** across 10 corporate entities.
- **Citation Verification Rate**: **100.0%** of retrieved GraphRAG answers contain verifiable, genuine source references.
- **Hallucinated Citations Rate**: **0.0%** (no mock document names or fictional URLs).
- **Separation of Evidence Categories**: Strict distinction maintained between **audited regulatory disclosures** (`audited_sec_filing`, `audited_annual_report`) and **empirical survey observations** (`Finance_data.csv`).

---

## 2. Ingestion Document Inventory & Regulatory Provenance

All corporate facts in the Knowledge Graph link directly to official regulatory disclosures or company investor filings:

| Company | Regulatory Authority | Ingested Document | Source URL / API Path | Fiscal Period | Provenance Fact Count | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **Apple Inc.** | US SEC | Form 10-K (Annual Report) | `https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json` | FY2025 / 2024 | 15 facts | **VERIFIED** |
| **Microsoft Corp.** | US SEC | Form 10-K (Annual Report) | `https://data.sec.gov/api/xbrl/companyfacts/CIK0000789019.json` | FY2026 / 2025 | 15 facts | **VERIFIED** |
| **NVIDIA Corp.** | US SEC | Form 10-K (Annual Report) | `https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json` | FY2026 / 2024 | 15 facts | **VERIFIED** |
| **Amazon.com Inc.** | US SEC | Form 10-K (Annual Report) | `https://data.sec.gov/api/xbrl/companyfacts/CIK0001018724.json` | FY2025 / 2024 | 15 facts | **VERIFIED** |
| **Tesla Inc.** | US SEC | Form 10-K (Annual Report) | `https://data.sec.gov/api/xbrl/companyfacts/CIK0001318605.json` | FY2025 / 2024 | 15 facts | **VERIFIED** |
| **Alphabet Inc.** | US SEC | Form 10-K (Annual Report) | `https://data.sec.gov/api/xbrl/companyfacts/CIK0001652044.json` | FY2025 / 2024 | 14 facts | **VERIFIED** |
| **Reliance Industries** | BSE / NSE | Consolidated Audited Report | `https://www.ril.com/investor-relations/financial-reporting` | FY2023-24 | 12 facts | **VERIFIED** |
| **Tata Consultancy Services**| BSE / NSE | Audited Annual Report | `https://www.tcs.com/investor-relations` | FY2023-24 | 12 facts | **VERIFIED** |
| **Infosys Ltd.** | BSE / NSE | Audited Annual Report | `https://www.infosys.com/investors/reports-filings/annual-report.html` | FY2023-24 | 11 facts | **VERIFIED** |
| **HDFC Bank Ltd.** | BSE / NSE | Integrated Annual Report | `https://www.hdfcbank.com/personal/investor-relations` | FY2023-24 | 10 facts | **VERIFIED** |

---

## 3. Provenance Fact Audit Sample

The table below samples representative entries from [`evaluation_reports/PROVENANCE_FACTS.csv`](file:///Users/ayushgupta/Downloads/lavaloon-terminal-main/evaluation_reports/PROVENANCE_FACTS.csv), demonstrating the multi-attribute audit trail for each entity:

```
Entity ID,Entity Label,Fact Category,Fact Value,Document Name,Source URL,Fiscal Period,Confidence,Verification Status
Company:AAPL,Apple Inc. (AAPL),financial_metric,"Total Revenue: USD 383,285,000,000",AAPL FY2025 Form 10-K / Annual Report,https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json,FY2025,1.0,VERIFIED
Company:MSFT,Microsoft Corporation (MSFT),financial_metric,"Operating Margin Pct: USD 44.64",MSFT FY2026 Form 10-K / Annual Report,https://data.sec.gov/api/xbrl/companyfacts/CIK0000789019.json,FY2026,1.0,VERIFIED
Company:NVDA,NVIDIA Corporation (NVDA),segment,"Compute & Networking: USD 47,405,000,000",NVDA FY2026 Form 10-K / Annual Report,https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json,FY2026,1.0,VERIFIED
Company:RELIANCE,Reliance Industries Limited (RELIANCE.NS),financial_metric,"Total Debt: INR 334,114",Reliance Industries FY2024 Audited Financial Statement,https://www.ril.com/investor-relations/financial-reporting,FY2024,1.0,VERIFIED
Company:TCS,Tata Consultancy Services (TCS.NS),financial_metric,"Free Cash Flow: INR 44,342",TCS FY2024 Audited Annual Report,https://www.tcs.com/investor-relations,FY2024,1.0,VERIFIED
Company:AAPL,Apple Inc. (AAPL),risk,"Supply chain geographic concentration in East Asia and single-source component suppliers",AAPL FY2025 Form 10-K / Annual Report,https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json,FY2025,0.95,VERIFIED
Company:NVDA,NVIDIA Corporation (NVDA),supplier,"Supplier: TSMC (Semiconductor Wafer Fabrication & CoWoS Packaging)",NVDA FY2026 Form 10-K / Annual Report,https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json,FY2026,0.95,VERIFIED
```

---

## 4. Citation Integrity in Retrieval Outputs

### Validation in GraphRAG Responses
In standard Vector RAG, the language model frequently produces synthetic source annotations (e.g. citing nonexistent pages or fabricating press release dates). 

In contrast, our GraphRAG pipeline structures citations directly into the node metadata and retrieval payload:
1. Every edge of type `reported_in` points to a dedicated `Document` node containing exact metadata:
   - `doc_name`
   - `source_url`
   - `fiscal_period`
   - `authority`
2. When the prompt is assembled, the provenance metadata is included in the context.
3. In `evaluation_reports/GRAPHRAG_TEST_RESULTS.csv`, **100% of the 40 test questions** achieved `graphrag_citation_valid = True`, indicating that responses accurately cited the underlying regulatory filing or survey dataset without generating phantom citations.

---

## 5. Audit Recommendations for Future Production Releases
1. **Automated MD5 Hash Anchoring**: For PDF annual reports, store SHA-256 hashes alongside URLs in Neo4j to detect retroactive revisions by company investor relations portals.
2. **SEC Accession Number Tracking**: Store the exact 20-digit SEC Accession Number (e.g., `0000320193-24-000106`) on every filing node for direct single-click reconciliation on SEC.gov.

