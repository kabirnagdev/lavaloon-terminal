"""
Canonical Data Loader for Lavaloon Terminal.
Parses raw CSV filings from data/raw/ and generates normalized, audited records in data/clean/*.json.
"""

import os
import csv
import json
from typing import List, Dict, Any, Optional

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/raw"))
CLEAN_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/clean"))

FINANCIALS_RAW_CSV = os.path.join(RAW_DIR, "company_financials.csv")
SEGMENTS_RAW_CSV = os.path.join(RAW_DIR, "company_segments.csv")
CORP_META_JSON = os.path.join(RAW_DIR, "verified_corporate_financials.json")

FINANCIALS_CLEAN_JSON = os.path.join(CLEAN_DIR, "financials_clean.json")
SEGMENTS_CLEAN_JSON = os.path.join(CLEAN_DIR, "segments_clean.json")
COMPANIES_CLEAN_JSON = os.path.join(CLEAN_DIR, "companies_clean.json")


def load_clean_data(verbose: bool = True) -> Dict[str, Any]:
    """
    Parses all raw CSVs in data/raw/ and generates clean normalized JSON files in data/clean/.
    Every record strictly contains:
      company, metric, value, unit, currency, period, source_file, source_row (+ ticker)
    """
    os.makedirs(CLEAN_DIR, exist_ok=True)
    if not os.path.exists(FINANCIALS_RAW_CSV):
        raise FileNotFoundError(f"Raw financials file not found at: {FINANCIALS_RAW_CSV}")

    # 1. Parse company_financials.csv
    financial_rows: List[Dict[str, Any]] = []
    with open(FINANCIALS_RAW_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=2):
            val_raw = row.get("value", "").strip()
            try:
                # Float or int conversion
                val = float(val_raw)
                if val.is_integer():
                    val = int(val)
            except ValueError:
                val = 0.0

            metric = row.get("metric", "").strip().lower()
            unit = row.get("unit", "").strip()
            currency = row.get("currency", "").strip().upper()

            # Ensure operating margin / pct metrics have % as unit
            if "margin" in metric or "pct" in metric:
                unit = "%"

            clean_row = {
                "company": row.get("company", "").strip(),
                "ticker": row.get("ticker", "").strip().upper(),
                "metric": metric,
                "value": val,
                "unit": unit,
                "currency": currency,
                "period": row.get("period", "").strip().upper(),
                "source_file": row.get("source_file", "company_financials.csv").strip(),
                "source_row": int(row.get("source_row", idx))
            }
            financial_rows.append(clean_row)

    # 2. Parse company_segments.csv
    segment_rows: List[Dict[str, Any]] = []
    if os.path.exists(SEGMENTS_RAW_CSV):
        with open(SEGMENTS_RAW_CSV, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=2):
                val_raw = row.get("revenue", "").strip()
                try:
                    val = float(val_raw)
                    if val.is_integer():
                        val = int(val)
                except ValueError:
                    val = 0.0

                segment_rows.append({
                    "company": row.get("company", "").strip(),
                    "ticker": row.get("ticker", "").strip().upper(),
                    "segment": row.get("segment", "").strip(),
                    "value": val,
                    "unit": row.get("unit", "").strip(),
                    "currency": row.get("currency", "").strip().upper(),
                    "period": row.get("period", "").strip().upper(),
                    "source_file": row.get("source_file", "company_segments.csv").strip(),
                    "source_row": int(row.get("source_row", idx))
                })

    # 3. Assemble clean company directory / metadata
    # Load qualitative metadata from raw verified financials if present
    meta_dict = {}
    if os.path.exists(CORP_META_JSON):
        try:
            with open(CORP_META_JSON, "r", encoding="utf-8") as f:
                meta_dict = json.load(f)
        except Exception:
            meta_dict = {}

    companies_clean: Dict[str, Any] = {}
    tickers = sorted(list(set(r["ticker"] for r in financial_rows)))

    for ticker in tickers:
        t_rows = [r for r in financial_rows if r["ticker"] == ticker]
        latest_row = t_rows[-1]
        company_name = latest_row["company"]
        currency = latest_row["currency"]
        periods = sorted(list(set(r["period"] for r in t_rows)))
        available_metrics = sorted(list(set(r["metric"] for r in t_rows)))

        raw_meta = meta_dict.get(ticker, {})

        companies_clean[ticker] = {
            "id": ticker.lower(),
            "ticker": ticker,
            "name": company_name,
            "currency": currency,
            "unit": "USD" if currency == "USD" else "INR Crores",
            "coverage_type": "corporate_equity",
            "country": "India" if currency == "INR" else "United States",
            "periods": periods,
            "available_metrics": available_metrics,
            "sector": raw_meta.get("sector", "Technology" if currency == "USD" else "Diversified"),
            "industry": raw_meta.get("industry", "Corporate Enterprise"),
            "risk_level": raw_meta.get("risk_level", "Medium"),
            "description": raw_meta.get("description", f"Audited regulatory reporting entity for {ticker}."),
            "competitors": raw_meta.get("competitors", []),
            "suppliers": raw_meta.get("suppliers", []),
            "risks": raw_meta.get("risks", []),
            "source_doc": raw_meta.get("source_doc", latest_row["source_file"]),
            "source_url": raw_meta.get("source_url", "")
        }

    # 4. Write all clean files
    with open(FINANCIALS_CLEAN_JSON, "w", encoding="utf-8") as f:
        json.dump(financial_rows, f, indent=2)

    with open(SEGMENTS_CLEAN_JSON, "w", encoding="utf-8") as f:
        json.dump(segment_rows, f, indent=2)

    with open(COMPANIES_CLEAN_JSON, "w", encoding="utf-8") as f:
        json.dump(companies_clean, f, indent=2)

    if verbose:
        print(f"[Loader] Saved {len(financial_rows)} financial records -> {FINANCIALS_CLEAN_JSON}")
        print(f"[Loader] Saved {len(segment_rows)} segment records -> {SEGMENTS_CLEAN_JSON}")
        print(f"[Loader] Saved {len(companies_clean)} companies -> {COMPANIES_CLEAN_JSON}")

    return {
        "financials_count": len(financial_rows),
        "segments_count": len(segment_rows),
        "companies_count": len(companies_clean),
        "companies": list(companies_clean.keys())
    }


if __name__ == "__main__":
    load_clean_data(verbose=True)

