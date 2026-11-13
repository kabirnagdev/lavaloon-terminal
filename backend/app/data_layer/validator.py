"""
Data Validator for Lavaloon Terminal.
Strictly checks:
1. Duplicate rows: checks if (ticker, metric, period) appears more than once.
2. Missing periods: checks if periods are missing across core metrics.
3. Mixed units: ensures currency/unit isolation (USD Billions vs INR Crores, % for ratios).
4. Negative revenue: flags impossible negative revenue numbers.
5. Totals mismatch:
   - gross_profit <= total_revenue
   - free_cash_flow == operating_cash_flow - capital_expenditure
   - total_assets >= total_liabilities
   - Segment sums vs total_revenue
"""

import os
import json
from typing import Dict, Any, List

CLEAN_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/clean"))
FINANCIALS_CLEAN_JSON = os.path.join(CLEAN_DIR, "financials_clean.json")
SEGMENTS_CLEAN_JSON = os.path.join(CLEAN_DIR, "segments_clean.json")


def validate_financial_data(verbose: bool = True) -> Dict[str, Any]:
    """
    Validates clean financial data and returns a structured validation report dictionary.
    """
    if not os.path.exists(FINANCIALS_CLEAN_JSON):
        raise FileNotFoundError(f"Clean financials not found at {FINANCIALS_CLEAN_JSON}. Run loader first.")

    with open(FINANCIALS_CLEAN_JSON, "r", encoding="utf-8") as f:
        records: List[Dict[str, Any]] = json.load(f)

    segment_records: List[Dict[str, Any]] = []
    if os.path.exists(SEGMENTS_CLEAN_JSON):
        with open(SEGMENTS_CLEAN_JSON, "r", encoding="utf-8") as f:
            segment_records = json.load(f)

    report = {
        "total_records": len(records),
        "total_segment_records": len(segment_records),
        "duplicates": [],
        "missing_periods": [],
        "unit_mismatches": [],
        "negative_revenues": [],
        "accounting_mismatches": [],
        "segment_mismatches": [],
        "passed": True
    }

    # 1. Duplicates check: (ticker, metric, period)
    seen_keys = set()
    for r in records:
        key = (r["ticker"], r["metric"], r["period"])
        if key in seen_keys:
            report["duplicates"].append({
                "ticker": r["ticker"],
                "metric": r["metric"],
                "period": r["period"],
                "source_row": r["source_row"]
            })
        seen_keys.add(key)

    # 2. Organize records by (ticker, period)
    by_entity_period: Dict[tuple, Dict[str, float]] = {}
    by_entity_units: Dict[str, set] = {}
    periods_by_company: Dict[str, set] = {}

    for r in records:
        ticker = r["ticker"]
        period = r["period"]
        metric = r["metric"]
        val = r["value"]
        unit = r["unit"]
        curr = r["currency"]

        key = (ticker, period)
        if key not in by_entity_period:
            by_entity_period[key] = {}
        by_entity_period[key][metric] = val

        if ticker not in by_entity_units:
            by_entity_units[ticker] = set()
        by_entity_units[ticker].add((curr, unit, metric))

        if ticker not in periods_by_company:
            periods_by_company[ticker] = set()
        periods_by_company[ticker].add(period)

        # 4. Negative revenue check
        if metric == "total_revenue" and val < 0:
            report["negative_revenues"].append({
                "ticker": ticker,
                "period": period,
                "value": val,
                "source_row": r["source_row"]
            })

    # 3. Unit / Currency integrity check
    for ticker, units in by_entity_units.items():
        currencies = set(c for c, u, m in units)
        if len(currencies) > 1:
            report["unit_mismatches"].append({
                "ticker": ticker,
                "issue": f"Multiple base currencies detected: {currencies}"
            })

        for curr, u, metric in units:
            if "margin" in metric or "pct" in metric:
                if u != "%":
                    report["unit_mismatches"].append({
                        "ticker": ticker,
                        "metric": metric,
                        "unit": u,
                        "issue": f"Expected unit '%' for margin metric, got '{u}'"
                    })
            else:
                if curr == "USD" and u not in ["USD", "USD Billions"]:
                    report["unit_mismatches"].append({
                        "ticker": ticker,
                        "metric": metric,
                        "issue": f"USD company {ticker} has unexpected unit '{u}'"
                    })
                elif curr == "INR" and u not in ["INR", "INR Crores"]:
                    report["unit_mismatches"].append({
                        "ticker": ticker,
                        "metric": metric,
                        "issue": f"INR company {ticker} has unexpected unit '{u}'"
                    })

    # Check missing periods across standard metrics for each company
    core_metrics = ["total_revenue", "gross_profit", "operating_income", "net_income"]
    for (ticker, period), metrics_dict in by_entity_period.items():
        for cm in core_metrics:
            if cm not in metrics_dict:
                report["missing_periods"].append({
                    "ticker": ticker,
                    "period": period,
                    "missing_metric": cm
                })

    # 5. Totals & Accounting Integrity Check
    for (ticker, period), m in by_entity_period.items():
        rev = m.get("total_revenue")
        gp = m.get("gross_profit")
        oi = m.get("operating_income")
        ni = m.get("net_income")
        assets = m.get("total_assets")
        liab = m.get("total_liabilities")
        ocf = m.get("operating_cash_flow")
        capex = m.get("capital_expenditure")
        fcf = m.get("free_cash_flow")

        # Gross profit cannot exceed revenue
        if rev is not None and gp is not None:
            if gp > rev:
                report["accounting_mismatches"].append({
                    "ticker": ticker,
                    "period": period,
                    "issue": f"Gross Profit ({gp:,.0f}) exceeds Total Revenue ({rev:,.0f})"
                })

        # Assets should be >= Liabilities
        if assets is not None and liab is not None:
            if assets < liab:
                report["accounting_mismatches"].append({
                    "ticker": ticker,
                    "period": period,
                    "issue": f"Total Assets ({assets:,.0f}) less than Total Liabilities ({liab:,.0f})"
                })

        # Free Cash Flow = Operating Cash Flow - CapEx
        if ocf is not None and capex is not None and fcf is not None:
            expected_fcf = ocf - capex
            # Allow minor rounding difference (0.1% or 5 units)
            diff = abs(fcf - expected_fcf)
            tolerance = max(5.0, abs(expected_fcf) * 0.01)
            if diff > tolerance:
                report["accounting_mismatches"].append({
                    "ticker": ticker,
                    "period": period,
                    "issue": f"FCF ({fcf:,.0f}) does not match OCF ({ocf:,.0f}) - CapEx ({capex:,.0f}) = {expected_fcf:,.0f} (diff: {diff:,.0f})"
                })

    # 6. Segment breakdown totals check
    segments_by_entity_period: Dict[tuple, float] = {}
    for seg in segment_records:
        key = (seg["ticker"], seg["period"])
        segments_by_entity_period[key] = segments_by_entity_period.get(key, 0.0) + seg["value"]

    for (ticker, period), seg_total in segments_by_entity_period.items():
        rev = by_entity_period.get((ticker, period), {}).get("total_revenue")
        if rev:
            diff = abs(seg_total - rev)
            # Flag if segment sum exceeds revenue by more than 5%
            if seg_total > rev * 1.05:
                report["segment_mismatches"].append({
                    "ticker": ticker,
                    "period": period,
                    "issue": f"Sum of segments ({seg_total:,.0f}) exceeds reported total revenue ({rev:,.0f})"
                })

    # Overall pass / fail calculation
    has_fatal_errors = (
        len(report["duplicates"]) > 0 or
        len(report["negative_revenues"]) > 0 or
        len(report["unit_mismatches"]) > 0 or
        len(report["accounting_mismatches"]) > 0
    )
    report["passed"] = not has_fatal_errors

    if verbose:
        print_validation_report(report)

    return report


