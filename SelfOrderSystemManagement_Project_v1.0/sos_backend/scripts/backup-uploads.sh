#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
UPLOAD_DIR="${UPLOAD_DIR:-public/uploads}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_NAME="${BACKUP_NAME:-sos-uploads-$TIMESTAMP}"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
META_FILE="$BACKUP_FILE.json"

echo "============================================================"
echo "Uploads backup"
echo "============================================================"
echo "Upload dir : $UPLOAD_DIR"
echo "Output     : $BACKUP_FILE"
echo "Started at : $(date -Is)"
echo "============================================================"

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "Upload directory does not exist: $UPLOAD_DIR"
  mkdir -p "$UPLOAD_DIR"
fi

tar -czf "$BACKUP_FILE" "$UPLOAD_DIR"

if [ ! -s "$BACKUP_FILE" ]; then
  echo "Upload backup failed or file is empty: $BACKUP_FILE"
  exit 1
fi

SHA256="$(sha256sum "$BACKUP_FILE" | awk '{print $1}')"
SIZE_BYTES="$(wc -c < "$BACKUP_FILE" | tr -d ' ')"

cat > "$META_FILE" <<META
{
  "type": "uploads",
  "format": "tar.gz",
  "source": "$UPLOAD_DIR",
  "file": "$BACKUP_FILE",
  "sizeBytes": $SIZE_BYTES,
  "sha256": "$SHA256",
  "createdAt": "$(date -Is)"
}
META

echo "============================================================"
echo "Uploads backup completed"
echo "============================================================"
echo "File       : $BACKUP_FILE"
echo "Metadata   : $META_FILE"
echo "Size       : $SIZE_BYTES bytes"
echo "SHA256     : $SHA256"
echo "Finished at: $(date -Is)"
echo "============================================================"
