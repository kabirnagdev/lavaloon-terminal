from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class BlackScholesRequest(BaseModel):
    S: float  # Spot price
    K: float  # Strike price
    T_days: float  # Days to expiration
    r: float = 0.05  # Risk free rate (e.g. 0.05)
    sigma: float = 0.25  # Volatility (e.g. 0.25)
    option_type: str = "call"  # call or put

class GreeksResponse(BaseModel):
    delta_call: float
    delta_put: float
    gamma: float
    vega: float
    theta_call: float
    theta_put: float
    rho_call: float
    rho_put: float

class BlackScholesResponse(BaseModel):
    price: float
    spot: float
    strike: float
    days_to_expiry: float
    risk_free_rate: float
    volatility: float
    option_type: str
    greeks: GreeksResponse
    intrinsic_value: float
    time_value: float

class OptionsChainRequest(BaseModel):
    S: float
    strikes: List[float]
    T_days: float
    r: float = 0.05
    sigma: float = 0.25

class OptionsChainItem(BaseModel):
    strike: float
    call_price: float
    put_price: float
    delta_call: float
    delta_put: float
    gamma: float
    vega: float
    theta_call: float
    theta_put: float

