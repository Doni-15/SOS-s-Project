#!/usr/bin/env bash
set -Eeuo pipefail

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

echo "============================================================"
echo "Full backup started"
echo "Run ID: $TIMESTAMP"
echo "============================================================"

BACKUP_NAME="sos-db-$TIMESTAMP" ./scripts/backup-db.sh
BACKUP_NAME="sos-uploads-$TIMESTAMP" ./scripts/backup-uploads.sh

echo "============================================================"
echo "Full backup completed"
echo "Run ID: $TIMESTAMP"
echo "============================================================"

ls -lh backups | tail -n 20
