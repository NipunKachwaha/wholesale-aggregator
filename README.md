# 🏪 Wholesale Aggregator

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![CI/CD](https://img.shields.io/github/actions/workflow/status/your-username/wholesale-aggregator/ci.yml?branch=main)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**An AI-powered, enterprise-grade wholesale order management system built for modern supply chains.**

[Live Demo](https://wholesale-aggregator.demo.com) · [Documentation](https://docs.wholesale-aggregator.com) · [Report Bug](https://github.com/your-username/wholesale-aggregator/issues) · [Request Feature](https://github.com/your-username/wholesale-aggregator/issues)

![Dashboard Preview](https://via.placeholder.com/900x500/1e293b/ffffff?text=Wholesale+Aggregator+Dashboard)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [User Personas](#-user-personas)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
- [Environment Configuration](#-environment-configuration)
- [Testing](#-testing)
- [Build & Deployment](#-build--deployment)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [Known Issues & Roadmap](#-known-issues--roadmap)
- [License](#-license)
- [Authors & Acknowledgments](#-authors--acknowledgments)

---

## 🎯 About The Project

**Wholesale Aggregator** is a full-stack, AI-powered order management platform designed for wholesalers, suppliers, and purchasing agents. It aggregates product catalogs from multiple vendor feeds (CSV, REST APIs, webhooks), consolidates bulk orders intelligently, and uses machine learning to optimize pricing and forecast demand — all in real time.

### Why Wholesale Aggregator?

Traditional wholesale operations are fragmented — vendors use different formats, pricing is manual, and order tracking is spreadsheet-driven. Wholesale Aggregator solves this by:

- **Unifying** product catalogs from any vendor feed format into a normalized database
- **Automating** order consolidation to reduce procurement costs by up to 18%
- **Predicting** demand using Facebook Prophet time-series models with Indian holiday calendars
- **Optimizing** pricing using ML models trained on historical sales and competitor data
- **Enabling** natural language queries in both Hindi and English ("show me all draft orders")

Built with a microservices architecture, it scales from a small trading company to an enterprise with hundreds of tenants.

---

## ✨ Key Features

### Core Platform
- 🏭 **Multi-vendor Catalog Aggregation** — CSV, REST API, Excel, Webhook feeds
- 🛒 **Order Management** — Full lifecycle with status machine (draft → confirmed → processing → fulfilled)
- 🔀 **AI Order Consolidation** — Auto-merge similar orders with bulk discount calculation
- 📦 **Real-time Inventory Tracking** — Stock alerts and low-inventory notifications
- 🏢 **Multi-tenant Architecture** — Isolated data per tenant with plan-based access

### AI & Analytics
- 🤖 **NL Query Engine** — Natural language queries in Hindi & English
- 💰 **AI Price Optimization** — ML-based dynamic pricing suggestions
- 📈 **Prophet Demand Forecasting** — 30-day predictions with seasonality & holidays
- 🎯 **Anomaly Detection** — Isolation Forest for unusual order patterns
- 📊 **Advanced Analytics** — Revenue trends, vendor performance radar, category distribution

### Developer Features
- 🔍 **Elasticsearch Search** — Full-text, fuzzy search with highlights and filters
- 🌐 **GraphQL API** — Full schema with DataLoader, pagination, mutations
- 📡 **WebSocket Notifications** — Real-time events with tenant-aware broadcast
- 🤝 **Collaborative Editing** — Multi-user order editing with live cursors and team chat
- 📄 **PDF Export** — Professional reports with KPIs, tables, and charts

### Security & Auth
- 🔐 **JWT Authentication** — Access + refresh token rotation
- 🛡️ **RBAC** — Role-based access (admin / purchaser / viewer / supplier)
- 📱 **Two-Factor Authentication** — TOTP with QR code and backup codes
- 🚫 **Brute Force Protection** — Account lockout after 5 failed attempts
- 📝 **Audit Trail** — All sensitive actions logged with IP and user context

### UX & Accessibility
- 🌙 **Dark Mode** — Class-based Tailwind dark mode with localStorage persistence
- 🌐 **i18n** — English and Hindi with one-click toggle
- 📱 **Mobile Responsive** — Drawer sidebar, touch-friendly, responsive grids
- 💳 **Stripe Payments** — INR checkout with UPI, card, net banking
- 🤖 **AI Chatbot** — Groq LLaMA 3.3 70B with streaming responses
- ✨ **GSAP Animations** — Smooth entrance, hover, and transition effects

---

## 👥 User Personas

| Persona | Role | Primary Use Cases |
|---------|------|-------------------|
| **Aarav — Wholesale Manager** | `admin` | Full system access, tenant management, analytics, user administration |
| **Priya — Purchasing Agent** | `purchaser` | Create/approve orders, price optimization, vendor sync, consolidation |
| **Rajan — Store Viewer** | `viewer` | Read-only access to catalog, orders, and reports |
| **Meera — Supplier** | `supplier` | Manage own product listings, sync inventory feeds |
| **DevOps Engineer** | `system` | CI/CD, Kubernetes, monitoring, infrastructure management |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Redux Toolkit | 2.x | State management |
| React Router | 6.x | Client-side routing |
| Recharts | 2.x | Data visualization |
| GSAP | 3.x | Animations |
| Apollo Client | 3.x | GraphQL client |
| i18next | 23.x | Internationalization |

### Backend (Node.js Microservices)
| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| API Gateway | 3000 | Express + WS | Request routing, JWT validation, WebSocket |
| Auth Service | 3001 | Express + bcrypt | Login, 2FA, token management |
| Catalog Service | 3002 | Express + PDFKit | Vendor sync, product CRUD, PDF reports |
| Order Service | 3003 | Express + Stripe | Order lifecycle, consolidation, payments |
| GraphQL Service | 4000 | Apollo Server 4 | Unified GraphQL API |
| Collab Service | 3004 | ws | Real-time collaborative editing |

### AI Service
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.109 | REST API framework |
| Prophet | 1.1.5 | Demand forecasting |
| scikit-learn | 1.4 | Price optimization, anomaly detection |
| SQLAlchemy | 2.x | Database ORM |
| Groq SDK | latest | LLM chatbot (LLaMA 3.3 70B) |

### Data Layer
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 16 | Core relational data (orders, users, products) |
| MongoDB 7 | Raw vendor feeds, product catalogs |
| Redis 7 | Caching, sessions, rate limiting |
| Elasticsearch 8 | Full-text product search |
| MinIO | S3-compatible file storage (CSV uploads) |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Docker + Compose | Containerization |
| Kubernetes | Orchestration, HPA auto-scaling |
| GitHub Actions | CI/CD pipeline |
| Nginx | Reverse proxy, static serving |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│    React (Web)  │  React Native (Mobile)  │  GraphQL Clients    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────▼─────────────────────────────────────┐
│                     NGINX REVERSE PROXY                          │
│              SSL Termination · Load Balancing                    │
└──────┬───────────┬──────────┬──────────┬────────────────────────┘
       │           │          │          │
┌──────▼──┐  ┌─────▼──┐  ┌───▼───┐  ┌──▼──────┐
│Gateway  │  │ Auth   │  │Catalog│  │ Orders  │
│:3000    │  │ :3001  │  │ :3002 │  │  :3003  │
│WS /ws   │  │ JWT+2FA│  │ ES    │  │ Stripe  │
└──────┬──┘  └────────┘  └───────┘  └─────────┘
       │
┌──────▼──────────────────────────────────────┐
│              AI SERVICE (Python FastAPI)      │
│    Prophet · scikit-learn · NL Processor     │
│    Price Optimizer · Anomaly Detector        │
└──────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│                  DATA LAYER                  │
│  PostgreSQL │ MongoDB │ Redis │ Elasticsearch │
└─────────────────────────────────────────────┘
```

---

## 📌 Prerequisites

Before you begin, ensure you have the following installed:

```bash
node  --version   # >= 18.0.0
npm   --version   # >= 9.0.0
python --version  # >= 3.11.0
docker --version  # >= 24.0.0
git   --version   # >= 2.0.0
```

**Optional but recommended:**
- [VS Code](https://code.visualstudio.com/) with ESLint, Tailwind CSS IntelliSense extensions
- [Postman](https://www.postman.com/) for API testing
- [TablePlus](https://tableplus.com/) or pgAdmin for database inspection
- [Expo Go](https://expo.dev/client) for mobile app testing

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wholesale-aggregator.git
cd wholesale-aggregator
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Service Dependencies

```bash
# All Node.js services
cd services/gateway        && npm install && cd ../..
cd services/auth-service   && npm install && cd ../..
cd services/catalog-service && npm install && cd ../..
cd services/order-service  && npm install && cd ../..
cd services/graphql-service && npm install && cd ../..
cd services/collab-service  && npm install && cd ../..

# Frontend
cd frontend && npm install && cd ..

# Python AI Service
cd ai-service
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
code .env
```

See [Environment Configuration](#-environment-configuration) for all required variables.

### 5. Start Infrastructure

```bash
# Start all Docker services
npm run docker:up

# Verify all containers are healthy
npm run docker:status
```

Expected output:
```
NAMES                    STATUS              PORTS
wholesale_postgres       Up (healthy)        0.0.0.0:5432->5432/tcp
wholesale_mongo          Up (healthy)        0.0.0.0:27017->27017/tcp
wholesale_redis          Up (healthy)        0.0.0.0:6379->6379/tcp
wholesale_minio          Up (healthy)        0.0.0.0:9000->9000/tcp
wholesale_elasticsearch  Up (healthy)        0.0.0.0:9200->9200/tcp
```

---

## 🚀 Quick Start

### Option A — Start All Services (7 Terminals)

```bash
# Terminal 1 — API Gateway
cd services/gateway && npm run dev

# Terminal 2 — Auth Service
cd services/auth-service && npm run dev

# Terminal 3 — Catalog Service
cd services/catalog-service && npm run dev

# Terminal 4 — Order Service
cd services/order-service && npm run dev

# Terminal 5 — AI Service
cd ai-service
source venv/bin/activate    # or venv\Scripts\Activate.ps1 on Windows
python -m uvicorn main:app --port 8000

# Terminal 6 — GraphQL Service
cd services/graphql-service && npm run dev

# Terminal 7 — Frontend
cd frontend && npm run dev
```

### Option B — Docker Compose (All at Once)

```bash
cd infra
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Web App** | http://localhost:5173 | admin@demo.com / Admin@1234 |
| **API Gateway** | http://localhost:3000 | — |
| **GraphQL Playground** | http://localhost:4000/graphql | — |
| **AI Service Docs** | http://localhost:8000/docs | — |
| **pgAdmin** | http://localhost:5050 | admin@wholesale.dev / pgadmin_dev |
| **Kibana** | http://localhost:5601 | — |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |

---

## 💡 Usage Examples

### REST API — Authentication

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Admin@1234"}'

# Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "admin@demo.com", "role": "admin" },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
      "expiresIn": "15m"
    }
  }
}
```

### REST API — Product Search (Elasticsearch)

```bash
# Full-text search with filters
curl "http://localhost:3002/catalog/search?\
  tenantId=00000000-0000-0000-0000-000000000001\
  &q=rice\
  &category=Grains\
  &minPrice=50\
  &maxPrice=200\
  &sortBy=price_asc"

# Response
{
  "success": true,
  "data": {
    "hits": [
      {
        "sku": "RICE-001",
        "name": "Basmati Rice Premium",
        "basePrice": 120.50,
        "stockQty": 500,
        "highlight": { "name": ["<mark>Rice</mark> Premium"] }
      }
    ],
    "total": 3,
    "took": 12
  }
}
```

### REST API — AI Price Optimization

```bash
curl -X POST http://localhost:8000/ai/optimize-price \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "RICE-001",
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "current_price": 120.50,
    "category": "Grains",
    "stock_qty": 500,
    "competitor_prices": [115.00, 125.00, 118.00]
  }'

# Response
{
  "sku": "RICE-001",
  "current_price": 120.50,
  "suggested_price": 114.48,
  "min_price": 102.43,
  "max_price": 156.65,
  "confidence": 0.90,
  "reasoning": "High stock — 5% discount; Competitor avg ₹119.33"
}
```

### GraphQL API

```graphql
# Get products with vendor details
query GetProducts {
  products(
    tenantId: "00000000-0000-0000-0000-000000000001"
    filter: { category: "Grains", minStock: 100 }
    pagination: { page: 1, limit: 10 }
  ) {
    nodes {
      sku
      name
      basePrice
      stockQty
      vendor {
        name
        feedType
        reliabilityScore
      }
    }
    total
    totalPages
  }
}
```

```graphql
# Create an order
mutation CreateOrder {
  createOrder(
    tenantId: "00000000-0000-0000-0000-000000000001"
    input: {
      lineItems: [
        { sku: "RICE-001", quantity: 50, unitPrice: 120.50 }
        { sku: "OIL-001",  quantity: 20, unitPrice: 180.00 }
      ]
      notes: "Urgent delivery required"
    }
  ) {
    id
    status
    totalAmount
  }
}
```

### NL Query Engine

```bash
curl -X POST http://localhost:8000/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "show me all confirmed orders from this week",
    "tenant_id": "00000000-0000-0000-0000-000000000001"
  }'

# Also works in Hindi
curl -X POST http://localhost:8000/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "RICE-001 ka stock kitna hai",
    "tenant_id": "00000000-0000-0000-0000-000000000001"
  }'
```

### CSV Vendor Feed Sync

```bash
# Upload and sync a CSV product feed
curl -X POST http://localhost:3002/catalog/sync/csv \
  -F "file=@products.csv" \
  -F "vendorId=11111111-1111-1111-1111-111111111111" \
  -F "tenantId=00000000-0000-0000-0000-000000000001"

# Response
{
  "success": true,
  "data": {
    "total": 150,
    "inserted": 142,
    "updated": 8,
    "failed": 0,
    "errors": []
  }
}
```

### Order Consolidation

```bash
# Get consolidation suggestions
curl "http://localhost:3003/orders/consolidation/suggestions\
  ?tenantId=00000000-0000-0000-0000-000000000001"

# Consolidate orders
curl -X POST http://localhost:3003/orders/consolidate \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": [
      "order-uuid-1",
      "order-uuid-2",
      "order-uuid-3"
    ],
    "tenantId": "00000000-0000-0000-0000-000000000001"
  }'

