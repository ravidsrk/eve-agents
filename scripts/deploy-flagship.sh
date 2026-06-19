#!/usr/bin/env bash
# Build and deploy the flagship catalog agent (06-incident-commander) to Vercel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENT_DIR="$ROOT/agents/catalog/06-incident-commander"

cd "$AGENT_DIR"

echo "==> eve build"
npm run build

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "VERCEL_TOKEN not set — build OK; run 'vercel deploy' after linking a project."
  exit 0
fi

echo "==> vercel deploy"
npx vercel deploy --token "$VERCEL_TOKEN" --yes "${@}"