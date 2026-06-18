#!/bin/bash
# Run eve eval --strict on each official fixture. Stops on first failure unless CONTINUE=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

require_node24

FAIL=0
PASS=0
for dir in "$ROOT"/agents/official/*/; do
  name=$(basename "$dir")
  ensure_env_local "$dir"
  echo ""
  echo "======== $name ========"
  if (cd "$dir" && rm -rf .eve && npx eve eval --strict); then
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