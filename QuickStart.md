# 🏪 Wholesale Aggregator

AI-Powered Wholesale Order Management System

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.11
- Docker Desktop

### Development

1. **Clone & Install**
```bash
git clone <repo-url>
cd wholesale-aggregator
npm install
```

2. **Start Docker Services**
```bash
npm run docker:up
```

3. **Start All Services**

Open separate terminals for each:

```bash
# Gateway
cd services/gateway && npm run dev

# Auth Service
cd services/auth-service && npm run dev

# Catalog Service
cd services/catalog-service && npm run dev

# Order Service
cd services/order-service && npm run dev

# Graphql Service
cd services/graphql-service && npm run dev

# Collab Service
cd services/collab-service && npm run dev

# AI Service
cd ai-service
venv\Scripts\Activate.ps1  # Windows
python -m uvicorn main:app --port 8000

# Frontend
cd frontend && npm run dev

# Mobile
cd mobile && npx expo start
```

4. **Open Browser**