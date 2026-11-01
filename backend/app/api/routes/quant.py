from typing import List
from fastapi import APIRouter
from backend.app.schemas.quant import (
    BlackScholesRequest,
    BlackScholesResponse,
    OptionsChainRequest,
    OptionsChainItem
)
from backend.app.services.quant_service import QuantService

router = APIRouter(prefix="/quant", tags=["quant"])

@router.post("/black-scholes", response_model=BlackScholesResponse)
def calculate_option(req: BlackScholesRequest):
    return QuantService.calculate_black_scholes(req)

@router.post("/options-chain", response_model=List[OptionsChainItem])
def calculate_chain(req: OptionsChainRequest):
    return QuantService.calculate_options_chain(req)

