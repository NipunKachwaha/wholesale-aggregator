from fastapi import APIRouter
from models.schemas import PriceOptimizeRequest, PriceOptimizeResponse
from pipelines.price_optimizer import price_optimizer

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/optimize-price", response_model=PriceOptimizeResponse)
async def optimize_price(request: PriceOptimizeRequest):
    result = price_optimizer.optimize(
        sku               = request.sku,
        current_price     = request.current_price,
        category          = request.category,
        stock_qty         = request.stock_qty,
        competitor_prices = request.competitor_prices,
    )
    return result