# Response
{
  "success": true,
  "message": "3 orders consolidate ho gaye!",
  "data": {
    "saving": 245.50,
    "cancelledOrders": ["uuid-1", "uuid-2", "uuid-3"],
    "consolidatedOrder": { "id": "new-uuid", "totalAmount": 4660.50 }
  }
}
```

### WebSocket Connection (JavaScript)

```javascript
// Connect with JWT token
const token = localStorage.getItem('accessToken')
const ws    = new WebSocket(`ws://localhost:3000/ws?token=${token}`)

ws.onopen = () => console.log('Connected to real-time notifications')

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  console.log(`[${notification.type}] ${notification.title}: ${notification.message}`)
}

// Trigger a manual event (server-side)
// POST http://localhost:3000/internal/events
// Body: { event: "order:created", tenantId: "...", data: { ... } }
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and fill in all required values:

```dotenv
# ── Application
NODE_ENV=development
APP_PORT=3000

# ── PostgreSQL (Required)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=wholesale_db
POSTGRES_USER=wholesale_user
POSTGRES_PASSWORD=changeme_dev        # Change in production!

# ── MongoDB (Required)
MONGO_URI=mongodb://localhost:27017/wholesale_catalog

# ── Redis (Required)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispass_dev          # Change in production!

# ── Elasticsearch (Optional — falls back to PostgreSQL)
ES_URL=http://localhost:9200

# ── JWT (Required — min 32 characters)
JWT_SECRET=your_super_secret_key_min_32_chars_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ── Service Ports
AUTH_SERVICE_PORT=3001
CATALOG_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003
GRAPHQL_PORT=4000
COLLAB_PORT=3004

# ── MinIO / S3
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=wholesale-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123

# ── AI Service
AI_SERVICE_URL=http://localhost:8000

# ── Groq AI Chatbot (get key from console.groq.com)
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# ── Stripe Payments (get keys from dashboard.stripe.com/test)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# ── Email (Ethereal for dev — ethereal.email)
EMAIL_USER=your_ethereal_user
EMAIL_PASS=your_ethereal_pass
EMAIL_FROM=noreply@wholesale.dev
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
```

