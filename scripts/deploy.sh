#!/usr/bin/env bash
set -euo pipefail

# Simple deploy helper: applies k8s manifests in correct order
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
KUBECTL=${KUBECTL:-kubectl}

echo "Applying k8s manifests..."
${KUBECTL} apply -f "$ROOT_DIR/k8s/00-common.yaml"
${KUBECTL} apply -f "$ROOT_DIR/k8s/01-database.yaml"
${KUBECTL} apply -f "$ROOT_DIR/k8s/02-backend.yaml"
${KUBECTL} apply -f "$ROOT_DIR/k8s/03-frontend.yaml"
${KUBECTL} apply -f "$ROOT_DIR/k8s/04-ingress.yaml"

echo "Waiting for backend rollout..."
${KUBECTL} -n ecommerce rollout status deployment/backend --timeout=120s

echo "Deployment applied. Check pods with: kubectl -n ecommerce get pods"
