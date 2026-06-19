#!/bin/bash
# Run eve eval --strict on each reference fixture. Stops on first failure unless CONTINUE=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

require_node24

# Free SuperServe quota before reference sandbox fixtures.
if [[ -n "${SUPERSERVE_API_KEY:-}" ]] && [[ "${SKIP_SUPERSEVE_CLEANUP:-0}" != "1" ]]; then
  echo "==> cleanup:superserve (pre-reference)"
  node "$ROOT/scripts/cleanup-superserve.mjs" || true
fi

FAIL=0
PASS=0
for dir in "$ROOT"/agents/reference/*/; do
  [[ "$(basename "$dir")" == "_shared" ]] && continue
  name=$(basename "$dir")
  ensure_env_local "$dir"
  echo ""
  echo "======== $name ========"

  max_attempts=2
  if [[ "$name" == "agent-subagents-hitl" || "$name" == "agent-tools-hitl" || "$name" == "agent-tools" ]]; then
    max_attempts=5
  fi
  if [[ "$name" == "agent-tools-sandbox" ]]; then
    max_attempts=5
    echo "(sandbox: cooling 120s — SuperServe rate limits)"
    sleep 120
    echo "(sandbox: up to $max_attempts attempts)"
  fi

  ok=0
  for ((attempt = 1; attempt <= max_attempts; attempt++)); do
    if [[ "$attempt" -gt 1 ]]; then
      echo "RETRY $name ($attempt/$max_attempts)..."
      retry_sleep=20
      if [[ "$name" == "agent-subagents-hitl" || "$name" == "agent-tools-hitl" ]]; then
        retry_sleep=30
      fi
      if [[ "$name" == "agent-tools-sandbox" ]]; then
        retry_sleep=60
      fi
      sleep "$retry_sleep"
    fi
    if [[ "$name" == "agent-tools-sandbox" && -n "${SUPERSERVE_API_KEY:-}" ]]; then
      node "$ROOT/scripts/cleanup-superserve.mjs" || true
    fi
    eval_args=(--strict)
    if [[ "$name" == "agent-tools-sandbox" || "$name" == "agent-tools" ]]; then
      eval_args+=(--max-concurrency 1)
    fi
    if (
      cd "$dir"
      rm -rf .eve
      set -a && source .env.local && set +a
      npx eve eval "${eval_args[@]}"
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