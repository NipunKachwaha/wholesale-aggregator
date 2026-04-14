import re
from typing import Optional
from datetime import datetime, timedelta

class NLProcessor:
    """
    Natural Language → SQL/API Query Converter
    Hindi aur English dono support karta hai
    """

    # ── Intent patterns
    INTENTS = {
        'get_orders': [
            r'order', r'ऑर्डर', r'purchase', r'kharidar',
            r'pending', r'draft', r'confirmed', r'fulfilled',
        ],
        'get_products': [
            r'product', r'item', r'catalog', r'stock',
            r'sku', r'inventory', r'saman', r'maal',
        ],
        'get_vendors': [
            r'vendor', r'supplier', r'distributor',
            r'company', r'brand',
        ],
        'get_analytics': [
            r'analytics', r'report', r'revenue', r'total',
            r'summary', r'analysis', r'kitna', r'count',
        ],
        'price_check': [
            r'price', r'cost', r'rate', r'daam', r'kimat',
            r'how much', r'kitne ka',
        ],
    }

    # ── Status patterns
    STATUS_PATTERNS = {
        'draft':      [r'draft', r'new', r'naya', r'pending'],
        'confirmed':  [r'confirmed', r'confirm', r'approved'],
        'processing': [r'processing', r'process', r'chal raha'],
        'fulfilled':  [r'fulfilled', r'complete', r'delivered', r'deliver'],
        'cancelled':  [r'cancel', r'cancelled', r'band'],
    }

    # ── Time patterns
    TIME_PATTERNS = {
        'today':      [r'today', r'aaj', r'abhi'],
        'week':       [r'week', r'hafte', r'7 day', r'saat din'],
        'month':      [r'month', r'mahine', r'30 day', r'tees din'],
    }

    def process(self, query: str) -> dict:
        """Query process karo aur structured response do"""

        query_lower = query.lower().strip()

        # Intent detect karo
        intent     = self._detect_intent(query_lower)
        status     = self._detect_status(query_lower)
        time_range = self._detect_time(query_lower)
        search_term = self._extract_search_term(query_lower)
        sku        = self._extract_sku(query)

        # Response generate karo
        result = {
            "query":       query,
            "intent":      intent,
            "parameters": {
                "status":      status,
                "time_range":  time_range,
                "search":      search_term,
                "sku":         sku,
            },
            "sql":         None,
            "api_endpoint": None,
            "explanation": None,
        }

        # Intent ke hisaab se SQL banao
        if intent == 'get_orders':
            result = self._build_orders_query(result, status, time_range)
        elif intent == 'get_products':
            result = self._build_products_query(result, search_term, sku)
        elif intent == 'get_vendors':
            result = self._build_vendors_query(result)
        elif intent == 'get_analytics':
            result = self._build_analytics_query(result, time_range)
        elif intent == 'price_check':
            result = self._build_price_query(result, sku, search_term)
        else:
            result['explanation'] = "Query samajh nahi aaya — orders, products, vendors, ya analytics ke baare mein poochho"
            result['intent']      = 'unknown'

        return result

    def _detect_intent(self, query: str) -> str:
        scores = {}
        for intent, patterns in self.INTENTS.items():
            score = sum(1 for p in patterns if re.search(p, query))
            if score > 0:
                scores[intent] = score

        return max(scores, key=scores.get) if scores else 'unknown'

    def _detect_status(self, query: str) -> Optional[str]:
        for status, patterns in self.STATUS_PATTERNS.items():
            if any(re.search(p, query) for p in patterns):
                return status
        return None

    def _detect_time(self, query: str) -> Optional[str]:
        for time_key, patterns in self.TIME_PATTERNS.items():
            if any(re.search(p, query) for p in patterns):
                return time_key
        return None

    def _extract_sku(self, query: str) -> Optional[str]:
        # SKU pattern: uppercase letters + hyphen + numbers
        match = re.search(r'\b([A-Z]{2,10}-\d{3,5})\b', query)
        return match.group(1) if match else None

    def _extract_search_term(self, query: str) -> Optional[str]:
        # Common words hatao
        stop_words = [
            'show', 'me', 'get', 'find', 'list', 'all', 'the',
            'order', 'product', 'vendor', 'dikhao', 'batao',
            'karo', 'hai', 'hain', 'ka', 'ki', 'ke',
        ]
        words = query.split()
        terms = [w for w in words if w not in stop_words and len(w) > 2]
        return ' '.join(terms[:3]) if terms else None

    def _build_orders_query(self, result, status, time_range):
        where_clauses = ["tenant_id = $1"]
        explanation   = "Orders"

        if status:
            where_clauses.append(f"status = '{status}'")
            explanation += f" jo {status} hain"

        if time_range == 'today':
            where_clauses.append("DATE(created_at) = CURRENT_DATE")
            explanation += " aaj ke"
        elif time_range == 'week':
            where_clauses.append("created_at >= NOW() - INTERVAL '7 days'")
            explanation += " pichhle hafte ke"
        elif time_range == 'month':
            where_clauses.append("created_at >= NOW() - INTERVAL '30 days'")
            explanation += " pichhle mahine ke"

        where_sql = ' AND '.join(where_clauses)

        result['sql'] = f"""
            SELECT id, status, total_amount,
                   created_at, line_items
            FROM orders
            WHERE {where_sql}
            ORDER BY created_at DESC
            LIMIT 20
        """
        result['api_endpoint'] = '/orders'
        result['explanation']  = explanation + " dhundh raha hoon..."
        result['intent']       = 'get_orders'
        result['parameters']['status'] = status

        return result

    def _build_products_query(self, result, search, sku):
        where_clauses = ["tenant_id = $1", "is_active = true"]
        explanation   = "Products"

        if sku:
            where_clauses.append(f"sku = '{sku}'")
            explanation += f" SKU {sku} ke liye"
        elif search:
            where_clauses.append(
                f"(name ILIKE '%{search}%' OR sku ILIKE '%{search}%' OR category ILIKE '%{search}%')"
            )
            explanation += f" '{search}' se related"

        where_sql = ' AND '.join(where_clauses)

        result['sql'] = f"""
            SELECT sku, name, category,
                   base_price, stock_qty, unit
            FROM products
            WHERE {where_sql}
            ORDER BY name
            LIMIT 20
        """
        result['api_endpoint'] = '/catalog/products'
        result['explanation']  = explanation + " dhundh raha hoon..."
        return result

    def _build_vendors_query(self, result):
        result['sql'] = """
            SELECT id, name, feed_type,
                   reliability_score, last_synced_at
            FROM vendors
            WHERE tenant_id = $1 AND is_active = true
            ORDER BY name
        """
        result['api_endpoint'] = '/catalog/vendors'
        result['explanation']  = "Saare active vendors dhundh raha hoon..."
        return result

    def _build_analytics_query(self, result, time_range):
        interval = "30 days"
        if time_range == 'today':   interval = "1 day"
        elif time_range == 'week':  interval = "7 days"

        result['sql'] = f"""
            SELECT
                COUNT(*)                           AS total_orders,
                SUM(total_amount)                  AS total_revenue,
                AVG(total_amount)                  AS avg_order_value,
                COUNT(CASE WHEN status='fulfilled'
                      THEN 1 END)                  AS fulfilled_orders
            FROM orders
            WHERE tenant_id = $1
              AND created_at >= NOW() - INTERVAL '{interval}'
        """
        result['api_endpoint'] = '/analytics'
        result['explanation']  = f"Pichhle {interval} ki analytics..."
        return result

    def _build_price_query(self, result, sku, search):
        where = f"sku = '{sku}'" if sku else f"name ILIKE '%{search}%'"

        result['sql'] = f"""
            SELECT sku, name, base_price, unit, stock_qty
            FROM products
            WHERE tenant_id = $1
              AND {where}
              AND is_active = true
        """
        result['api_endpoint'] = '/catalog/products'
        result['explanation']  = f"Price dhundh raha hoon..."
        return result


# Singleton
nl_processor = NLProcessor()