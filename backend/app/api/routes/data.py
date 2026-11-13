"""
FastAPI route for the single trusted Data Layer.
Exposes /api/v1/data/series and clean company data.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from backend.app.data_layer.data_service import data_service, get_series

router = APIRouter(prefix="/data", tags=["data-layer"])


@router.get("/series", summary="Get canonical time-series for a company and metric")
def read_series(
    company: str = Query(..., description="Company name or ticker symbol (e.g. AAPL, MSFT, Apple Inc.)"),
    metric: str = Query(..., description="Metric key (e.g. total_revenue, gross_profit, net_income, operating_margin_pct)"),
    start_period: Optional[str] = Query(None, description="Starting fiscal period (e.g. FY2022)"),
    end_period: Optional[str] = Query(None, description="Ending fiscal period (e.g. FY2025)")
) -> List[Dict[str, Any]]:
    period_range = None
    if start_period and end_period:
        period_range = (start_period, end_period)

    series = get_series(company, metric, period_range)
    return series


@router.get("/companies", summary="List all clean verified corporate entities")
def list_clean_companies() -> List[Dict[str, Any]]:
    return data_service.get_companies()


@router.get("/companies/{ticker}", summary="Get clean company profile and metrics")
def get_clean_company(ticker: str) -> Dict[str, Any]:
    detail = data_service.get_company_detail(ticker)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Company '{ticker}' not found in clean data.")
    return detail


@router.get("/segments", summary="Get audited business segment breakdown")
def read_segments(
    company: str = Query(..., description="Company name or ticker"),
    period: Optional[str] = Query(None, description="Optional period (e.g. FY2024)")
) -> List[Dict[str, Any]]:
    return data_service.get_segments(company, period)


@router.post("/reload", summary="Reload clean JSON data from disk")
def reload_data() -> Dict[str, str]:
    data_service.reload()
    return {"status": "ok", "message": "Clean data reloaded successfully."}

