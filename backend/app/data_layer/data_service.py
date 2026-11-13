"""
Canonical Data Service for Lavaloon Terminal.
Exposes the single get_series(company, metric, period_range) function
and serves as the single trusted data access layer.
"""

import os
import json
from typing import List, Dict, Any, Optional, Tuple

CLEAN_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/clean"))
FINANCIALS_CLEAN_JSON = os.path.join(CLEAN_DIR, "financials_clean.json")
SEGMENTS_CLEAN_JSON = os.path.join(CLEAN_DIR, "segments_clean.json")
COMPANIES_CLEAN_JSON = os.path.join(CLEAN_DIR, "companies_clean.json")


class DataService:
    def __init__(self):
        self._records: List[Dict[str, Any]] = []
        self._segments: List[Dict[str, Any]] = []
        self._companies: Dict[str, Any] = {}
        # Indexed maps
        # key: (ticker.upper(), metric.lower()) -> list of points sorted by period
        self._by_ticker_metric: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
        # name lookup: lower(name) -> ticker
        self._name_to_ticker: Dict[str, str] = {}
        self.reload()

    def reload(self):
        """Loads or reloads clean data from data/clean/*.json into memory."""
        if os.path.exists(FINANCIALS_CLEAN_JSON):
            with open(FINANCIALS_CLEAN_JSON, "r", encoding="utf-8") as f:
                self._records = json.load(f)
        else:
            self._records = []

        if os.path.exists(SEGMENTS_CLEAN_JSON):
            with open(SEGMENTS_CLEAN_JSON, "r", encoding="utf-8") as f:
                self._segments = json.load(f)
        else:
            self._segments = []

        if os.path.exists(COMPANIES_CLEAN_JSON):
            with open(COMPANIES_CLEAN_JSON, "r", encoding="utf-8") as f:
                self._companies = json.load(f)
        else:
            self._companies = {}

        # Build index
        self._by_ticker_metric.clear()
        self._name_to_ticker.clear()

        for c_ticker, c_data in self._companies.items():
            self._name_to_ticker[c_ticker.lower()] = c_ticker
            self._name_to_ticker[c_data["name"].lower()] = c_ticker
            self._name_to_ticker[c_data["id"].lower()] = c_ticker

        for r in self._records:
            ticker = r["ticker"].upper()
            metric = r["metric"].lower()
            key = (ticker, metric)
            if key not in self._by_ticker_metric:
                self._by_ticker_metric[key] = []
            self._by_ticker_metric[key].append(r)

            # Ensure company name mapping
            comp_name = r.get("company", "")
            if comp_name:
                self._name_to_ticker[comp_name.lower()] = ticker

        # Sort all series by period
        for key in self._by_ticker_metric:
            self._by_ticker_metric[key].sort(key=lambda x: x["period"])

    def resolve_ticker(self, company: str) -> Optional[str]:
        """Resolves a company string (name, ticker, or id) to an uppercase ticker."""
        if not company:
            return None
        cleaned = company.strip().lower()
        if cleaned.upper() in self._companies:
            return cleaned.upper()
        return self._name_to_ticker.get(cleaned)

    def get_series(
        self,
        company: str,
        metric: str,
        period_range: Optional[Tuple[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """
        The single trusted function: getSeries(company, metric, periodRange).
        Returns chronologically sorted list of data points with source provenance.
        """
        ticker = self.resolve_ticker(company)
        if not ticker:
            return []

        key = (ticker, metric.strip().lower())
        series = self._by_ticker_metric.get(key, [])

        if not period_range or len(period_range) < 2:
            return list(series)

        start_period, end_period = period_range[0].upper(), period_range[1].upper()
        filtered = [
            pt for pt in series
            if start_period <= pt["period"] <= end_period
        ]
        return filtered

    def get_segments(self, company: str, period: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns business segment revenues for a company and optional period."""
        ticker = self.resolve_ticker(company)
        if not ticker:
            return []
        res = [s for s in self._segments if s["ticker"] == ticker]
        if period:
            p_upper = period.upper()
            res = [s for s in res if s["period"] == p_upper]
        return res

    def get_companies(self) -> List[Dict[str, Any]]:
        """Returns list of clean company summaries."""
        return list(self._companies.values())

    def get_company_detail(self, company_or_ticker: str) -> Optional[Dict[str, Any]]:
        """Returns complete company profile with audited metrics and segment breakdown."""
        ticker = self.resolve_ticker(company_or_ticker)
        if not ticker or ticker not in self._companies:
            return None
        comp = dict(self._companies[ticker])
        # Attach latest metric snapshots
        t_records = [r for r in self._records if r["ticker"] == ticker]
        # Group by latest period
        latest_period = comp["periods"][-1] if comp["periods"] else ""
        latest_metrics = {
            r["metric"]: r["value"]
            for r in t_records if r["period"] == latest_period
        }
        comp["latest_metrics"] = latest_metrics
        comp["latest_period"] = latest_period
        comp["segments"] = self.get_segments(ticker, latest_period)
        return comp


# Singleton instance
data_service = DataService()


def get_series(
    company: str,
    metric: str,
    period_range: Optional[Tuple[str, str]] = None
) -> List[Dict[str, Any]]:
    """Standalone helper function matching the exact specification."""
    return data_service.get_series(company, metric, period_range)

