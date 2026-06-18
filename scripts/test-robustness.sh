#!/bin/bash
# Run robustness tests. budget-cap needs no API keys; the rest need live credentials.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

require_node24

echo "==> budget-cap (no keys required)"
node "$ROOT/robustness/budget-cap.mjs"

if [ -f "$ROOT/.secrets/eve.env" ] || [ -f "$ROOT/lab/.env.local" ]; then
  echo ""
  echo "==> provider-error (requires OPENROUTER_API_KEY)"
  bash "$ROOT/robustness/provider-error.sh"

  if grep -qE '^SUPERSERVE_API_KEY=.+' "$ROOT/lab/.env.local" 2>/dev/null || \
     grep -qE '^SUPERSERVE_API_KEY=.+' "$ROOT/.secrets/eve.env" 2>/dev/null; then
    echo ""
    echo "==> sandbox-crash (requires SUPERSERVE_API_KEY)"
    bash "$ROOT/robustness/sandbox-crash.sh"
  else
    echo "Skipping sandbox-crash (SUPERSERVE_API_KEY not set)"
  fi
else
  echo "Skipping live robustness tests (run scripts/setup.sh first)"
fi