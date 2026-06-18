#!/bin/bash
# Configure Monid CLI per https://monid.ai/SKILL.md
# Requires MONID_API_KEY in .secrets/eve.env (from scripts/setup.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SECRETS="$ROOT/.secrets/eve.env"

if [ ! -f "$SECRETS" ]; then
  echo "Missing $SECRETS — run: bash scripts/setup.sh"
  exit 1
fi

# shellcheck source=/dev/null
set -a && source "$SECRETS" && set +a

if [ -z "${MONID_API_KEY:-}" ] || [[ "$MONID_API_KEY" == *REDACTED* ]]; then
  echo "Set MONID_API_KEY in .secrets/eve.env (monid_live_... from https://app.monid.ai/access/api-keys)"
  exit 1
fi

if ! command -v monid >/dev/null 2>&1; then
  echo "Installing @monid-ai/cli ..."
  npm install -g @monid-ai/cli
fi

echo "monid $(monid --version)"

NO_COLOR=1 monid keys add -k "$MONID_API_KEY" -l eve-exploration 2>/dev/null || true
NO_COLOR=1 monid keys activate -l eve-exploration

echo "Active keys:"
NO_COLOR=1 monid keys list

echo "Wallet:"
NO_COLOR=1 monid balance -j

echo ""
echo "Monid ready. Workflow: discover → inspect → run (see MONID.md)"
echo "  monid discover -q \"github agent templates\""
echo "  npm run research:monid"