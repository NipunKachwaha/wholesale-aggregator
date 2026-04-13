#!/bin/bash
echo "🚀 Starting Wholesale Aggregator (Development)..."
echo "─────────────────────────────────────────────────"

# Docker containers start karo
echo "🐳 Starting Docker services..."
cd infra && docker compose up -d && cd ..

# Wait karo
echo "⏳ Waiting for databases..."
sleep 5

# Services start karo background mein
echo "📦 Starting Node services..."
cd services/gateway       && npm run dev &
cd services/auth-service  && npm run dev &
cd services/catalog-service && npm run dev &
cd services/order-service  && npm run dev &

# AI Service
echo "🤖 Starting AI service..."
cd ai-service
source venv/bin/activate 2>/dev/null || venv\Scripts\activate
python -m uvicorn main:app --port 8000 &

# Frontend
echo "⚛️  Starting Frontend..."
cd frontend && npm run dev &

echo ""
echo "✅ All services starting..."
echo "─────────────────────────────────────────────────"
echo "🌐 Frontend:       http://localhost:5173"
echo "🔌 Gateway:        http://localhost:3000"
echo "🔑 Auth:           http://localhost:3001"
echo "📦 Catalog:        http://localhost:3002"
echo "🛒 Orders:         http://localhost:3003"
echo "🤖 AI:             http://localhost:8000"
echo "─────────────────────────────────────────────────"

wait