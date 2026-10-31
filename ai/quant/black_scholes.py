import math
from typing import Dict, Any, List, Optional
import numpy as np
from scipy.stats import norm
import pandas as pd

def black_scholes(
    S: float,
    K: float,
    T_days: float,
    r: float,
    sigma: float,
    option_type: str = "call"
) -> float:
    """
    Compute European option price using the analytical Black-Scholes formula.
    S: Spot price
    K: Strike price
    T_days: Days to expiration
    r: Risk-free rate (e.g. 0.05 for 5%)
    sigma: Volatility (e.g. 0.20 for 20%)
    option_type: 'call' or 'put'
    """
    T = max(T_days / 365.0, 1e-6)
    if sigma <= 0 or S <= 0 or K <= 0:
        return max(0.0, S - K) if option_type == "call" else max(0.0, K - S)

    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    if option_type.lower() == "call":
        price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    else:
        price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    return float(max(price, 0.0))

def greeks(
    S: float,
    K: float,
    T_days: float,
    r: float,
    sigma: float
) -> Dict[str, float]:
    """Calculate Delta (Call/Put), Gamma, Vega, Theta (Call/Put), and Rho (Call/Put)."""
    T = max(T_days / 365.0, 1e-6)
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    pdf_d1 = norm.pdf(d1)
    delta_call = norm.cdf(d1)
    delta_put = delta_call - 1.0

    gamma = pdf_d1 / (S * sigma * np.sqrt(T))
    vega = S * pdf_d1 * np.sqrt(T) / 100.0  # scaled per 1% vol change

    # Annual theta divided by 365 for daily decay
    theta_common = -(S * pdf_d1 * sigma) / (2 * np.sqrt(T))
    theta_call = (theta_common - r * K * np.exp(-r * T) * norm.cdf(d2)) / 365.0
    theta_put = (theta_common + r * K * np.exp(-r * T) * norm.cdf(-d2)) / 365.0

    rho_call = (K * T * np.exp(-r * T) * norm.cdf(d2)) / 100.0  # per 1% rate change
    rho_put = (-K * T * np.exp(-r * T) * norm.cdf(-d2)) / 100.0

    return {
        "delta_call": round(float(delta_call), 4),
        "delta_put": round(float(delta_put), 4),
        "gamma": round(float(gamma), 6),
        "vega": round(float(vega), 4),
        "theta_call": round(float(theta_call), 4),
        "theta_put": round(float(theta_put), 4),
        "rho_call": round(float(rho_call), 4),
        "rho_put": round(float(rho_put), 4)
    }

def solve_iv(
    market_price: float,
    S: float,
    K: float,
    T_days: float,
    r: float,
    option_type: str = "call",
    tol: float = 1e-6,
    max_iter: int = 100
) -> Optional[float]:
    """Newton-Raphson solver for Black-Scholes Implied Volatility."""
    sigma = 0.30  # initial volatility guess
    for _ in range(max_iter):
        p = black_scholes(S, K, T_days, r, sigma, option_type)
        diff = p - market_price
        if abs(diff) < tol:
            return round(sigma, 4)
        T = max(T_days / 365.0, 1e-6)
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        vega = S * norm.pdf(d1) * np.sqrt(T)
        if abs(vega) < 1e-12:
            break
        sigma -= diff / vega
        if sigma <= 0.001 or sigma > 5.0:
            break
    return None

def price_options_chain(
    S: float,
    strikes: List[float],
    T_days: float,
    r: float,
    sigma: float
) -> List[Dict[str, Any]]:
    """Generate multi-strike options chain pricing and Greeks."""
    chain = []
    for K in strikes:
        call_px = black_scholes(S, K, T_days, r, sigma, "call")
        put_px = black_scholes(S, K, T_days, r, sigma, "put")
        grk = greeks(S, K, T_days, r, sigma)
        chain.append({
            "strike": K,
            "call_price": round(call_px, 2),
            "put_price": round(put_px, 2),
            "delta_call": grk["delta_call"],
            "delta_put": grk["delta_put"],
            "gamma": grk["gamma"],
            "vega": grk["vega"],
            "theta_call": grk["theta_call"],
            "theta_put": grk["theta_put"]
        })
    return chain

