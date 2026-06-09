#!/usr/bin/env bash
set -euo pipefail

PORT="${FRONTEND_SMOKE_PORT:-5174}"
HOST="${FRONTEND_SMOKE_HOST:-127.0.0.1}"
BASE_URL="http://${HOST}:${PORT}"
LOG_FILE="$(mktemp -t sos-frontend-runtime-XXXXXX.log)"

cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "========================================"
echo " Frontend Runtime Smoke Test"
echo "========================================"

echo
echo "== Config =="
echo "PORT     : $PORT"
echo "BASE_URL : $BASE_URL"
echo "LOG_FILE : $LOG_FILE"

if [ "${SKIP_BUILD_IN_RUNTIME:-false}" = "true" ]; then
  echo
  echo "== Build =="
  echo "SKIP build because caller already ran npm run build"
else
  echo
  echo "== Build =="
  npm run build
fi

echo
echo "== Starting preview server =="
npm run preview -- --host "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
SERVER_PID="$!"

echo "Server PID: $SERVER_PID"

echo
echo "== Waiting for frontend =="
for attempt in $(seq 1 30); do
  http_code="$(curl -sS -o /tmp/sos-frontend-root.html -w "%{http_code}" "$BASE_URL/" || true)"

  if [ "$http_code" = "200" ]; then
    echo "OK / responded with 200"
    break
  fi

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "FAIL preview server exited early."
    echo
    echo "== Preview log =="
    cat "$LOG_FILE"
    exit 1
  fi

  echo "Waiting attempt $attempt/30, root HTTP code: $http_code"
  sleep 0.5
done

if [ "${http_code:-000}" != "200" ]; then
  echo "FAIL / did not respond with 200"
  echo
  echo "== Preview log =="
  cat "$LOG_FILE"
  exit 1
fi

if ! grep -q 'id="root"' /tmp/sos-frontend-root.html; then
  echo "FAIL root HTML does not contain React root element"
  exit 1
fi

echo
echo "== Public order route check =="
order_code="$(curl -sS -o /tmp/sos-frontend-order.html -w "%{http_code}" "$BASE_URL/order?token=runtime-smoke-token" || true)"

if [ "$order_code" != "200" ]; then
  echo "FAIL /order?token=... expected 200, got $order_code"
  echo
  echo "== Preview log =="
  cat "$LOG_FILE"
  exit 1
fi

if ! grep -q 'id="root"' /tmp/sos-frontend-order.html; then
  echo "FAIL public order HTML does not contain React root element"
  exit 1
fi

echo "OK /order?token=... responded with 200"

echo
echo "== Internal dashboard route check =="
owner_code="$(curl -sS -o /tmp/sos-frontend-owner.html -w "%{http_code}" "$BASE_URL/owner" || true)"

if [ "$owner_code" != "200" ]; then
  echo "FAIL /owner expected SPA fallback 200, got $owner_code"
  echo
  echo "== Preview log =="
  cat "$LOG_FILE"
  exit 1
fi

echo "OK /owner responded with SPA fallback 200"

echo
echo "========================================"
echo " Frontend runtime smoke test passed"
echo "========================================"