### Getting API Keys

| Service | URL | Notes |
|---------|-----|-------|
| **Groq API** | https://console.groq.com/keys | Free tier available — LLaMA 3.3 70B |
| **Stripe Test** | https://dashboard.stripe.com/test/apikeys | Use `sk_test_` keys for development |
| **Ethereal Email** | https://ethereal.email | Auto-generate test SMTP credentials |

### Production Security Checklist

```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong passwords
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- [ ] Change all default passwords
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS in production (update CORS origins)
- [ ] Enable PostgreSQL SSL: add `ssl: { rejectUnauthorized: false }`
- [ ] Set up Redis `AUTH` password
- [ ] Configure proper CORS origins (not `*`)
- [ ] Enable rate limiting in production config
- [ ] Set up Stripe webhooks endpoint

---

## 🧪 Testing

### Run All Tests

```bash
npm run test --workspaces --if-present
```

### Service-Level Tests

```bash
# Gateway
cd services/gateway && npm test

# Auth Service
cd services/auth-service && npm test

# AI Service
cd ai-service
python -m pytest tests/ -v
```

### Manual API Testing

A full Postman collection is available:

```bash
# Import into Postman
# File: docs/postman/wholesale-aggregator.json
```

Or test key endpoints manually:

```bash
# Health check — all services
curl http://localhost:3000/health   # Gateway
curl http://localhost:3001/health   # Auth
curl http://localhost:3002/health   # Catalog
curl http://localhost:3003/health   # Orders
curl http://localhost:4000/health   # GraphQL
curl http://localhost:8000/health   # AI Service

