#!/bin/bash
set -e

echo "🏗️  Building Wholesale Aggregator for Production..."
echo "─────────────────────────────────────────────────"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Root check
cd "$(dirname "$0")/.."

# 1. Node services build
echo "📦 Building Node services..."
services=("gateway" "auth-service" "catalog-service" "order-service")
for service in "${services[@]}"; do
  echo "  Building $service..."
  cd "services/$service"
  npm install && npm run build
  cd "../.."
  echo -e "  ${GREEN}✅ $service built${NC}"
done

# 2. Frontend build
echo "⚛️  Building Frontend..."
cd frontend && npm install && npm run build && cd ..
echo -e "${GREEN}✅ Frontend built${NC}"

# 3. Docker images
echo "🐳 Building Docker images..."
docker build -t wholesale-gateway:latest  services/gateway/
docker build -t wholesale-auth:latest     services/auth-service/
docker build -t wholesale-catalog:latest  services/catalog-service/
docker build -t wholesale-orders:latest   services/order-service/
docker build -t wholesale-ai:latest       ai-service/
docker build -t wholesale-frontend:latest frontend/

echo -e "${GREEN}✅ All Docker images built${NC}"

# 4. Start production stack
echo "🚀 Starting production stack..."
cd infra
docker compose -f docker-compose.prod.yml \
  --env-file .env.prod \
  up -d

echo ""
echo -e "${GREEN}🎉 Production deployment complete!${NC}"
echo "─────────────────────────────────────────────────"
echo "🌐 Frontend:  http://localhost"
echo "🔌 API:       http://localhost/api/v1"
echo "🤖 AI:        http://localhost/ai"
echo "─────────────────────────────────────────────────"