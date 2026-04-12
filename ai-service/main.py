from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import health, pricing, forecast
from utils.db import test_connection

# ── FastAPI app
app = FastAPI(
    title       = "Wholesale AI Service",
    description = "AI-powered pricing, forecasting, and anomaly detection",
    version     = "1.0.0",
)

# ── CORS
origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins     = origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers
app.include_router(health.router)
app.include_router(pricing.router)
app.include_router(forecast.router)

# ── Startup
@app.on_event("startup")
async def startup():
    print("─────────────────────────────────────")
    print("✅ AI Service starting...")
    test_connection()
    print(f"🌐 URL:  http://localhost:{os.getenv('APP_PORT', '8000')}")
    print(f"📚 Docs: http://localhost:{os.getenv('APP_PORT', '8000')}/docs")
    print("─────────────────────────────────────")

# ── Root
@app.get("/")
async def root():
    return {
        "service": "wholesale-ai-service",
        "version": "1.0.0",
        "docs":    "/docs",
    }