# Full login + protected request flow
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Admin@1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")

curl http://localhost:3000/api/v1/test/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### AI Model Tests

```bash
cd ai-service

# Price optimizer
python -c "
from pipelines.price_optimizer import price_optimizer
r = price_optimizer.optimize('RICE-001', 120.50, 'Grains', 500)
assert r['suggested_price'] > 0
print('✅ Price optimizer passed')
"

# Demand forecaster
python -c "
from pipelines.prophet_forecaster import prophet_forecaster
r = prophet_forecaster.forecast('RICE-001', 'test-tenant', 7)
assert len(r['forecasts']) == 7
print('✅ Demand forecaster passed:', r['model'])
"

# NL processor
python -c "
from pipelines.nl_processor import nl_processor
r = nl_processor.process('show me all draft orders')
assert r['intent'] == 'get_orders'
print('✅ NL processor passed')
"
```

### Frontend E2E Tests

```bash
cd frontend

# Unit tests
npm run test

# Build test
npm run build
```

---

## 🏗️ Build & Deployment

### Build for Production

```bash
# Build all Node.js services
for service in gateway auth-service catalog-service order-service graphql-service; do
  echo "Building $service..."
  cd services/$service && npm run build && cd ../..
done

# Build frontend
cd frontend && npm run build && cd ..
# Output: frontend/dist/

# Python service (no build needed — uvicorn serves directly)
```

