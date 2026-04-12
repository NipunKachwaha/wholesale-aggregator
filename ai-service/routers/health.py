from fastapi import APIRouter
from utils.db import test_connection
import sys

router = APIRouter()

@router.get("/health")
async def health_check():
    db_status = test_connection()

    return {
        "success":  True,
        "service":  "ai-service",
        "status":   "ok" if db_status else "degraded",
        "version":  "1.0.0",
        "python":   sys.version,
        "checks": {
            "database": "healthy" if db_status else "unhealthy",
        }
    }