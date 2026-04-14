from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ── Price Optimization
class PriceOptimizeRequest(BaseModel):
    sku:          str
    tenant_id:    str
    current_price: float
    category:     Optional[str] = None
    stock_qty:    Optional[int] = None
    competitor_prices: Optional[List[float]] = None

class PriceOptimizeResponse(BaseModel):
    sku:             str
    current_price:   float
    suggested_price: float
    min_price:       float
    max_price:       float
    confidence:      float
    reasoning:       str

# ── Demand Forecast
class ForecastRequest(BaseModel):
    sku:       str
    tenant_id: str
    days:      Optional[int] = 30

class ForecastPoint(BaseModel):
    date:       str
    predicted:  float
    lower:      float
    upper:      float

class ForecastResponse(BaseModel):
    sku:       str
    forecasts: List[ForecastPoint]
    trend:     str
    summary:   str

# ── Anomaly Detection
class AnomalyRequest(BaseModel):
    tenant_id: str
    days:      Optional[int] = 7

class AnomalyItem(BaseModel):
    order_id:   str
    amount:     float
    z_score:    float
    is_anomaly: bool
    reason:     str

class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyItem]
    total:     int
    checked:   int
    
# ── NL Query
class NLQueryRequest(BaseModel):
    query:     str
    tenant_id: str
    execute:   Optional[bool] = True

class NLQueryResponse(BaseModel):
    query:        str
    intent:       str
    explanation:  str
    sql:          Optional[str]      = None
    api_endpoint: Optional[str]      = None
    results:      Optional[List[dict]] = None
    total:        Optional[int]      = None
    parameters:   Optional[dict]     = None