### Docker Build

```bash
# Build individual service image
docker build -t wholesale-gateway:latest   services/gateway/
docker build -t wholesale-auth:latest      services/auth-service/
docker build -t wholesale-catalog:latest   services/catalog-service/
docker build -t wholesale-orders:latest    services/order-service/
docker build -t wholesale-ai:latest        ai-service/
docker build -t wholesale-frontend:latest  frontend/

# Or build all at once
docker compose -f infra/docker-compose.prod.yml build
```

### Production Docker Compose

```bash
# Create production env file
cp infra/.env.prod.example infra/.env.prod
# Edit with production values

# Start full production stack
cd infra
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f gateway
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
# https://kubernetes.io/docs/tasks/tools/

# Verify cluster connection
kubectl cluster-info
```

### Deploy to Kubernetes

```bash
# Make deploy script executable
chmod +x scripts/k8s-deploy.sh

# Deploy everything
./scripts/k8s-deploy.sh

# Check all pods
kubectl get pods -n wholesale

# Expected output
NAME                          READY   STATUS    RESTARTS
gateway-7d9f8b9c4-xp2kl       1/1     Running   0
gateway-7d9f8b9c4-mn3qr       1/1     Running   0
auth-service-6c8b7d5f9-lk4ws  1/1     Running   0
ai-service-5f4d3c2b1-vn7xt    1/1     Running   0
postgres-0                    1/1     Running   0
redis-59d4f8c6b-qm2jk         1/1     Running   0
```

