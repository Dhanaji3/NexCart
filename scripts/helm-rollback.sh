#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <release> <namespace>"
  echo "Example: $0 backend ecommerce"
  exit 1
fi

RELEASE=$1
NAMESPACE=$2

echo "Rolling back last revision for $RELEASE in $NAMESPACE"
REVISION=$(kubectl -n "$NAMESPACE" get deploy -l app=$RELEASE -o jsonpath='{.items[0].metadata.annotations."deployment.kubernetes.io/revision"}')
if [ -z "$REVISION" ]; then
  echo "No revision found; aborting"
  exit 1
fi

PREV=$((REVISION - 1))
echo "Rolling back to revision $PREV"
helm rollback "$RELEASE" "$PREV" -n "$NAMESPACE"
