#!/usr/bin/env bash
set -Eeuo pipefail

RUN_ID="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="test-results"
OUT_FILE="$OUT_DIR/pre-push-review-$RUN_ID.txt"

SHOW_LOCKFILE="${SHOW_LOCKFILE:-false}"

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

is_text_file() {
  local file="$1"

  case "$file" in
    *.js|*.jsx|*.ts|*.tsx|*.json|*.md|*.txt|*.sh|*.sql|*.prisma|*.yml|*.yaml|*.env|*.example|Dockerfile|.gitignore|.dockerignore|nodemon.json|prisma.config.ts)
      return 0
      ;;
    *)
      if file "$file" 2>/dev/null | grep -qiE 'text|json|javascript|typescript|shell|markdown|empty'; then
        return 0
      fi
      return 1
      ;;
  esac
}

should_skip_content() {
  local file="$1"

  case "$file" in
    node_modules/*|backups/*|test-results/*|public/uploads/*)
      return 0
      ;;
    *.png|*.jpg|*.jpeg|*.webp|*.gif|*.ico|*.svg|*.dump|*.tar.gz|*.zip)
      return 0
      ;;
    package-lock.json)
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

section "SOS Backend Pre-Push Review"
echo "Started at       : $(date -Is)"
echo "Working directory: $(pwd)"
echo "Output file      : $OUT_FILE"
echo "SHOW_LOCKFILE    : $SHOW_LOCKFILE"

section "Git Status"
git status --short || true

section "Tracked Runtime/Sensitive File Check"
echo "[INFO] These should be empty:"
git ls-files | grep -E '^(\.env|backups/|test-results/|public/uploads/)' || true

section "Backend Candidate Files"
find . \
  -path './.git' -prune -o \
  -path './node_modules' -prune -o \
  -path './backups' -prune -o \
  -path './test-results' -prune -o \
  -path './public/uploads' -prune -o \
  -type f \
  | sed 's#^\./##' \
  | sort

section "Backend Candidate Directory Summary"
du -sh . 2>/dev/null || true
du -sh src scripts prisma docs test-assets public 2>/dev/null || true

section "Package Scripts"
npm pkg get scripts || true

section "Important Config Files"
for file in \
  package.json \
  .gitignore \
  .dockerignore \
  .env.example \
  Dockerfile \
  prisma/schema.prisma \
  prisma.config.ts \
  README.md \
  docs/BACKUP_RESTORE.md \
  roadmap_backend.md
do
  if [ -f "$file" ]; then
    subsection "$file"
    sed -n '1,260p' "$file"
  else
    echo "[MISSING] $file"
  fi
done

section "Syntax Check - Shell Scripts"
if find scripts -type f -name '*.sh' >/dev/null 2>&1; then
  while IFS= read -r file; do
    echo "[CHECK] bash -n $file"
    bash -n "$file"
  done < <(find scripts -type f -name '*.sh' | sort)
else
  echo "[INFO] No shell scripts found"
fi

section "Syntax Check - JavaScript Files"
while IFS= read -r file; do
  echo "[CHECK] node --check $file"
  node --check "$file"
done < <(
  find src scripts prisma \
    -type f \
    -name '*.js' \
    2>/dev/null \
    | sort
)

section "Prisma Validate"
if command -v npx >/dev/null 2>&1 && [ -f prisma/schema.prisma ]; then
  npx prisma validate || true
else
  echo "[INFO] npx or prisma/schema.prisma not found"
fi

section "Risk Scan - Possible Testing / Mock / Debug Leftovers"
grep -RInE \
  'Strict Test|Smoke Image|Upload Test|dummy|mock|sample|fake|TODO|FIXME|HACK|debugger|console\.log|supabase|localhost|127\.0\.0\.1|run-ini|react\.svg|vite\.svg' \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=backups \
  --exclude-dir=test-results \
  --exclude-dir=public/uploads \
  . || true

section "Risk Scan - Possible Secret Values"
grep -RInE \
  'postgresql://[^[:space:]]+:[^@]+@|DATABASE_URL=.*://|JWT_SECRET=|JWT_REFRESH_SECRET=|PASSWORD=|SECRET=|TOKEN=' \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=backups \
  --exclude-dir=test-results \
  --exclude-dir=public/uploads \
  --exclude='.env' \
  . || true

section "Runtime File Check"
echo "[INFO] .env exists locally?"
if [ -f .env ]; then
  echo "YES - OK locally, but must not be committed"
else
  echo "NO"
fi

echo ""
echo "[INFO] Backup files:"
find backups -maxdepth 1 -type f 2>/dev/null | sort || true

echo ""
echo "[INFO] Test result files:"
find test-results -maxdepth 1 -type f 2>/dev/null | sort || true

echo ""
echo "[INFO] Upload files:"
find public/uploads -type f 2>/dev/null | sort || true

section "Full Text Content Review"
echo "[INFO] Printing text file contents only."
echo "[INFO] Skipping node_modules, backups, test-results, public/uploads runtime files, binary files."
echo "[INFO] package-lock.json is skipped by default. Run SHOW_LOCKFILE=true bash scripts/pre-push-review.sh to include it."

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
  echo "[SHA256] $(sha256sum "$file" | awk '{print $1}')"
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
    -path './.git' -prune -o \
    -path './node_modules' -prune -o \
    -type f \
    | sort
)

section "Review Finished"
echo "Finished at : $(date -Is)"
echo "Report file : $OUT_FILE"
echo ""
echo "Next commands:"
echo "less -R $OUT_FILE"
echo "grep -nEi 'Strict Test|Smoke Image|Upload Test|dummy|mock|TODO|FIXME|HACK|debugger|supabase|localhost|127.0.0.1|SECRET|PASSWORD|TOKEN|DATABASE_URL' $OUT_FILE"
