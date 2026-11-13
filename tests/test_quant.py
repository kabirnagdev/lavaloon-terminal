"""
Unit tests for quantitative derivative calculations (Black-Scholes & Greeks).
Validates analytical pricing against 3 standard textbook benchmarks.
"""

import pytest
from ai.quant.black_scholes import black_scholes, greeks


def test_black_scholes_case_1_hull_benchmark():
    """
    Case 1: Standard At-The-Money Hull benchmark
    S = 100, K = 100, T = 1.0 yr (365 days), r = 0.05 (5%), sigma = 0.20 (20%)
    Expected Call ~ 10.4506, Put ~ 5.5735
    """
    call_px = black_scholes(S=100.0, K=100.0, T_days=365.0, r=0.05, sigma=0.20, option_type="call")
    put_px = black_scholes(S=100.0, K=100.0, T_days=365.0, r=0.05, sigma=0.20, option_type="put")

    assert pytest.approx(call_px, rel=1e-3) == 10.4506
    assert pytest.approx(put_px, rel=1e-3) == 5.5735

    # Put-Call parity check: C - P = S - K * exp(-r*T)
    import numpy as np
    parity_diff = (call_px - put_px) - (100.0 - 100.0 * np.exp(-0.05))
    assert pytest.approx(parity_diff, abs=1e-3) == 0.0


def test_black_scholes_case_2_otm_call():
    """
    Case 2: Out-Of-The-Money Call
    S = 50, K = 60, T = 0.5 yr (182.5 days), r = 0.10 (10%), sigma = 0.30 (30%)
    Expected Call ~ 1.8330
    """
    call_px = black_scholes(S=50.0, K=60.0, T_days=182.5, r=0.10, sigma=0.30, option_type="call")
    assert pytest.approx(call_px, rel=1e-3) == 1.8330


def test_black_scholes_case_3_deep_itm_call():
    """
    Case 3: Deep In-The-Money Call
    S = 120, K = 80, T = 0.25 yr (91.25 days), r = 0.02 (2%), sigma = 0.15 (15%)
    Expected Call ~ 40.3990
    """
    call_px = black_scholes(S=120.0, K=80.0, T_days=91.25, r=0.02, sigma=0.15, option_type="call")
    assert pytest.approx(call_px, rel=1e-3) == 40.3990


def test_greeks_bounds():
    """Validates analytical Greek boundary constraints."""
    grk = greeks(S=100.0, K=100.0, T_days=180.0, r=0.05, sigma=0.20)
    assert 0.0 <= grk["delta_call"] <= 1.0
    assert -1.0 <= grk["delta_put"] <= 0.0
    assert grk["gamma"] > 0.0
    assert grk["vega"] > 0.0

