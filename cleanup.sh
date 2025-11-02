#!/usr/bin/env bash
# ================================================
# Into The Wild – Deep Cleanup Runner (v2)
# Fast, bounded, resumable
# ================================================

set -euo pipefail

ROOT_DIR="$(pwd)"
NOW="$(date +%Y%m%d-%H%M)"
BRANCH="chore/deep-clean-$NOW"
REPORT="$ROOT_DIR/cleanup-report.txt"

# ------- Tunables -------
DEPCHECK_TIMEOUT_SEC="${DEPCHECK_TIMEOUT_SEC:-420}"   # 7 min max per project
AUDIT_TIMEOUT_SEC="${AUDIT_TIMEOUT_SEC:-120}"         # 2 min
FAST="${FAST:-0}"                                     # FAST=1 to skip audit
# ------------------------

PROJECTS=(
  "Admin Panel/intothewilds-admin-frontend"
  "Admin Panel/intothewilds-admin-backend"
  "Website/intoTheWilds-frontend-main"
  "Website/intothewilds-backend-main"
)

# Allow running a single project or start from an index
ONLY_PROJECT="${1:-}"          # usage: ./cleanup.sh "Admin Panel/intothewilds-admin-frontend"
START_FROM="${START_FROM:-0}"  # usage: START_FROM=2 ./cleanup.sh

# Utilities
ansi_yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
log() { echo "[CLEANUP] $*" | tee -a "$REPORT"; }
divider() { printf -- "------------------------------------------------------------\n" | tee -a "$REPORT"; }

timer_start() { date +%s; }
timer_end()   { local s=$1; local e; e=$(date +%s); echo $(( e - s )); }

ensure_branch() {
  if ! git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
    echo "Not a git repo. Abort." >&2; exit 1
  fi
  # Create once; if already exists (rerun), just continue
  git checkout -B "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"
}

commit_checkpoint() {
  git add -A
  git commit -m "chore(cleanup): $1" >/dev/null 2>&1 || true
}

do_depcheck() {
  local dir="$1"
  local start; start=$(timer_start)
  log "Running depcheck (bounded ${DEPCHECK_TIMEOUT_SEC}s) in $dir"

  # We limit analysis to common code roots to avoid scanning node_modules/coverage/build etc.
  # depcheck respects .depcheckrc if you want finer control later.
  local patterns="--ignore-patterns='**/dist/**,**/build/**,**/.next/**,**/.vite/**,**/coverage/**,**/node_modules/**'"
  local scopes="--skip-missing --json --ignores=eslint,prettier,typescript,@types/*"
  local specials="--specials=webpack,babel,eslint,tslint,typescript,vue,vuex"

  # Run with timeout; ignore non-zero to continue
  if command -v timeout >/dev/null 2>&1; then
    timeout "$DEPCHECK_TIMEOUT_SEC" npx depcheck $scopes $specials $patterns > depcheck-report.json || true
  else
    npx depcheck $scopes $specials $patterns > depcheck-report.json || true
  fi

  # Parse unused deps with jq if present; otherwise simple grep fallback
  local unused=""
  if command -v jq >/dev/null 2>&1; then
    unused=$(jq -r '.dependencies[]? // empty' depcheck-report.json || true)
  else
    unused=$(grep -o '"dependencies":\[[^]]*]' depcheck-report.json | sed 's/.*\[\(.*\)\]/\1/' | tr -d '"' | tr ',' ' ')
  fi

  if [ -n "${unused:-}" ]; then
    log "Removing unused dependencies: $unused"
    npm uninstall $unused || true
  else
    log "No unused dependencies found."
  fi

  rm -f depcheck-report.json
  local took; took=$(timer_end "$start")
  log "depcheck step took ${took}s"
}

do_audit() {
  local start; start=$(timer_start)
  if [ "$FAST" = "1" ]; then
    log "FAST=1 → skipping npm audit"
    return
  fi
  log "Running npm audit (bounded ${AUDIT_TIMEOUT_SEC}s)"
  if command -v timeout >/dev/null 2>&1; then
    timeout "$AUDIT_TIMEOUT_SEC" npm audit --audit-level=high || true
  else
    npm audit --audit-level=high || true
  fi
  local took; took=$(timer_end "$start")
  log "audit step took ${took}s"
}

clean_project() {
  local project="$1"
  cd "$ROOT_DIR/$project" || { log "Missing $project, skipping."; return; }

  divider
  ansi_yellow "▶ Cleaning project: $project"
  log "Project path: $project"

  # Install fast
  log "Installing deps (npm ci --no-audit --no-fund)"
  local start; start=$(timer_start)
  npm ci --no-audit --no-fund >> "$REPORT" 2>&1 || npm install --no-audit --no-fund >> "$REPORT" 2>&1
  local took; took=$(timer_end "$start")
  log "install step took ${took}s"

  # Prune + dedupe
  log "Pruning + deduping"
  npm prune >> "$REPORT" 2>&1 || true
  npm dedupe >> "$REPORT" 2>&1 || true

  # depcheck remove unused
  do_depcheck "$project"

  # lint + format (best-effort)
  log "Running lint:fix + format (best effort)"
  npm run lint:fix >> "$REPORT" 2>&1 || true
  npm run format >> "$REPORT" 2>&1 || true

  # audit (bounded, optional)
  do_audit

  commit_checkpoint "$project"
}

main() {
  echo "Cleanup started at $(date)" > "$REPORT"
  ensure_branch
  log "Starting Deep Cleanup Sprint"
  divider

  local idx=0
  for project in "${PROJECTS[@]}"; do
    if [ -n "$ONLY_PROJECT" ] && [ "$project" != "$ONLY_PROJECT" ]; then
      idx=$((idx+1)); continue
    fi
    if [ "$idx" -lt "$START_FROM" ]; then
      idx=$((idx+1)); continue
    fi
    clean_project "$project"
    idx=$((idx+1))
  done

  divider
  log "Generating final git status and summary..."
  git status >> "$REPORT"
  divider
  log "Cleanup completed successfully at $(date)"
  git add "$REPORT" || true
  git commit -m "docs: add cleanup summary report ($NOW)" >/dev/null 2>&1 || true

  ansi_yellow "Done. New branch: $BRANCH"
  echo
  echo "Push when ready:"
  echo "  git push origin $BRANCH"
  echo
  echo "Resume examples:"
  echo "  START_FROM=2 ./cleanup.sh     # start from 3rd project"
  echo "  ./cleanup.sh \"Admin Panel/intothewilds-admin-frontend\"  # single project"
  echo "  FAST=1 ./cleanup.sh           # skip npm audit for speed"
}

main "$@"
