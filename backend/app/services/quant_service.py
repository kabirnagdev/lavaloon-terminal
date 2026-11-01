from typing import List, Dict, Any
from backend.app.schemas.quant import (
    BlackScholesRequest,
    BlackScholesResponse,
    GreeksResponse,
    OptionsChainRequest,
    OptionsChainItem
)
from ai.quant.black_scholes import black_scholes, greeks, price_options_chain

class QuantService:
    @staticmethod
    def calculate_black_scholes(req: BlackScholesRequest) -> BlackScholesResponse:
        px = black_scholes(
            S=req.S,
            K=req.K,
            T_days=req.T_days,
            r=req.r,
            sigma=req.sigma,
            option_type=req.option_type
        )
        grk_dict = greeks(
            S=req.S,
            K=req.K,
            T_days=req.T_days,
            r=req.r,
            sigma=req.sigma
        )

        # Intrinsic & time value
        if req.option_type.lower() == "call":
            intrinsic = max(0.0, req.S - req.K)
        else:
            intrinsic = max(0.0, req.K - req.S)
        time_val = max(0.0, px - intrinsic)

        return BlackScholesResponse(
            price=round(px, 4),
            spot=req.S,
            strike=req.K,
            days_to_expiry=req.T_days,
            risk_free_rate=req.r,
            volatility=req.sigma,
            option_type=req.option_type.lower(),
            greeks=GreeksResponse(**grk_dict),
            intrinsic_value=round(intrinsic, 4),
            time_value=round(time_val, 4)
        )

    @staticmethod
    def calculate_options_chain(req: OptionsChainRequest) -> List[OptionsChainItem]:
        chain_data = price_options_chain(
            S=req.S,
            strikes=req.strikes,
            T_days=req.T_days,
            r=req.r,
            sigma=req.sigma
        )
        return [OptionsChainItem(**item) for item in chain_data]

