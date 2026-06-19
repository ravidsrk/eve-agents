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
if [[ -n "$BASE_URL" ]]; then
  echo "eval: flagship against $BASE_URL"
  npx eve eval --strict --base-url "$BASE_URL"
else
  echo "eval: flagship (local)"
  npx eve eval --strict
fi