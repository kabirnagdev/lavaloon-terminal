from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class FinancialMetric(BaseModel):
    name: str
    value: str
    period: str
    reporting_date: str
    source: str
    is_audited: bool
    status: str  # positive, neutral, warning

class CompanySummary(BaseModel):
    id: str
    ticker: str
    name: str
    sector: str
    industry: str
    risk_level: str
    description: str
    coverage_type: str  # corporate_equity | survey_investment_avenue | benchmark_index
    country: Optional[str] = "United States"
    currency: Optional[str] = "USD"
    fiscal_year: Optional[int] = 2025

class CompanyDetail(CompanySummary):
    period: str
    metrics: List[FinancialMetric]
    market_overview: Dict[str, Any]
    source_attribution: str
    segments: Optional[Dict[str, Any]] = None
    competitors: Optional[List[str]] = None
    suppliers: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    opportunities: Optional[List[str]] = None
    raw_financials: Optional[Dict[str, Any]] = None

class RelationshipNode(BaseModel):
    id: str
    label: str
    type: str
    relation: str
    lift: Optional[float] = None
    observation_count: Optional[int] = None

