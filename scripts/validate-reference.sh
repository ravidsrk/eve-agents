#!/bin/bash
# Run eve eval --strict on each reference fixture. Stops on first failure unless CONTINUE=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

require_node24

FAIL=0
PASS=0
for dir in "$ROOT"/agents/reference/*/; do
  [[ "$(basename "$dir")" == "_shared" ]] && continue
  name=$(basename "$dir")
  ensure_env_local "$dir"
  echo ""
  echo "======== $name ========"

  max_attempts=2
  if [[ "$name" == "agent-subagents-hitl" ]]; then
    max_attempts=3
  fi
  if [[ "$name" == "agent-tools-sandbox" ]]; then
    max_attempts=3
    echo "(sandbox: cooling 90s — SuperServe rate limits)"
    sleep 90
    echo "(sandbox: up to $max_attempts attempts)"
  fi

  ok=0
  for ((attempt = 1; attempt <= max_attempts; attempt++)); do
    if [[ "$attempt" -gt 1 ]]; then
      echo "RETRY $name ($attempt/$max_attempts)..."
      sleep 20
    fi
    if (
      cd "$dir"
      rm -rf .eve
      set -a && source .env.local && set +a
      npx eve eval --strict
    ); then
      ok=1
      break
    fi
  done

  if [[ "$ok" -eq 1 ]]; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAILED: $name"
    [ "${CONTINUE:-0}" = "1" ] || exit 1
  fi
done

echo ""
echo "Official evals: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]