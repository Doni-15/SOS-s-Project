#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo " Backend Sanity Check"
echo "========================================"

echo
echo "== Runtime =="
node -v
npm -v

echo
echo "== Required files =="
required_files=(
  "package.json"
  "prisma/schema.prisma"
  "src/server.js"
  "src/app.js"
  "src/config/env.js"
  "src/config/prisma.js"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing required file: $file"
    exit 1
  fi
  echo "OK $file"
done

echo
echo "== Required directories =="
required_dirs=(
  "src/common"
  "src/config"
  "src/modules"
  "prisma/migrations"
  "public/uploads"
  "public/uploads/menu-items"
)

for dir in "${required_dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Missing required directory: $dir"
    exit 1
  fi
  echo "OK $dir"
done

echo
echo "== JavaScript syntax check =="
find src -name "*.js" -type f -print0 | sort -z | while IFS= read -r -d '' file; do
  node --check "$file" >/dev/null
  echo "OK $file"
done

echo
echo "== Serializer check =="
node scripts/check-serializers.mjs

echo
echo "== Access matrix check =="
node scripts/check-access-matrix.mjs

echo
echo "== QR token contract check =="
node scripts/check-qr-token-contract.mjs

echo
echo "== Report service check =="
node scripts/check-reports.mjs

echo
echo "== Transactions report check =="
node scripts/check-transactions-report.mjs

echo
echo "== Cashier orders check =="
node scripts/check-cashier-orders.mjs




echo
echo "== Default menu seed check =="
node scripts/check-default-menu-seed.mjs



echo
echo "== Repository contract check =="
node scripts/check-repository-contracts.mjs

echo
echo "== Service mapper check =="
node scripts/check-service-mappers.mjs

echo
echo "== Import smoke check =="
node scripts/check-imports.mjs

echo
echo "== Prisma validate =="
npx prisma validate

echo
echo "== Prisma generate =="
npm run prisma:generate

echo
echo "========================================"
echo " Backend sanity check passed"
echo "========================================"

echo "== Cashier menu update access check =="
npm run check:cashier-menu-update
