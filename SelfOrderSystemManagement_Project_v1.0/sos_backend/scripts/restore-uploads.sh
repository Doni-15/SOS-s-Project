#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_FILE="${1:-}"
RESTORE_TARGET="${RESTORE_TARGET:-.}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./scripts/restore-uploads.sh backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Upload backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "============================================================"
echo "Uploads restore"
echo "============================================================"
echo "Backup file    : $BACKUP_FILE"
echo "Restore target : $RESTORE_TARGET"
echo "============================================================"
echo "This will extract uploaded files into:"
echo "$RESTORE_TARGET/public/uploads"
echo ""
echo "Type RESTORE_UPLOADS to continue:"
read -r CONFIRMATION

if [ "$CONFIRMATION" != "RESTORE_UPLOADS" ]; then
  echo "Uploads restore cancelled."
  exit 1
fi

mkdir -p "$RESTORE_TARGET"

tar -xzf "$BACKUP_FILE" -C "$RESTORE_TARGET"

echo "============================================================"
echo "Uploads restore completed"
echo "============================================================"

find "$RESTORE_TARGET/public/uploads" -type f | tail -n 20 || true
