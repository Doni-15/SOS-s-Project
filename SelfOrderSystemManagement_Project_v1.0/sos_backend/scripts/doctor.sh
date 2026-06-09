#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo " Backend Production Readiness Doctor"
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
check_file ".env.example"
check_file ".gitignore"
check_file ".dockerignore"
check_file "Dockerfile"
check_file "prisma/schema.prisma"
check_file "prisma.config.ts"
check_file "src/app.js"
check_file "src/server.js"

echo
echo "== Important scripts =="
check_file "scripts/backup-db.sh"
check_file "scripts/backup-uploads.sh"
check_file "scripts/backup-all.sh"
check_file "scripts/restore-db.sh"
check_file "scripts/restore-uploads.sh"
check_file "scripts/pre-push-review.sh"
check_file "scripts/check-backend.sh"

echo
echo "== Runtime dirs =="
check_dir "public/uploads"
check_dir "public/uploads/menu-items"

echo
echo "== Git forbidden files check =="
if git ls-files | grep -E '(^|/)\.env$|(^|/)\.env\.(local|development|production)$|node_modules/|backend_review_.*\.txt|\.stabilize-backups/' >/dev/null; then
  echo "FAIL forbidden local/generated files are tracked by git"
  git ls-files | grep -E '(^|/)\.env$|(^|/)\.env\.(local|development|production)$|node_modules/|backend_review_.*\.txt|\.stabilize-backups/' || true
  fail=1
else
  echo "OK   no forbidden local/generated files tracked"
fi

echo
echo "== Duplicate module check =="
if [ -d "src/modules/user/report" ]; then
  echo "FAIL duplicate report module found at src/modules/user/report"
  echo "Use src/modules/report as the single report module."
  fail=1
else
  echo "OK   no duplicate user/report module"
fi

echo
echo "== Package script consistency =="
node - <<'NODE'
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts ?? {};

const expected = [
  "dev",
  "start",
  "prisma:generate",
  "prisma:migrate",
  "prisma:studio",
  "db:migrate:deploy",
  "db:backup",
  "uploads:backup",
  "backup:all",
  "db:restore",
  "db:seed:menu",
  "uploads:restore",
  "check",
  "check:backend",
  "check:imports",
  "check:serializers",
  "check:service-mappers",
  "check:repositories",
  "check:runtime",
  "check:api-smoke",
  "check:access",
  "check:qr-token",
  "check:reports",
  "check:transactions-report",
  "check:cashier-orders",
  "check:seed-menu",
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
