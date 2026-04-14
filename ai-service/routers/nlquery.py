from fastapi import APIRouter
from models.schemas import NLQueryRequest, NLQueryResponse
from pipelines.nl_processor import nl_processor
from utils.db import engine
from sqlalchemy import text

router = APIRouter(prefix="/ai", tags=["NL Query"])

TENANT_ID = '00000000-0000-0000-0000-000000000001'

@router.post("/query", response_model=NLQueryResponse)
async def natural_language_query(request: NLQueryRequest):
    """
    Natural language se data query karo.
    Hindi aur English dono support.
    """

    # Query process karo
    processed = nl_processor.process(request.query)

    results = []
    total   = 0

    # SQL execute karo agar intent valid hai
    if processed.get('sql') and processed.get('intent') != 'unknown' and request.execute:
        try:
            with engine.connect() as conn:
                tenant_id = request.tenant_id or TENANT_ID

                # SQL mein $1 ko :tenant_id se replace karo
                sql = processed['sql'].replace('$1', ':tenant_id')

                result = conn.execute(
                    text(sql),
                    {"tenant_id": tenant_id}
                )
                rows    = result.fetchall()
                columns = result.keys()
                results = [dict(zip(columns, row)) for row in rows]
                total   = len(results)

                # Amount/price fields ko float karo
                for row in results:
                    for key, val in row.items():
                        if val is not None and hasattr(val, '__float__'):
                            try:
                                row[key] = float(val)
                            except:
                                pass
                        # datetime to string
                        if hasattr(val, 'isoformat'):
                            row[key] = val.isoformat()

        except Exception as e:
            processed['explanation'] = f"Query execute nahi ho paya: {str(e)}"
            results = []

    return NLQueryResponse(
        query        = request.query,
        intent       = processed.get('intent', 'unknown'),
        explanation  = processed.get('explanation', ''),
        sql          = processed.get('sql'),
        api_endpoint = processed.get('api_endpoint'),
        results      = results,
        total        = total,
        parameters   = processed.get('parameters'),
    )


@router.get("/query/examples")
async def get_query_examples():
    """Example queries jo aap kar sakte hain"""
    return {
        "examples": [
            # Orders
            "show me all draft orders",
            "pending orders dikhao",
            "aaj ke confirmed orders",
            "fulfilled orders this week",
            "cancelled orders is month",

            # Products
            "show all products",
            "RICE-001 ka stock",
            "Grains category products",
            "low stock items",

            # Vendors
            "show all vendors",
            "active suppliers list",

            # Analytics
            "total revenue this month",
            "order count today",
            "analytics summary",

            # Price
            "RICE-001 ka price",
            "oil products price",
        ]
    }