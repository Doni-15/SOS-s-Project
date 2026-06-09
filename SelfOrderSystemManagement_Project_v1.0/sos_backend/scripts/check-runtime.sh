#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5011}"
BASE_URL="http://127.0.0.1:${PORT}"
LOG_FILE="$(mktemp -t sos-backend-runtime-XXXXXX.log)"
HEALTH_RESPONSE_FILE="$(mktemp -t sos-backend-health-XXXXXX.json)"
READY_RESPONSE_FILE="$(mktemp -t sos-backend-ready-XXXXXX.json)"
NOT_FOUND_RESPONSE_FILE="$(mktemp -t sos-backend-404-XXXXXX.json)"

cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi

  rm -f "$LOG_FILE" "$HEALTH_RESPONSE_FILE" "$READY_RESPONSE_FILE" "$NOT_FOUND_RESPONSE_FILE"
}

trap cleanup EXIT

echo "========================================"
echo " Backend Runtime Smoke Test"
echo "========================================"

echo
echo "== Config =="
echo "PORT     : ${PORT}"
echo "BASE_URL : ${BASE_URL}"
echo "LOG_FILE : ${LOG_FILE}"

echo
echo "== Starting server =="
env PORT="$PORT" NODE_ENV=test node src/server.js >"$LOG_FILE" 2>&1 &
SERVER_PID="$!"

echo "Server PID: $SERVER_PID"

echo
echo "== Waiting for /api/health =="

ready=0

for i in $(seq 1 20); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "FAIL server exited early."
    echo
    echo "== Server log =="
    cat "$LOG_FILE"
    exit 1
  fi

  http_code="$(
    curl \
      --silent \
      --show-error \
      --max-time 2 \
      --output "$HEALTH_RESPONSE_FILE" \
      --write-out "%{http_code}" \
      "${BASE_URL}/api/health" 2>/dev/null || true
  )"

  if [ "$http_code" = "200" ]; then
    ready=1
    break
  fi

  echo "Waiting attempt ${i}/20, health HTTP code: ${http_code:-curl_failed}"

  if [ "$((i % 5))" -eq 0 ]; then
    echo
    echo "== Server log tail =="
    tail -n 40 "$LOG_FILE" || true
    echo
  fi

  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo
  echo "FAIL server did not become ready at ${BASE_URL}/api/health"
  echo
  echo "== Full server log =="
  cat "$LOG_FILE"
  exit 1
fi

echo
echo "OK /api/health responded with 200"

echo
echo "== Health response =="
cat "$HEALTH_RESPONSE_FILE"
echo

echo
echo "== Readiness response check =="
ready_code="$(
  curl \
    --silent \
    --show-error \
    --max-time 3 \
    --output "$READY_RESPONSE_FILE" \
    --write-out "%{http_code}" \
    "${BASE_URL}/api/health/ready" 2>/dev/null || true
)"

if [ "$ready_code" != "200" ]; then
  echo "FAIL expected readiness 200, got ${ready_code:-curl_failed}"
  echo
  echo "== Readiness response body =="
  cat "$READY_RESPONSE_FILE" || true
  echo
  echo "== Server log =="
  cat "$LOG_FILE"
  exit 1
fi

echo "OK /api/health/ready responded with 200"

echo
echo "== 404 response check =="
not_found_code="$(
  curl \
    --silent \
    --show-error \
    --max-time 2 \
    --output "$NOT_FOUND_RESPONSE_FILE" \
    --write-out "%{http_code}" \
    "${BASE_URL}/api/__not_found__" 2>/dev/null || true
)"

if [ "$not_found_code" != "404" ]; then
  echo "FAIL expected 404, got ${not_found_code:-curl_failed}"
  echo
  echo "== 404 response body =="
  cat "$NOT_FOUND_RESPONSE_FILE" || true
  echo
  echo "== Server log =="
  cat "$LOG_FILE"
  exit 1
fi

echo "OK unknown endpoint returns 404"

echo
echo "========================================"
echo " Runtime smoke test passed"
echo "========================================"
