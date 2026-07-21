#!/usr/bin/env bash
set -euo pipefail

echo "Installing Prometheus/Grafana via helm (kube-prometheus-stack)..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace

echo "Monitoring stack installed."
