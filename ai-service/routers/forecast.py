from fastapi import APIRouter
from models.schemas import ForecastRequest, ForecastResponse
from pipelines.demand_forecaster import demand_forecaster

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/forecast-demand", response_model=ForecastResponse)
async def forecast_demand(request: ForecastRequest):
    result = demand_forecaster.forecast(
        sku       = request.sku,
        tenant_id = request.tenant_id,
        days      = request.days or 30,
    )
    return result