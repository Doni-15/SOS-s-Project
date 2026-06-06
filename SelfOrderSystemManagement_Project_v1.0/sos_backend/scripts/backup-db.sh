#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
POSTGRES_DOCKER_IMAGE="${POSTGRES_DOCKER_IMAGE:-postgres:16-alpine}"

mkdir -p "$BACKUP_DIR"

read_env_value() {
  node -e '
const fs = require("fs");
const key = process.argv[1];

if (process.env[key]) {
  console.log(process.env[key]);
  process.exit(0);
}

if (!fs.existsSync(".env")) {
  process.exit(1);
}

const lines = fs.readFileSync(".env", "utf8").split(/\r?\n/);
const line = lines.find((item) => item.trim().startsWith(key + "="));

if (!line) {
  process.exit(1);
}

let value = line.slice(key.length + 1).trim();

if (
  (value.startsWith("\"") && value.endsWith("\"")) ||
  (value.startsWith("'") && value.endsWith("'"))
) {
  value = value.slice(1, -1);
}

console.log(value);
' "$1"
}

DATABASE_URL="${DATABASE_URL:-}"

if [ -z "$DATABASE_URL" ]; then
  DATABASE_URL="$(read_env_value DATABASE_URL)"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not found. Set DATABASE_URL or add it to .env"
  exit 1
fi

# Prisma uses ?schema=public, but pg_dump does not support the "schema"
# URI query parameter. Remove it before passing the URL to PostgreSQL CLI tools.
PG_DATABASE_URL="$(RAW_DATABASE_URL="$DATABASE_URL" node -e '
const url = new URL(process.env.RAW_DATABASE_URL);
url.searchParams.delete("schema");
console.log(url.toString());
')"

MASKED_DATABASE_URL="$(RAW_DATABASE_URL="$PG_DATABASE_URL" node -e '
try {
  const url = new URL(process.env.RAW_DATABASE_URL);
  if (url.password) url.password = "***";
  console.log(url.toString());
} catch {
  console.log("***masked***");
}
')"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_NAME="${BACKUP_NAME:-sos-db-$TIMESTAMP}"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.dump"
META_FILE="$BACKUP_FILE.json"

echo "============================================================"
echo "Database backup"
echo "============================================================"
echo "Target DB  : $MASKED_DATABASE_URL"
echo "Schema     : public"
echo "Output     : $BACKUP_FILE"
echo "Format     : custom pg_dump"
echo "Started at : $(date -Is)"
echo "============================================================"

BACKUP_ABS_DIR="$(cd "$BACKUP_DIR" && pwd)"
BACKUP_FILE_NAME="$(basename "$BACKUP_FILE")"

if command -v pg_dump >/dev/null 2>&1; then
  echo "[INFO] Using local pg_dump"

  pg_dump \
    --dbname="$PG_DATABASE_URL" \
    --schema=public \
    --format=custom \
    --blobs \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$BACKUP_FILE"

elif command -v docker >/dev/null 2>&1; then
  echo "[INFO] Local pg_dump not found. Using Docker image: $POSTGRES_DOCKER_IMAGE"

  docker run --rm \
    -e PG_DATABASE_URL="$PG_DATABASE_URL" \
    -v "$BACKUP_ABS_DIR:/backups" \
    "$POSTGRES_DOCKER_IMAGE" \
    sh -c 'pg_dump --dbname="$PG_DATABASE_URL" --schema=public --format=custom --blobs --no-owner --no-privileges --verbose --file="/backups/'"$BACKUP_FILE_NAME"'"'

else
  echo "Neither pg_dump nor docker is available."
  exit 1
fi

if [ ! -s "$BACKUP_FILE" ]; then
  echo "Backup failed or backup file is empty: $BACKUP_FILE"
  exit 1
fi

SHA256="$(sha256sum "$BACKUP_FILE" | awk '{print $1}')"
SIZE_BYTES="$(wc -c < "$BACKUP_FILE" | tr -d ' ')"

cat > "$META_FILE" <<META
{
  "type": "database",
  "format": "pg_dump_custom",
  "schema": "public",
  "file": "$BACKUP_FILE",
  "sizeBytes": $SIZE_BYTES,
  "sha256": "$SHA256",
  "createdAt": "$(date -Is)",
  "databaseUrl": "$MASKED_DATABASE_URL"
}
META

echo "============================================================"
echo "Database backup completed"
echo "============================================================"
echo "File       : $BACKUP_FILE"
echo "Metadata   : $META_FILE"
echo "Size       : $SIZE_BYTES bytes"
echo "SHA256     : $SHA256"
echo "Finished at: $(date -Is)"
echo "============================================================"
