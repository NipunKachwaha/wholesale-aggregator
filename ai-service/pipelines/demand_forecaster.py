import numpy as np
from datetime import datetime, timedelta
from typing import List
import random

class DemandForecaster:
    """
    Statistical demand forecaster.
    Abhi synthetic data use karta hai —
    Phase 2 mein real order history se train hoga.
    """

    def forecast(
        self,
        sku:       str,
        tenant_id: str,
        days:      int = 30,
    ) -> dict:

        # Seed for reproducibility
        seed = sum(ord(c) for c in sku)
        rng  = np.random.default_rng(seed)

        # Base demand — SKU se derive karo
        base_demand = rng.integers(50, 300)
        trend_rate  = rng.uniform(-0.02, 0.05)  # daily trend

        forecasts   = []
        today       = datetime.now()

        for i in range(1, days + 1):
            date     = today + timedelta(days=i)

            # Seasonal factor (weekend boost)
            seasonal = 1.2 if date.weekday() >= 5 else 1.0

            # Trend
            trend    = 1 + (trend_rate * i)

            # Noise
            noise    = rng.normal(1.0, 0.08)

            predicted = max(0, base_demand * seasonal * trend * noise)
            margin    = predicted * 0.15

            forecasts.append({
                "date":      date.strftime("%Y-%m-%d"),
                "predicted": round(predicted, 1),
                "lower":     round(max(0, predicted - margin), 1),
                "upper":     round(predicted + margin, 1),
            })

        # Trend summary
        first_week = np.mean([f["predicted"] for f in forecasts[:7]])
        last_week  = np.mean([f["predicted"] for f in forecasts[-7:]])

        if last_week > first_week * 1.05:
            trend   = "increasing"
            summary = f"Demand {days} dinon mein badhne ki umeed hai. Avg: {np.mean([f['predicted'] for f in forecasts]):.0f} units/day"
        elif last_week < first_week * 0.95:
            trend   = "decreasing"
            summary = f"Demand thodi kam hogi. Stock kam rakhein."
        else:
            trend   = "stable"
            summary = f"Demand stable rahegi. Avg: {np.mean([f['predicted'] for f in forecasts]):.0f} units/day"

        return {
            "sku":       sku,
            "forecasts": forecasts,
            "trend":     trend,
            "summary":   summary,
        }

# Singleton
demand_forecaster = DemandForecaster()