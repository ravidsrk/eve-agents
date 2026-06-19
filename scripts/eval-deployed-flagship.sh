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

max_attempts="${EVAL_DEPLOYED_ATTEMPTS:-2}"
for ((attempt = 1; attempt <= max_attempts; attempt++)); do
  if [[ "$attempt" -gt 1 ]]; then
    echo "RETRY deployed flagship ($attempt/$max_attempts)..."
    sleep 10
  fi
  echo "eval: flagship (deployed) → $URL"
  if npx eve eval --url "$URL" --strict; then
    exit 0
  fi
done
exit 1