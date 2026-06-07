#!/usr/bin/env bash
set -Eeuo pipefail

RUN_ID="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="test-results"
OUT_FILE="$OUT_DIR/frontend-pre-push-review-$RUN_ID.txt"

SHOW_LOCKFILE="${SHOW_LOCKFILE:-false}"
RUN_FRONTEND_CHECKS="${RUN_FRONTEND_CHECKS:-true}"
CHECK_FAILED=0

mkdir -p "$OUT_DIR"

exec > >(tee "$OUT_FILE") 2>&1

section() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

subsection() {
  echo ""
  echo "------------------------------------------------------------"
  echo "$1"
  echo "------------------------------------------------------------"
}

mark_failed() {
  CHECK_FAILED=1
}

should_skip_path() {
  local file="$1"

  case "$file" in
    ./.git|./.git/*|.git|.git/*|\
    ./node_modules|./node_modules/*|node_modules|node_modules/*|\
    ./dist|./dist/*|dist|dist/*|\
    ./build|./build/*|build|build/*|\
    ./coverage|./coverage/*|coverage|coverage/*|\
    ./.next|./.next/*|.next|.next/*|\
    ./.vite|./.vite/*|.vite|.vite/*|\
    ./test-results|./test-results/*|test-results|test-results/*|\
    ./.patch-backups|./.patch-backups/*|.patch-backups|.patch-backups/*|\
    ./backups|./backups/*|backups|backups/*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_text_file() {
  local file="$1"

  case "$file" in
    *.js|*.jsx|*.ts|*.tsx|*.json|*.md|*.txt|*.sh|*.css|*.scss|*.sass|*.less|*.html|*.yml|*.yaml|*.env|*.example|*.config.js|*.config.ts|*.cjs|*.mjs|*.xml|*.svg|Dockerfile|.gitignore|.dockerignore|.npmrc|.nvmrc|.prettierrc|.eslintrc|.eslintignore|.prettierignore|jsconfig.json|tsconfig.json)
      return 0
      ;;
    *)
      if file "$file" 2>/dev/null | grep -qiE 'text|json|javascript|typescript|css|html|svg|shell|markdown|empty'; then
        return 0
      fi
      return 1
      ;;
  esac
}

should_skip_content() {
  local file="$1"

  if should_skip_path "$file"; then
    return 0
  fi

  case "$file" in
    .env|.env.local|.env.development|.env.production)
      return 0
      ;;
    *.png|*.jpg|*.jpeg|*.webp|*.gif|*.ico|*.bmp|*.tiff|*.avif|*.mp4|*.mov|*.avi|*.mkv|*.mp3|*.wav|*.ogg|*.woff|*.woff2|*.ttf|*.otf|*.eot|*.zip|*.tar|*.tar.gz|*.rar|*.7z|*.pdf)
      return 0
      ;;
    package-lock.json|pnpm-lock.yaml|yarn.lock|bun.lockb)
      if [ "$SHOW_LOCKFILE" != "true" ]; then
        return 0
      fi
      return 1
      ;;
    *)
      return 1
      ;;
  esac
}

has_npm_script() {
  local script_name="$1"

  if [ ! -f package.json ]; then
    return 1
  fi

  node -e "
    const pkg = require('./package.json');
    process.exit(pkg.scripts && pkg.scripts['$script_name'] ? 0 : 1);
  " 2>/dev/null
}

section "Frontend Pre-Push Review"
echo "Started at          : $(date -Is)"
echo "Working directory   : $(pwd)"
echo "Output file         : $OUT_FILE"
echo "SHOW_LOCKFILE       : $SHOW_LOCKFILE"
echo "RUN_FRONTEND_CHECKS : $RUN_FRONTEND_CHECKS"

section "Git Status"
git status --short || true

section "Tracked Runtime/Sensitive File Check"
echo "[INFO] These should normally be empty:"
git ls-files .env .env.local .env.development .env.production dist build coverage test-results .patch-backups node_modules 2>/dev/null || true

section "Frontend Candidate Files"
find . \
  \( -path './.git' \
    -o -path './node_modules' \
    -o -path './dist' \
    -o -path './build' \
    -o -path './coverage' \
    -o -path './.next' \
    -o -path './.vite' \
    -o -path './test-results' \
    -o -path './.patch-backups' \
  \) -prune -o \
  -type f \
  -print \
  | sed 's#^\./##' \
  | sort

section "Frontend Candidate Directory Summary"
du -sh . src public 2>/dev/null || true

section "Package Manager Detection"
if [ -f package-lock.json ]; then
  echo "Detected package manager: npm"
elif [ -f pnpm-lock.yaml ]; then
  echo "Detected package manager: pnpm"
elif [ -f yarn.lock ]; then
  echo "Detected package manager: yarn"
else
  echo "Detected package manager: unknown"
fi

section "Package Scripts"
npm pkg get scripts || true

section "Frontend Dependencies"
if [ -f package.json ]; then
  subsection "dependencies"
  npm pkg get dependencies || true

  subsection "devDependencies"
  npm pkg get devDependencies || true
else
  echo "[MISSING] package.json"
  mark_failed
fi

section "Important Frontend Config Files"
for file in \
  package.json \
  package-lock.json \
  pnpm-lock.yaml \
  yarn.lock \
  bun.lockb \
  index.html \
  vite.config.js \
  vite.config.ts \
  jsconfig.json \
  eslint.config.js \
  eslint.config.mjs \
  .eslintrc \
  .eslintrc.js \
  .eslintrc.json \
  .eslintignore \
  .prettierrc \
  .prettierrc.json \
  .prettierignore \
  tailwind.config.js \
  tailwind.config.ts \
  postcss.config.js \
  postcss.config.cjs \
  postcss.config.mjs \
  README.md \
  roadmap_frontend.md \
  .gitignore \
  .env.example
do
  if [ -f "$file" ]; then
    if should_skip_content "$file"; then
      echo "[SKIPPED] $file"
      continue
    fi

    subsection "$file"
    sed -n '1,260p' "$file"
  else
    echo "[MISSING] $file"
  fi
done

section "Common React Entry Files"
for file in \
  src/main.jsx \
  src/main.tsx \
  src/index.jsx \
  src/index.tsx \
  src/App.jsx \
  src/App.tsx \
  src/App.js \
  src/App.ts
do
  if [ -f "$file" ]; then
    subsection "$file"
    sed -n '1,260p' "$file"
  fi
done

section "Frontend Source Tree"
for dir in src app pages components public assets styles hooks lib utils services config; do
  if [ -d "$dir" ]; then
    subsection "$dir"
    find "$dir" \
      \( -path "$dir/node_modules" \
        -o -path "$dir/dist" \
        -o -path "$dir/build" \
        -o -path "$dir/.patch-backups" \
      \) -prune -o \
      -type f \
      -print \
      | sort
  fi
done

section "Syntax Check - Shell Scripts"
if [ -d scripts ]; then
  while IFS= read -r file; do
    echo "[CHECK] bash -n $file"
    if ! bash -n "$file"; then
      mark_failed
    fi
  done < <(find scripts -type f -name '*.sh' -print | sort)
else
  echo "[INFO] No scripts directory found"
fi

section "Syntax Check - Plain JavaScript Config Files"
while IFS= read -r file; do
  echo "[CHECK] node --check $file"
  if ! node --check "$file"; then
    mark_failed
  fi
done < <(
  find . \
    \( -path './.git' \
      -o -path './node_modules' \
      -o -path './dist' \
      -o -path './build' \
      -o -path './coverage' \
      -o -path './.next' \
      -o -path './.vite' \
      -o -path './test-results' \
      -o -path './.patch-backups' \
    \) -prune -o \
    -type f \
    \( -name '*.config.js' \
      -o -name '*.config.cjs' \
      -o -name '*.mjs' \
      -o -name '*.cjs' \
    \) \
    -print \
    | sort
)

section "Optional Frontend Checks"
echo "[INFO] RUN_FRONTEND_CHECKS=$RUN_FRONTEND_CHECKS"

if [ "$RUN_FRONTEND_CHECKS" = "true" ] && [ -f package.json ]; then
  for script in typecheck lint test build; do
    if has_npm_script "$script"; then
      subsection "npm run $script"
      if ! npm run "$script"; then
        mark_failed
      fi
    else
      echo "[SKIP] npm script '$script' not found"
    fi
  done
else
  echo "[SKIP] Frontend npm checks disabled"
fi

section "Risk Scan - Possible Testing / Mock / Debug Leftovers"
grep -RInE \
  'Strict Test|Smoke Test|dummy|mock|sample|fake|TODO|FIXME|HACK|debugger|console\.log|console\.warn|console\.error|localhost|127\.0\.0\.1|react\.svg|vite\.svg|lorem|ipsum|test image|hardcode|hardcoded' \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=coverage \
  --exclude-dir=.next \
  --exclude-dir=.vite \
  --exclude-dir=test-results \
  --exclude-dir=.patch-backups \
  --exclude='pre-push-review-frontend.sh' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.development' \
  --exclude='.env.production' \
  . || true

section "Risk Scan - Possible Frontend Secret Values"
grep -RInE \
  'VITE_.*(SECRET|PASSWORD|TOKEN|PRIVATE|KEY)=|REACT_APP_.*(SECRET|PASSWORD|TOKEN|PRIVATE|KEY)=|NEXT_PUBLIC_.*(SECRET|PASSWORD|TOKEN|PRIVATE|KEY)=|SECRET=|PASSWORD=|PRIVATE_KEY=|ACCESS_TOKEN=|REFRESH_TOKEN=|JWT_SECRET=|DATABASE_URL=.*://|postgresql://[^[:space:]]+:[^@]+@' \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=coverage \
  --exclude-dir=.next \
  --exclude-dir=.vite \
  --exclude-dir=test-results \
  --exclude-dir=.patch-backups \
  --exclude='pre-push-review-frontend.sh' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.development' \
  --exclude='.env.production' \
  . || true

section "Environment File Check"
for file in .env .env.local .env.development .env.production .env.example; do
  if [ -f "$file" ]; then
    echo "[FOUND] $file"

    if [ "$file" = ".env.example" ]; then
      echo "[INFO] Showing .env.example because it should only contain safe public config."
      subsection "$file"
      sed -n '1,200p' "$file"
    else
      echo "[INFO] $file exists locally. OK locally, but it must not be committed."
    fi
  else
    echo "[MISSING] $file"
  fi
done

section "Generated / Runtime File Check"
echo "[INFO] Build output files:"
find dist build .next .vite coverage -maxdepth 2 -type f 2>/dev/null | sort || true

echo ""
echo "[INFO] Test result files:"
find test-results -maxdepth 1 -type f 2>/dev/null | sort || true

echo ""
echo "[INFO] Patch backup files:"
find .patch-backups -maxdepth 2 -type f 2>/dev/null | sort || true

section "Public Asset Check"
if [ -d public ]; then
  find public -type f | sort
else
  echo "[INFO] public directory not found"
fi

section "Full Text Content Review"
echo "[INFO] Printing text file contents only."
echo "[INFO] Skipping node_modules, dist, build, coverage, .next, .vite, .patch-backups, test-results, env files, and binary files."
echo "[INFO] Lockfiles are skipped by default."

while IFS= read -r file; do
  file="${file#./}"

  if should_skip_content "$file"; then
    continue
  fi

  if ! is_text_file "$file"; then
    continue
  fi

  subsection "$file"
  echo "[SIZE] $(wc -c < "$file" | tr -d ' ') bytes"

  if command -v sha256sum >/dev/null 2>&1; then
    echo "[SHA256] $(sha256sum "$file" | awk '{print $1}')"
  fi

  echo ""
  sed -n '1,500p' "$file"

  total_lines="$(wc -l < "$file" | tr -d ' ')"
  if [ "$total_lines" -gt 500 ]; then
    echo ""
    echo "[TRUNCATED] $file has $total_lines lines. Showing first 500 lines only."
    echo "[TIP] Run: sed -n '501,1000p' '$file'"
  fi
done < <(
  find . \
    \( -path './.git' \
      -o -path './node_modules' \
      -o -path './dist' \
      -o -path './build' \
      -o -path './coverage' \
      -o -path './.next' \
      -o -path './.vite' \
      -o -path './test-results' \
      -o -path './.patch-backups' \
    \) -prune -o \
    -type f \
    -print \
    | sort
)

section "Review Finished"
echo "Finished at : $(date -Is)"
echo "Report file : $OUT_FILE"

echo ""
echo "Next commands:"
echo "less -R $OUT_FILE"
echo "grep -nEi 'dummy|mock|sample|fake|TODO|FIXME|HACK|debugger|console\\.log|localhost|127.0.0.1|react\\.svg|vite\\.svg|SECRET|PASSWORD|TOKEN|DATABASE_URL|PRIVATE_KEY' $OUT_FILE"

if [ "$CHECK_FAILED" != "0" ]; then
  echo ""
  echo "[FAILED] One or more strict checks failed."
  exit 1
fi

echo ""
echo "[OK] Strict frontend review completed without command failures."
