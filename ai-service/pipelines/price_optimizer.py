import numpy as np
from typing import Optional, List

class PriceOptimizer:
    """
    Rule-based + Statistical price optimizer.
    Phase 2 mein ML model add hoga.
    """

    # Category ke hisaab se margin
    CATEGORY_MARGINS = {
        'Grains':     0.15,
        'Oils':       0.20,
        'Flour':      0.12,
        'Sugar':      0.10,
        'Spices':     0.25,
        'Pulses':     0.18,
        'Beverages':  0.30,
        'default':    0.20,
    }

    def optimize(
        self,
        sku:               str,
        current_price:     float,
        category:          Optional[str]        = None,
        stock_qty:         Optional[int]         = None,
        competitor_prices: Optional[List[float]] = None,
    ) -> dict:

        margin      = self.CATEGORY_MARGINS.get(
                        category or 'default',
                        self.CATEGORY_MARGINS['default']
                      )
        min_price   = current_price * 0.85
        max_price   = current_price * 1.30
        base_price  = current_price
        reasons     = []

        # ── Rule 1: Competitor pricing
        if competitor_prices and len(competitor_prices) > 0:
            avg_comp = np.mean(competitor_prices)
            if current_price > avg_comp * 1.10:
                base_price  = avg_comp * 1.05
                reasons.append(
                    f"Competitor average ₹{avg_comp:.2f} se 10% zyada tha"
                )
            elif current_price < avg_comp * 0.90:
                base_price = avg_comp * 0.95
                reasons.append(
                    f"Competitor se bahut kam — thoda badha sakte hain"
                )

        # ── Rule 2: Stock level
        if stock_qty is not None:
            if stock_qty > 500:
                base_price *= 0.95
                reasons.append("High stock — 5% discount suggest kiya")
            elif stock_qty < 50:
                base_price *= 1.08
                reasons.append("Low stock — 8% premium suggest kiya")

        # ── Rule 3: Margin apply
        suggested = round(
            max(min_price, min(base_price * (1 + margin * 0.3), max_price)),
            2
        )

        confidence = 0.75
        if competitor_prices:
            confidence += 0.10
        if stock_qty is not None:
            confidence += 0.05

        return {
            "sku":             sku,
            "current_price":   current_price,
            "suggested_price": suggested,
            "min_price":       round(min_price, 2),
            "max_price":       round(max_price, 2),
            "confidence":      round(min(confidence, 0.95), 2),
            "reasoning":       "; ".join(reasons) if reasons
                               else "Standard margin aur market analysis se suggest kiya",
        }

# Singleton instance
price_optimizer = PriceOptimizer()