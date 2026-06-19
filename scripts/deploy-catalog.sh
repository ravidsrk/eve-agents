#!/usr/bin/env bash
# Build and optionally deploy a catalog agent to Vercel.
# Usage: bash scripts/deploy-catalog.sh 06-incident-commander [-- prod flags...]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENT_ID="${1:?catalog agent id, e.g. 06-incident-commander}"
shift || true

AGENT_DIR="$ROOT/agents/catalog/$AGENT_ID"
if [[ ! -d "$AGENT_DIR" ]]; then
  echo "Agent directory not found: $AGENT_DIR" >&2
  exit 1
fi

cd "$AGENT_DIR"

echo "==> workspace install (monorepo root)"
(cd "$ROOT" && npm ci)

echo "==> eve build ($AGENT_ID, VERCEL=1 → .vercel/output)"
(cd "$AGENT_DIR" && VERCEL=1 npm run build)

DEPLOY_ARGS=(--yes --prebuilt)
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  DEPLOY_ARGS+=(--token "$VERCEL_TOKEN")
fi

echo "==> vercel deploy --prebuilt ($AGENT_ID)"
(
  cd "$AGENT_DIR"
  npx vercel deploy "${DEPLOY_ARGS[@]}" ${@+"$@"}
)