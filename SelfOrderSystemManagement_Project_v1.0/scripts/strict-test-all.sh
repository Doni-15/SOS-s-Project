#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT/sos_backend"
FRONTEND_DIR="$ROOT/sos_frontend"
REPORT_DIR="$ROOT/quality-reports"
REPORT_FILE="$REPORT_DIR/strict-test-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$REPORT_DIR"

exec > >(tee "$REPORT_FILE") 2>&1

section() {
  echo
  echo "========================================"
  echo " $1"
  echo "========================================"
}

run_in() {
  local dir="$1"
  shift

  echo
  echo "+ cd $dir"
  echo "+ $*"

  (
    cd "$dir"
    "$@"
  )
}

check_dir() {
  local dir="$1"

  if [ ! -d "$dir" ]; then
    echo "FAIL missing directory: $dir"
    exit 1
  fi

  echo "OK directory exists: $dir"
}

section "Strict Test Metadata"
echo "Generated at : $(date)"
echo "Root         : $ROOT"
echo "Report       : $REPORT_FILE"
echo "Node         : $(node -v 2>/dev/null || echo 'node not found')"
echo "NPM          : $(npm -v 2>/dev/null || echo 'npm not found')"

section "Project Layout"
check_dir "$BACKEND_DIR"
check_dir "$FRONTEND_DIR"

section "Git Hygiene"
if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo
  echo "== Git status =="
  git -C "$ROOT" status --short

  echo
  echo "== Git diff whitespace check =="
  git -C "$ROOT" diff --check

  echo
  echo "== Forbidden tracked files =="
  forbidden="$(
    git -C "$ROOT" ls-files | grep -E '(^|/)\.env$|(^|/)\.env\.(local|development|production)$|node_modules/|(^|/)dist/|frontend_review_.*\.txt|backend_review_.*\.txt|\.stabilize-backups/|quality-reports/' || true
  )"

  if [ -n "$forbidden" ]; then
    echo "FAIL forbidden files are tracked:"
    echo "$forbidden"
    exit 1
  fi

  echo "OK no forbidden local/generated files tracked"
else
  echo "WARN root is not inside a git work tree; skipping git hygiene checks"
fi

section "Backend Strict Checks"
run_in "$BACKEND_DIR" npm run check
run_in "$BACKEND_DIR" npm run check:runtime
run_in "$BACKEND_DIR" npm run check:api-smoke
run_in "$BACKEND_DIR" npm run doctor

section "Backend Prisma Migration Status"
run_in "$BACKEND_DIR" npx prisma migrate status

section "Frontend Strict Checks"
run_in "$FRONTEND_DIR" npm run check:imports
run_in "$FRONTEND_DIR" npm run check:api
run_in "$FRONTEND_DIR" npm run check:customer
run_in "$FRONTEND_DIR" npm run check:cashier
run_in "$FRONTEND_DIR" npm run check:routes
run_in "$FRONTEND_DIR" npm run check:bundle
run_in "$FRONTEND_DIR" npm run check:runtime
run_in "$FRONTEND_DIR" npm run check
run_in "$FRONTEND_DIR" npm run doctor

section "Strict Test Passed"
echo "All backend and frontend strict checks passed."
echo "Report saved to: $REPORT_FILE"