### Scale Services

```bash
# Manually scale gateway
kubectl scale deployment gateway --replicas=5 -n wholesale

# Check HPA status
kubectl get hpa -n wholesale
```

### CI/CD Pipeline (GitHub Actions)

The pipeline at `.github/workflows/ci.yml` automatically:

1. **On every push to `develop`** — runs tests for all services
2. **On every push to `main`** — runs tests + builds Docker images
3. **On merge to `main`** — deploys to production

```yaml
# Trigger manually
gh workflow run ci.yml --ref main
```

---

## 📚 API Documentation

### REST Endpoints Summary

| Method | Endpoint | Service | Auth | Description |
|--------|----------|---------|------|-------------|
| `POST` | `/auth/login` | Auth | ❌ | Login with email/password |
| `POST` | `/auth/register` | Auth | ❌ | Register new user |
| `POST` | `/auth/refresh` | Auth | ❌ | Refresh access token |
| `GET`  | `/auth/me` | Auth | ✅ | Get current user |
| `POST` | `/auth/2fa/setup` | Auth | ✅ | Setup 2FA |
| `POST` | `/auth/2fa/enable` | Auth | ✅ | Enable 2FA |
| `GET`  | `/catalog/products` | Catalog | ✅ | List products |
| `GET`  | `/catalog/search` | Catalog | ✅ | Elasticsearch search |
| `POST` | `/catalog/sync/csv` | Catalog | ✅ | Upload CSV feed |
| `POST` | `/catalog/sync/api` | Catalog | ✅ | Sync from API endpoint |
| `GET`  | `/catalog/reports/products` | Catalog | ✅ | Download PDF report |
| `GET`  | `/orders` | Orders | ✅ | List orders |
| `POST` | `/orders` | Orders | ✅ | Create order |
| `PATCH`| `/orders/:id/status` | Orders | ✅ | Update status |
| `POST` | `/orders/consolidate` | Orders | ✅ | Consolidate orders |
| `POST` | `/payments/checkout` | Orders | ✅ | Stripe checkout |
| `POST` | `/ai/optimize-price` | AI | ❌ | Price optimization |
| `POST` | `/ai/forecast-demand` | AI | ❌ | Demand forecast |
| `POST` | `/ai/query` | AI | ❌ | NL query |
| `POST` | `/ai/detect-anomalies` | AI | ❌ | Anomaly detection |

Full Swagger docs available at:
```
http://localhost:8000/docs        # AI Service (FastAPI auto-docs)
http://localhost:4000/graphql     # GraphQL Playground
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
   ```bash
   git fork https://github.com/NipunKachwaha/wholesale-aggregator.git
   ```

2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your Changes** (follow conventional commits)
   ```bash
   git commit -m "feat: add amazing feature"
   # Types: feat, fix, docs, style, refactor, test, chore, ci
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request** — fill in the PR template

### Development Guidelines

