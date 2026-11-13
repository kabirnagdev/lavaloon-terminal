"""
Unit tests for Financial Analysis, Metrics, Data Layer, and 10 Grounded Test Questions.
"""

import pytest
from backend.app.data_layer.data_service import data_service, get_series
from backend.app.data_layer.validator import validate_financial_data
from backend.app.analytics.metrics import (
    calculate_yoy_growth,
    calculate_gross_margin,
    calculate_operating_margin,
    calculate_net_margin,
    calculate_debt_to_equity,
    calculate_current_ratio,
    calculate_roe,
    normalize_currency
)
from backend.app.analytics.answer_guard import answer_guard_check


# --- SECTION 1: FORMULAS AND METRICS ---

def test_formula_gross_margin():
    # Apple FY2024: GP 180,683M / Rev 391,035M = 46.21%
    gm = calculate_gross_margin(180683000000, 391035000000)
    assert gm == 46.21


def test_formula_operating_margin():
    # Microsoft FY2024: OpInc 109,433M / Rev 245,122M = 44.64%
    om = calculate_operating_margin(109433000000, 245122000000)
    assert om == 44.64


def test_formula_net_margin():
    # NVIDIA FY2024: NetInc 29,760M / Rev 60,922M = 48.85%
    nm = calculate_net_margin(29760000000, 60922000000)
    assert nm == 48.85


def test_formula_yoy_growth():
    # Apple Revenue FY2023 383,285M to FY2024 391,035M = +2.02%
    yoy = calculate_yoy_growth(391035000000, 383285000000)
    assert yoy == 2.02


def test_formula_debt_to_equity():
    # Assets 100, Liab 60, Equity 40, Debt 20 -> D/E = 0.50
    de = calculate_debt_to_equity(20, 100, 60)
    assert de == 0.50


def test_formula_current_ratio():
    # Assets 200, Liab 100 -> CR = 2.00
    cr = calculate_current_ratio(None, None, 200, 100)
    assert cr == 2.00


def test_formula_roe():
    # Net Income 10, Equity (Assets 100 - Liab 50 = 50) -> ROE = 20.0%
    roe = calculate_roe(10, 100, 50)
    assert roe == 20.0


def test_currency_normalization():
    # 100 Billion USD at 84.5 FX = 845,000 INR Crores
    res = normalize_currency(100e9, "USD", "INR", fx_rate_usd_to_inr=84.50)
    assert res["value"] == 845000.0
    assert res["currency"] == "INR"
    assert res["fx_rate_used"] == 84.50


# --- SECTION 2: 10 GROUNDED TEST QUESTIONS WITH KNOWN ANSWERS ---

def test_q1_apple_fy2025_revenue():
    """Q1: What is Apple's total revenue in FY2025?"""
    series = get_series("AAPL", "total_revenue")
    pt_2025 = [p for p in series if p["period"] == "FY2025"][0]
    assert pt_2025["value"] == 416161000000
    assert pt_2025["unit"] == "USD"


def test_q2_microsoft_fy2024_gross_profit():
    """Q2: What is Microsoft's gross profit in FY2024?"""
    series = get_series("MSFT", "gross_profit")
    pt_2024 = [p for p in series if p["period"] == "FY2024"][0]
    assert pt_2024["value"] == 171008000000
    assert pt_2024["currency"] == "USD"


def test_q3_nvidia_fy2024_operating_margin():
    """Q3: What is NVIDIA's reported operating margin in FY2024?"""
    series = get_series("NVDA", "operating_margin_pct")
    pt_2024 = [p for p in series if p["period"] == "FY2024"][0]
    assert pt_2024["value"] == 54.12
    assert pt_2024["unit"] == "%"


def test_q4_nvidia_fy2024_operating_income():
    """Q4: What is NVIDIA's operating income in FY2024?"""
    series = get_series("NVDA", "operating_income")
    pt_2024 = [p for p in series if p["period"] == "FY2024"][0]
    assert pt_2024["value"] == 32972000000


def test_q5_reliance_fy2024_revenue_inr_crores():
    """Q5: What is Reliance Industries' total revenue in FY2024 in INR Crores?"""
    series = get_series("RELIANCE", "total_revenue")
    pt_2024 = [p for p in series if p["period"] == "FY2024"][0]
    assert pt_2024["value"] == 1000122
    assert pt_2024["currency"] == "INR"
    assert pt_2024["unit"] == "INR Crores"


def test_q6_tcs_fy2024_net_income():
    """Q6: What is TCS net income in FY2024 in INR Crores?"""
    series = get_series("TCS", "net_income")
    pt_2024 = [p for p in series if p["period"] == "FY2024"][0]
    assert pt_2024["value"] == 46099
    assert pt_2024["currency"] == "INR"


def test_q7_apple_fcf_formula_identity():
    """Q7: Does Apple FY2024 Free Cash Flow equal Operating Cash Flow minus CapEx?"""
    ocf = [p for p in get_series("AAPL", "operating_cash_flow") if p["period"] == "FY2024"][0]["value"]
    capex = [p for p in get_series("AAPL", "capital_expenditure") if p["period"] == "FY2024"][0]["value"]
    fcf = [p for p in get_series("AAPL", "free_cash_flow") if p["period"] == "FY2024"][0]["value"]
    assert fcf == (ocf - capex)
    assert fcf == 108807000000


def test_q8_tesla_revenue_trajectory():
    """Q8: What was Tesla's revenue in FY2023 vs FY2024?"""
    series = get_series("TSLA", "total_revenue")
    by_period = {p["period"]: p["value"] for p in series}
    assert by_period["FY2023"] == 96773000000
    assert by_period["FY2024"] == 97690000000
    # Growth is positive +0.95%
    growth = calculate_yoy_growth(by_period["FY2024"], by_period["FY2023"])
    assert growth == 0.95


def test_q9_infosys_zero_debt():
    """Q9: What is Infosys' reported total debt in FY2024?"""
    series = get_series("INFY", "total_debt")
    pt_2024 = [p for p in series if p["period"] == "FY2024"][0]
    assert pt_2024["value"] == 0


def test_q10_missing_data_refusal():
    """Q10: Does querying a non-existent company or metric refuse with 'Not available in provided data'?"""
    series = get_series("NON_EXISTENT_COMPANY", "revenue")
    assert series == []
    valid, text = answer_guard_check("Synthetic reply", series)
    assert valid is False
    assert text == "Not available in provided data."

