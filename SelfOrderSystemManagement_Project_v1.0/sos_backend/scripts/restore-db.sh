#!/usr/bin/env bash
set -Eeuo pipefail

POSTGRES_DOCKER_IMAGE="${POSTGRES_DOCKER_IMAGE:-postgres:16-alpine}"
BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./scripts/restore-db.sh backups/file.dump"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

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

echo "============================================================"
echo "DANGER: Database restore"
echo "============================================================"
echo "Target DB   : $MASKED_DATABASE_URL"
echo "Backup file : $BACKUP_FILE"
echo "============================================================"
echo "This operation can overwrite/delete current database objects."
echo "Type RESTORE to continue:"
read -r CONFIRMATION

if [ "$CONFIRMATION" != "RESTORE" ]; then
  echo "Restore cancelled."
  exit 1
fi

BACKUP_ABS_FILE="$(cd "$(dirname "$BACKUP_FILE")" && pwd)/$(basename "$BACKUP_FILE")"
BACKUP_FILE_NAME="$(basename "$BACKUP_FILE")"

if command -v pg_restore >/dev/null 2>&1; then
  echo "[INFO] Using local pg_restore"

  pg_restore \
    --dbname="$PG_DATABASE_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    "$BACKUP_FILE"

elif command -v docker >/dev/null 2>&1; then
  echo "[INFO] Local pg_restore not found. Using Docker image: $POSTGRES_DOCKER_IMAGE"

  docker run --rm \
    -e PG_DATABASE_URL="$PG_DATABASE_URL" \
    -v "$BACKUP_ABS_FILE:/restore/$BACKUP_FILE_NAME:ro" \
    "$POSTGRES_DOCKER_IMAGE" \
    sh -c 'pg_restore --dbname="$PG_DATABASE_URL" --clean --if-exists --no-owner --no-privileges --verbose "/restore/'"$BACKUP_FILE_NAME"'"'

else
  echo "Neither pg_restore nor docker is available."
  exit 1
fi

echo "============================================================"
echo "Database restore completed"
echo "Finished at: $(date -Is)"
echo "============================================================"
