#!/usr/bin/env bash
# Run flagship evals against a deployed base URL (requires ROUTE_AUTH_BASIC_* on deploy).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENT_DIR="$ROOT/agents/catalog/06-incident-commander"
URL="${1:?base URL}"

cd "$AGENT_DIR"
export EVE_EVAL_BASE_URL="$URL"
if [[ -n "${ROUTE_AUTH_BASIC_USER:-}" && -n "${ROUTE_AUTH_BASIC_PASSWORD:-}" ]]; then
  export EVE_EVAL_BASIC_AUTH="${ROUTE_AUTH_BASIC_USER}:${ROUTE_AUTH_BASIC_PASSWORD}"
fi

echo "eval: flagship (deployed) → $URL"
npx eve eval --base-url "$URL" --strict