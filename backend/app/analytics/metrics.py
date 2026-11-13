"""
Standard Financial Metrics and Formulas Module for Lavaloon Terminal.
Single source of truth for computed financial ratios and metrics.

Every formula is commented with its standard corporate finance definition.
"""

from typing import Dict, Any, Optional, List


def calculate_yoy_growth(current_val: float, prior_val: float) -> Optional[float]:
    """
    Year-over-Year (YoY) Growth (%):
    Formula: ((Current Period Value - Prior Period Value) / abs(Prior Period Value)) * 100
    Returns percentage growth rounded to 2 decimal places.
    """
    if prior_val is None or current_val is None:
        return None
    if prior_val == 0:
        return None
    growth = ((current_val - prior_val) / abs(prior_val)) * 100.0
    return round(growth, 2)


def calculate_gross_margin(gross_profit: float, total_revenue: float) -> Optional[float]:
    """
    Gross Profit Margin (%):
    Formula: (Gross Profit / Total Revenue) * 100
    Measures percentage of revenue retained after incurring direct production costs.
    """
    if not total_revenue or total_revenue <= 0 or gross_profit is None:
        return None
    return round((gross_profit / total_revenue) * 100.0, 2)


def calculate_operating_margin(operating_income: float, total_revenue: float) -> Optional[float]:
    """
    Operating Profit Margin (%):
    Formula: (Operating Income / Total Revenue) * 100
    Measures operational efficiency after operating expenses (SG&A, R&D).
    """
    if not total_revenue or total_revenue <= 0 or operating_income is None:
        return None
    return round((operating_income / total_revenue) * 100.0, 2)


def calculate_net_margin(net_income: float, total_revenue: float) -> Optional[float]:
    """
    Net Profit Margin (%):
    Formula: (Net Income / Total Revenue) * 100
    Measures final bottom-line profitability after taxes, interest, and non-operating items.
    """
    if not total_revenue or total_revenue <= 0 or net_income is None:
        return None
    return round((net_income / total_revenue) * 100.0, 2)


def calculate_debt_to_equity(total_debt: float, total_assets: float, total_liabilities: float) -> Optional[float]:
    """
    Debt-to-Equity (D/E) Ratio:
    Formula: Total Debt / (Total Assets - Total Liabilities)
    Measures financial leverage and capital structure solvency.
    Equity is computed as: Total Assets - Total Liabilities.
    """
    if total_assets is None or total_liabilities is None or total_debt is None:
        return None
    equity = total_assets - total_liabilities
    if equity <= 0:
        return None  # Negative equity or zero equity leads to undefined/distorted ratio
    return round(total_debt / equity, 2)


def calculate_current_ratio(current_assets: Optional[float], current_liabilities: Optional[float], total_assets: float, total_liabilities: float) -> Optional[float]:
    """
    Current Ratio (Liquidity):
    Formula: Current Assets / Current Liabilities
    If separate current items are not disaggregated, estimates liquidity from balance sheet capacity.
    """
    if current_assets and current_liabilities and current_liabilities > 0:
        return round(current_assets / current_liabilities, 2)
    # Conservative balance sheet asset coverage proxy: Total Assets / Total Liabilities
    if total_assets and total_liabilities and total_liabilities > 0:
        return round(total_assets / total_liabilities, 2)
    return None


def calculate_roe(net_income: float, total_assets: float, total_liabilities: float) -> Optional[float]:
    """
    Return on Equity (ROE) (%):
    Formula: (Net Income / Shareholders' Equity) * 100
    Where Equity = Total Assets - Total Liabilities.
    Measures management efficiency at generating profit from shareholder capital.
    """
    if net_income is None or total_assets is None or total_liabilities is None:
        return None
    equity = total_assets - total_liabilities
    if equity <= 0:
        return None
    return round((net_income / equity) * 100.0, 2)


def normalize_currency(val: float, from_currency: str, to_currency: str, fx_rate_usd_to_inr: float = 84.50) -> Dict[str, Any]:
    """
    Normalizes a financial figure between USD and INR with an explicit stated FX rate.
    Standard rate: 1 USD = 84.50 INR.
    Indian corporate figures are reported in Crores (1 Crore = 10,000,000 INR).
    US corporate figures are reported in full units (e.g. 383,285,000,000 USD).
    """
    from_curr = from_currency.upper()
    to_curr = to_currency.upper()

    if from_curr == to_curr:
        return {
            "value": val,
            "currency": to_curr,
            "fx_rate_used": 1.0,
            "rate_explanation": "Identical currency, no conversion necessary."
        }

    if from_curr == "USD" and to_curr == "INR":
        # USD full value -> INR Crores
        # val * fx_rate / 10,000,000
        inr_val = val * fx_rate_usd_to_inr
        inr_crores = inr_val / 1e7
        return {
            "value": round(inr_crores, 2),
            "currency": "INR",
            "unit": "INR Crores",
            "fx_rate_used": fx_rate_usd_to_inr,
            "rate_explanation": f"1 USD = {fx_rate_usd_to_inr:.2f} INR (Converted to Crores)"
        }

    if from_curr == "INR" and to_curr == "USD":
        # INR Crores -> USD full value
        # (val * 10,000,000) / fx_rate
        inr_full = val * 1e7
        usd_val = inr_full / fx_rate_usd_to_inr
        return {
            "value": round(usd_val, 2),
            "currency": "USD",
            "unit": "USD",
            "fx_rate_used": 1.0 / fx_rate_usd_to_inr,
            "rate_explanation": f"1 USD = {fx_rate_usd_to_inr:.2f} INR"
        }

    return {
        "value": val,
        "currency": to_curr,
        "fx_rate_used": 1.0,
        "rate_explanation": "Unknown pair, kept raw."
    }

