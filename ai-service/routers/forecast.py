from fastapi import APIRouter
from models.schemas import ForecastRequest, ForecastResponse
from pipelines.prophet_forecaster import prophet_forecaster
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/ai", tags=["Forecasting"])

class BatchForecastRequest(BaseModel):
    skus:      List[str]
    tenant_id: str
    days:      Optional[int] = 7

class AnomalyRequest(BaseModel):
    sku:       str
    tenant_id: str

@router.post("/forecast-demand")
async def forecast_demand(request: ForecastRequest):
    """Single SKU demand forecast"""
    result = prophet_forecaster.forecast(
        sku       = request.sku,
        tenant_id = request.tenant_id,
        days      = request.days or 30,
    )
    return result

@router.post("/forecast-batch")
async def forecast_batch(request: BatchForecastRequest):
    """Multiple SKUs forecast"""
    results = prophet_forecaster.batch_forecast(
        skus      = request.skus,
        tenant_id = request.tenant_id,
        days      = request.days or 7,
    )
    return {"forecasts": results, "total": len(results)}

@router.post("/detect-anomalies")
async def detect_anomalies(request: AnomalyRequest):
    """Order anomalies detect karo"""
    result = prophet_forecaster.detect_anomalies(
        sku       = request.sku,
        tenant_id = request.tenant_id,
    )
    return result

@router.get("/forecast/model-info")
async def model_info():
    """Konsa model use ho raha hai"""
    return {
        "model":      "prophet" if prophet_forecaster.use_prophet else "statistical",
        "prophet":    prophet_forecaster.use_prophet,
        "features": [
            "trend decomposition",
            "weekly seasonality",
            "indian holidays",
            "uncertainty intervals",
            "anomaly detection",
        ]
    }