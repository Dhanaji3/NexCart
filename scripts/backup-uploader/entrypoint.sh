#!/usr/bin/env bash
set -euo pipefail

# Environment variables expected:
# PGPASSWORD, PGHOST, PGUSER, PGDB, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

: ${PGHOST:=postgres}
: ${PGUSER:=postgres}
: ${PGDB:=ecommerce_db}
: ${S3_BUCKET:?need S3_BUCKET}

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="/backups/ecommerce_db-${TIMESTAMP}.dump"

echo "Starting pg_dump to $BACKUP_FILE"
pg_dump -h "$PGHOST" -U "$PGUSER" -F c -b -v -f "$BACKUP_FILE" "$PGDB"

echo "Uploading $BACKUP_FILE to s3://$S3_BUCKET/backups/"
aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/"

echo "Upload complete, removing local backup"
rm -f "$BACKUP_FILE"

echo "Done"
