#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo " Frontend Production Readiness Doctor"
echo "========================================"

fail=0

check_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "FAIL missing file: $file"
    fail=1
  else
    echo "OK   file exists: $file"
  fi
}

check_dir() {
  local dir="$1"

  if [ ! -d "$dir" ]; then
    echo "FAIL missing dir: $dir"
    fail=1
  else
    echo "OK   dir exists: $dir"
  fi
}

echo
echo "== Core files =="
check_file "package.json"
check_file "package-lock.json"
check_file "index.html"
check_file ".env.example"
check_file ".gitignore"
check_file "src/main.jsx"
check_file "src/routes/AppRoutes.jsx"
check_file "src/shared/api/apiClient.js"

echo
echo "== Feature directories =="
check_dir "src/features"
check_dir "src/features/auth"
check_dir "src/features/orders"
check_dir "src/features/cashier"
check_dir "src/features/owner"
check_dir "src/features/customer"

echo
echo "== Git forbidden files check =="
if git ls-files | grep -E '(^|/)\.env$|(^|/)\.env\.(local|development|production)$|node_modules/|dist/|frontend_review_.*\.txt|\.stabilize-backups/' >/dev/null; then
  echo "FAIL forbidden local/generated files are tracked by git"
  git ls-files | grep -E '(^|/)\.env$|(^|/)\.env\.(local|development|production)$|node_modules/|dist/|frontend_review_.*\.txt|\.stabilize-backups/' || true
  fail=1
else
  echo "OK   no forbidden local/generated files tracked"
fi

echo
echo "== Package script consistency =="
node - <<'NODE'
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts ?? {};

const expected = [
  "dev",
  "build",
  "lint",
  "preview",
  "check",
  "check:frontend",
  "check:imports",
  "check:api",
  "check:customer",
  "check:owner-qr",
  "check:owner-qr-click",
  "check:cashier",
  "check:cashier-payment",
  "check:receipt",
  "check:owner-report-receipt",
  "check:customer-receipt",
  "check:customer-ui",
  "check:routes",
  "check:bundle",
  "check:runtime",
  "doctor"
];

let failed = false;

for (const name of expected) {
  if (!scripts[name]) {
    console.log(`FAIL missing npm script: ${name}`);
    failed = true;
  } else {
    console.log(`OK   npm script: ${name}`);
  }
}

if (failed) process.exit(1);
NODE

if [ "$fail" -ne 0 ]; then
  echo
  echo "Doctor found problems."
  exit 1
fi

echo
echo "========================================"
echo " Doctor passed"
echo "========================================"
