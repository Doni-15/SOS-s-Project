#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
source "$SCRIPT_DIR/lib/path-safety.sh"

TEST_DIR="$(mktemp -d -t sos-path-safety-XXXXXX)"
PAYLOAD_MARKER="$TEST_DIR/payload-must-not-run"
FAKE_BIN_DIR="$TEST_DIR/bin"
CAPTURE_FILE="$TEST_DIR/pg-restore-arguments"

mkdir -p -- "$FAKE_BIN_DIR"
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -Eeuo pipefail' \
  ': "${CAPTURE_FILE:?}"' \
  'printf '\''%s\0'\'' "$@" >"$CAPTURE_FILE"' \
  >"$FAKE_BIN_DIR/pg_restore"
chmod 700 "$FAKE_BIN_DIR/pg_restore"

cleanup() {
  rm -rf -- "$TEST_DIR"
}

trap cleanup EXIT

file_names=(
  "backup with spaces.dump"
  "backup'single-quote.dump"
  'backup"double-quote.dump'
  'backup;touch payload-must-not-run;#.dump'
  'backup$(touch payload-must-not-run).dump'
  'backup`touch payload-must-not-run`.dump'
  'backup&touch payload-must-not-run&.dump'
)

for file_name in "${file_names[@]}"; do
  file_path="$TEST_DIR/$file_name"
  printf 'fixture' >"$file_path"

  resolved_path="$(canonical_existing_file "$file_path")"

  if [ "$resolved_path" != "$file_path" ]; then
    echo "Path resolution changed a valid literal filename" >&2
    exit 1
  fi

  (
    cd -- "$TEST_DIR"
    printf 'RESTORE\n' | \
      env \
        PATH="$FAKE_BIN_DIR:$PATH" \
        CAPTURE_FILE="$CAPTURE_FILE" \
        DATABASE_URL="postgresql://localhost:5432/sos_path_test" \
        bash "$SCRIPT_DIR/restore-db.sh" "$file_path" \
        >/dev/null
  )

  mapfile -d '' -t captured_arguments <"$CAPTURE_FILE"
  last_argument="${captured_arguments[${#captured_arguments[@]} - 1]}"

  if [ "$last_argument" != "$file_path" ]; then
    echo "Restore command did not preserve the filename as one literal argument" >&2
    exit 1
  fi
done

if [ -e "$PAYLOAD_MARKER" ]; then
  echo "A shell metacharacter payload was executed" >&2
  exit 1
fi

if grep -Fq 'sh -c' "$SCRIPT_DIR/backup-db.sh" "$SCRIPT_DIR/restore-db.sh"; then
  echo "Backup or restore script still invokes sh -c" >&2
  exit 1
fi

echo "Backup and restore path safety checks passed"
