#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo " Frontend Sanity Check"
echo "========================================"

echo
echo "== Runtime =="
node -v
npm -v

echo
echo "== Required files =="
required_files=(
  "package.json"
  "index.html"
  "src/main.jsx"
  "src/routes/AppRoutes.jsx"
  "src/shared/api/apiClient.js"
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
  "src"
  "src/routes"
  "src/shared"
  "src/shared/api"
  "src/features"
  "src/features/auth"
  "src/features/orders"
  "src/features/cashier"
  "src/features/owner"
  "src/features/customer"
)

for dir in "${required_dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Missing required directory: $dir"
    exit 1
  fi
  echo "OK $dir"
done

echo
echo "== Import hygiene check =="
node scripts/check-import-hygiene.mjs

echo
echo "== API contract check =="
node scripts/check-api-contracts.mjs

echo
echo "== Customer QR flow check =="
node scripts/check-customer-flow.mjs

echo
echo "== Owner QR preview check =="
node scripts/check-owner-qr-preview.mjs

echo
echo "== Owner QR clickable check =="
node scripts/check-owner-qr-clickable.mjs



echo
echo "== Cashier access check =="
node scripts/check-cashier-access.mjs

echo
echo "== Cashier payment flow check =="
node scripts/check-cashier-payment-flow.mjs

echo
echo "== Reusable receipt check =="
node scripts/check-reusable-receipt.mjs

echo
echo "== Owner report receipt check =="
node scripts/check-owner-report-receipt.mjs

echo
echo "== Customer receipt check =="
node scripts/check-customer-receipt.mjs

echo
echo "== Customer UI polish check =="
node scripts/check-customer-ui-polish.mjs

echo
echo "== Route access check =="
node scripts/check-route-access.mjs

echo
echo "== Code splitting check =="
node scripts/check-code-splitting.mjs





echo
echo "== Lint =="
npm run lint

echo
echo "== Build =="
npm run build

echo
echo "== Runtime smoke test =="
SKIP_BUILD_IN_RUNTIME=true bash scripts/check-runtime.sh

echo
echo "========================================"
echo " Frontend sanity check passed"
echo "========================================"

echo "== Cashier menu update check =="
npm run check:cashier-menu-update
