#!/usr/bin/env bash
# Run strict evals on the flagship catalog agent (06-incident-commander).
# Usage:
#   bash scripts/eval-flagship.sh                    # local eve dev (default)
#   bash scripts/eval-flagship.sh https://preview… # deployed base URL
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENT_DIR="$ROOT/agents/catalog/06-incident-commander"
BASE_URL="${1:-}"

cd "$AGENT_DIR"
max_attempts="${EVAL_FLAGSHIP_ATTEMPTS:-2}"
for ((attempt = 1; attempt <= max_attempts; attempt++)); do
  if [[ "$attempt" -gt 1 ]]; then
    echo "RETRY flagship eval ($attempt/$max_attempts)..."
    rm -rf .eve
    sleep 5
  fi
  if [[ -n "$BASE_URL" ]]; then
    echo "eval: flagship against $BASE_URL"
    if npx eve eval --strict --url "$BASE_URL"; then
      exit 0
    fi
  else
    echo "eval: flagship (local)"
    if npx eve eval --strict; then
      exit 0
    fi
  fi
done
exit 1