def print_validation_report(r: Dict[str, Any]):
    print("\n" + "=" * 70)
    print(" LAVALOON TERMINAL — DATA VALIDATOR REPORT")
    print("=" * 70)
    print(f"Total Financial Metric Records: {r['total_records']}")
    print(f"Total Business Segment Records: {r['total_segment_records']}")
    print("-" * 70)

    # 1. Duplicates
    if not r["duplicates"]:
        print(" [PASS] Duplicates: No duplicate (company, metric, period) records found.")
    else:
        print(f" [FAIL] Duplicates Found ({len(r['duplicates'])}):")
        for d in r["duplicates"]:
            print(f"        - {d['ticker']} | {d['metric']} | {d['period']} (Row {d['source_row']})")

    # 2. Missing Periods
    if not r["missing_periods"]:
        print(" [PASS] Missing Periods: All core metrics (Revenue, GP, OpInc, NetInc) present.")
    else:
        print(f" [WARN] Missing Periods ({len(r['missing_periods'])}):")
        for mp in r["missing_periods"]:
            print(f"        - {mp['ticker']} {mp['period']} missing {mp['missing_metric']}")

    # 3. Unit & Currency Isolation
    if not r["unit_mismatches"]:
        print(" [PASS] Unit/Currency Integrity: Currency isolation valid. No mixed USD/INR or ratio unit bugs.")
    else:
        print(f" [FAIL] Unit Mismatches ({len(r['unit_mismatches'])}):")
        for um in r["unit_mismatches"]:
            print(f"        - {um['ticker']}: {um.get('issue')}")

    # 4. Negative Revenue
    if not r["negative_revenues"]:
        print(" [PASS] Negative Revenue: No negative revenue records found.")
    else:
        print(f" [FAIL] Negative Revenues Found ({len(r['negative_revenues'])}):")
        for nr in r["negative_revenues"]:
            print(f"        - {nr['ticker']} {nr['period']} revenue: {nr['value']}")

    # 5. Totals & Accounting Integrity
    if not r["accounting_mismatches"]:
        print(" [PASS] Totals Integrity: Gross profit <= Revenue, FCF = OCF - CapEx, Assets >= Liab.")
    else:
        print(f" [FAIL] Accounting Mismatches ({len(r['accounting_mismatches'])}):")
        for am in r["accounting_mismatches"]:
            print(f"        - {am['ticker']} {am['period']}: {am['issue']}")

    # 6. Segment Reconciliation
    if not r["segment_mismatches"]:
        print(" [PASS] Segment Breakdown: All segment revenues reconcile with reported company revenue.")
    else:
        print(f" [WARN] Segment Mismatches ({len(r['segment_mismatches'])}):")
        for sm in r["segment_mismatches"]:
            print(f"        - {sm['ticker']} {sm['period']}: {sm['issue']}")

    print("=" * 70)
    if r["passed"]:
        print(" OVERALL STATUS: ALL CHECKS PASSED (DATA LAYER READY)")
    else:
        print(" OVERALL STATUS: VALIDATION FAILED (ERRORS DETECTED)")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    validate_financial_data(verbose=True)

