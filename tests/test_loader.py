"""
Unit tests for Data Loader and Data Validator (Phase 0 & Phase 5).
"""

import os
import json
import pytest
from backend.app.data_layer.loader import load_clean_data
from backend.app.data_layer.validator import validate_financial_data
from backend.app.data_layer.data_service import get_series


def test_loader_generates_clean_files():
    """Validates that loader produces clean JSON files with required fields."""
    res = load_clean_data(verbose=False)
    assert res["companies_count"] >= 10
    assert res["financials_count"] > 300
    assert res["segments_count"] > 30

    clean_file = "data/clean/financials_clean.json"
    assert os.path.exists(clean_file)

    with open(clean_file, "r") as f:
        records = json.load(f)

    # Check required fields on sample record
    rec = records[0]
    required_keys = ["company", "ticker", "metric", "value", "unit", "currency", "period", "source_file", "source_row"]
    for k in required_keys:
        assert k in rec, f"Missing required field {k}"


def test_validator_passes_all_checks():
    """Validates that the validator checks complete with zero fatal errors."""
    report = validate_financial_data(verbose=False)
    assert report["passed"] is True
    assert len(report["duplicates"]) == 0
    assert len(report["negative_revenues"]) == 0
    assert len(report["unit_mismatches"]) == 0
    assert len(report["accounting_mismatches"]) == 0


def test_get_series_provenance():
    """Validates that get_series returns full audit provenance (source file & row)."""
    series = get_series("AAPL", "total_revenue")
    assert len(series) >= 4
    for pt in series:
        assert pt["ticker"] == "AAPL"
        assert pt["metric"] == "total_revenue"
        assert pt["unit"] == "USD"
        assert pt["source_file"] is not None
        assert pt["source_row"] > 1