```bash
# Code style — ESLint + Prettier
npm run lint

# TypeScript strict mode is enabled — no 'any' types without justification

# Python — PEP8, type hints required
cd ai-service && python -m flake8 .

# Commit messages — Conventional Commits
# feat:     New feature
# fix:      Bug fix
# docs:     Documentation only
# refactor: Code refactoring
# test:     Adding tests
# chore:    Maintenance
```

### Project Structure

```
wholesale-aggregator/
├── .github/           # CI/CD workflows, PR templates
├── ai-service/        # Python FastAPI AI microservice
├── frontend/          # React + TypeScript SPA
├── infra/             # Docker, Kubernetes, Nginx configs
├── mobile/            # React Native Expo app
├── scripts/           # Build, deploy, utility scripts
├── services/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── collab-service/
│   ├── gateway/
│   ├── graphql-service/
│   └── order-service/
├── shared/            # Shared TypeScript types
├── .env.example
├── package.json       # Monorepo root
└── tsconfig.base.json
```

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

**In short:**
- Be respectful and inclusive
- No harassment, discrimination, or personal attacks
- Focus on constructive feedback
- Report violations to: conduct@wholesale-aggregator.com

---

## 🐛 Known Issues & Roadmap

### Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| Prophet install fails on Python 3.13 | Open | Use Python 3.11 or statistical fallback |
| Mobile app `localhost` unreachable on device | Open | Use your machine's local IP address |
| Elasticsearch index not auto-created on first run | Open | Run `POST /catalog/reindex` manually |
| GraphQL subscriptions not yet implemented | In Progress | Use WebSocket events via gateway |

### Roadmap

**v1.1.0 — Q2 2025**
- [ ] GraphQL subscriptions (real-time order updates)
- [ ] Advanced ML model retraining pipeline (MLflow)
- [ ] Email notification templates (order status changes)
- [ ] Bulk order CSV import from frontend UI

**v1.2.0 — Q3 2025**
- [ ] WhatsApp Business API notifications
- [ ] Advanced analytics (cohort analysis, LTV)
- [ ] React Native push notifications
- [ ] Multi-currency support (USD, EUR, INR)

**v2.0.0 — Q4 2025**
- [ ] Blockchain-based supply chain audit trail
- [ ] Computer vision for invoice processing
- [ ] Advanced NLP with fine-tuned domain model
- [ ] Marketplace mode (B2B portal)

---

## 📄 License

Distributed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Wholesale Aggregator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

See [`LICENSE`](LICENSE) for full text.

---

## 👨‍💻 Authors & Acknowledgments

### Authors

| Name | Role | GitHub |
|------|------|--------|
| **Your Name** | Lead Developer & Architect | [@your-username](https://github.com/your-username) |

### Built With Help From

- [Facebook Prophet](https://facebook.github.io/prophet/) — Time series forecasting
- [Groq](https://groq.com/) — LLM inference (LLaMA 3.3 70B)
- [Stripe](https://stripe.com/) — Payment processing
- [Elasticsearch](https://www.elastic.co/) — Full-text search
- [Apollo GraphQL](https://www.apollographql.com/) — GraphQL server & client
- [GSAP](https://greensock.com/gsap/) — Animation library
- [Recharts](https://recharts.org/) — React charting library

### Special Thanks

- The open-source community for the incredible tools that made this possible
- All contributors who submitted PRs, filed issues, and improved documentation

---

<div align="center">

**⭐ Star this repo if it helped you!**

[![GitHub stars](https://img.shields.io/github/stars/your-username/wholesale-aggregator?style=social)](https://github.com/your-username/wholesale-aggregator)
[![GitHub forks](https://img.shields.io/github/forks/your-username/wholesale-aggregator?style=social)](https://github.com/your-username/wholesale-aggregator)

**Made with ❤️ for the wholesale community**

[🐛 Report Bug](https://github.com/your-username/wholesale-aggregator/issues) · [✨ Request Feature](https://github.com/your-username/wholesale-aggregator/issues) · [📖 Read Docs](https://docs.wholesale-aggregator.com)

</div>
