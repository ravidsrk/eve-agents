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

echo "==> eve build ($AGENT_ID)"
npm run build

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "VERCEL_TOKEN not set — build OK; run 'vercel link && vercel deploy' in $AGENT_DIR"
  exit 0
fi

echo "==> vercel deploy ($AGENT_ID)"
npx vercel deploy --token "$VERCEL_TOKEN" --yes ${@+"$@"}