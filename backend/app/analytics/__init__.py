"""
Analytics package for financial metrics, ratios, and currency conversions.
"""

from .metrics import (
    calculate_yoy_growth,
    calculate_gross_margin,
    calculate_operating_margin,
    calculate_net_margin,
    calculate_debt_to_equity,
    calculate_current_ratio,
    calculate_roe,
    normalize_currency
)

__all__ = [
    "calculate_yoy_growth",
    "calculate_gross_margin",
    "calculate_operating_margin",
    "calculate_net_margin",
    "calculate_debt_to_equity",
    "calculate_current_ratio",
    "calculate_roe",
    "normalize_currency"
]

