#!/usr/bin/env bash
set -euo pipefail

PORT="${BACKEND_API_SMOKE_PORT:-5012}"
BASE_URL="http://127.0.0.1:${PORT}"
LOG_FILE="$(mktemp -t sos-backend-api-smoke-XXXXXX.log)"
BODY_FILE="$(mktemp -t sos-backend-api-smoke-body-XXXXXX.json)"

cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi

  rm -f "$BODY_FILE"
}

trap cleanup EXIT

section() {
  echo
  echo "== $1 =="
}

fail_with_log() {
  echo "FAIL $1"
  echo
  echo "== Response body =="
  cat "$BODY_FILE" 2>/dev/null || true
  echo
  echo
  echo "== Server log =="
  cat "$LOG_FILE" 2>/dev/null || true
  exit 1
}

expect_code_in() {
  local label="$1"
  local method="$2"
  local path="$3"
  local allowed_codes="$4"
  local payload="${5:-}"

  if [ -n "$payload" ]; then
    code="$(
      curl -sS \
        -o "$BODY_FILE" \
        -w "%{http_code}" \
        -X "$method" \
        -H "Content-Type: application/json" \
        --data "$payload" \
        "$BASE_URL$path" || true
    )"
  else
    code="$(
      curl -sS \
        -o "$BODY_FILE" \
        -w "%{http_code}" \
        -X "$method" \
        "$BASE_URL$path" || true
    )"
  fi

  if [[ " ${allowed_codes} " == *" ${code} "* ]]; then
    echo "OK   $label -> HTTP $code"
  else
    fail_with_log "$label expected one of [$allowed_codes], got HTTP $code"
  fi
}

echo "========================================"
echo " Backend API Smoke Test"
echo "========================================"

section "Config"
echo "PORT     : $PORT"
echo "BASE_URL : $BASE_URL"
echo "LOG_FILE : $LOG_FILE"

section "Starting server"
PORT="$PORT" NODE_ENV=test node src/server.js >"$LOG_FILE" 2>&1 &
SERVER_PID="$!"
echo "Server PID: $SERVER_PID"

section "Waiting for /api/health"
for attempt in $(seq 1 30); do
  code="$(curl -sS -o "$BODY_FILE" -w "%{http_code}" "$BASE_URL/api/health" || true)"

  if [ "$code" = "200" ]; then
    echo "OK /api/health responded with 200"
    break
  fi

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    fail_with_log "server exited early"
  fi

  echo "Waiting attempt $attempt/30, health HTTP code: $code"
  sleep 0.5
done

if [ "${code:-000}" != "200" ]; then
  fail_with_log "/api/health did not respond with 200"
fi

section "Endpoint checks"
expect_code_in "readiness" "GET" "/api/health/ready" "200"
expect_code_in "public menu without token validates request" "GET" "/api/public/menu" "400 422"
expect_code_in "public QR validate invalid payload" "POST" "/api/public/qr/validate" "400 422" '{}'
expect_code_in "public order submit invalid payload" "POST" "/api/public/orders" "400 422" '{}'
expect_code_in "auth me without token" "GET" "/api/auth/me" "401"
expect_code_in "internal orders without token" "GET" "/api/internal/orders" "401"
expect_code_in "invalid login payload" "POST" "/api/auth/login" "400 401 422" '{}'
expect_code_in "unknown endpoint" "GET" "/api/__strict_not_found__" "404"

echo
echo "========================================"
echo " Backend API smoke test passed"
echo "========================================"
