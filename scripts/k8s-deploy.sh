#!/bin/bash
set -e

echo "🚀 Deploying Wholesale Aggregator to Kubernetes..."
echo "──────────────────────────────────────────────────"

# Namespace
kubectl apply -f infra/k8s/namespace.yaml

# ConfigMaps & Secrets
kubectl apply -f infra/k8s/configmaps/

# Databases first
kubectl apply -f infra/k8s/deployments/postgres.yaml
kubectl apply -f infra/k8s/deployments/redis.yaml

echo "⏳ Waiting for databases..."
kubectl wait --for=condition=ready pod -l app=postgres \
  -n wholesale --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis \
  -n wholesale --timeout=60s

# Services
kubectl apply -f infra/k8s/deployments/gateway.yaml
kubectl apply -f infra/k8s/deployments/ai-service.yaml

# Ingress
kubectl apply -f infra/k8s/services/ingress.yaml

echo ""
echo "✅ Deployment complete!"
echo "──────────────────────────────────────────────────"
kubectl get pods -n wholesale
echo ""
echo "🌐 Access: http://wholesale.local"