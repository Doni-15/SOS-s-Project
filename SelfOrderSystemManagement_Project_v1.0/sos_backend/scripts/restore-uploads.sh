#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
source "$SCRIPT_DIR/lib/path-safety.sh"

BACKUP_FILE="${1:-}"
RESTORE_TARGET="${RESTORE_TARGET:-.}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./scripts/restore-uploads.sh backups/sos-uploads-YYYYMMDD-HHMMSS.tar.gz"
  exit 1
fi

BACKUP_ABS_FILE="$(canonical_existing_file "$BACKUP_FILE")"
require_no_control_characters "$RESTORE_TARGET" "Restore target"

echo "============================================================"
echo "Uploads restore"
echo "============================================================"
echo "Backup file    : $BACKUP_ABS_FILE"
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

RESTORE_ABS_TARGET="$(canonical_non_root_directory "$RESTORE_TARGET")"

tar -xzf "$BACKUP_ABS_FILE" \
  --no-same-owner \
  --no-same-permissions \
  -C "$RESTORE_ABS_TARGET"

echo "============================================================"
echo "Uploads restore completed"
echo "============================================================"

find "$RESTORE_ABS_TARGET/public/uploads" -type f | tail -n 20 || true
