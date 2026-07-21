#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <s3-object-key>"
  echo "Example: $0 backups/ecommerce_db-20260721-020000.dump"
  exit 1
fi

S3_KEY="$1"
BUCKET=${S3_BUCKET:-}
if [ -z "$BUCKET" ]; then
  echo "Please set S3_BUCKET environment variable or export before running."
  exit 1
fi

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "Downloading s3://$BUCKET/$S3_KEY to $TMPDIR/backup.dump"
aws s3 cp "s3://$BUCKET/$S3_KEY" "$TMPDIR/backup.dump"

echo "Restoring to Postgres (prompting for POSTGRES_HOST/USER/DB)
"
read -p "Postgres host [postgres]: " PGHOST
PGHOST=${PGHOST:-postgres}
read -p "Postgres user [postgres]: " PGUSER
PGUSER=${PGUSER:-postgres}
read -p "Database to restore into [ecommerce_db]: " PGDB
PGDB=${PGDB:-ecommerce_db}

echo "Restoring..."
pg_restore -h "$PGHOST" -U "$PGUSER" -d "$PGDB" -v "$TMPDIR/backup.dump"

echo "Restore complete."
