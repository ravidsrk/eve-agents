#!/bin/bash
# Reproducible setup from a fresh clone.
#   1) requires Node 24+ (eve engines), npm, and API keys in env or .secrets/eve.env
#   2) copies .secrets/eve.env → .env.local for every agent app
#   3) npm install
set -e
cd "$(dirname "$0")/.."

if ! node -e 'process.exit(parseInt(process.versions.node) >= 24 ? 0 : 1)'; then
  echo "Node 24+ required (eve engines). Try: nvm install 24 && nvm use 24"; exit 1
fi

mkdir -p .secrets
if [ ! -f .secrets/eve.env ]; then
  cat > .secrets/eve.env <<EOF
OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-${OPEN_ROUTER_KEY:-}}
OPEN_ROUTER_KEY=${OPEN_ROUTER_KEY:-${OPENROUTER_API_KEY:-}}
SUPERSERVE_API_KEY=${SUPERSERVE_API_KEY:-}
MONID_API_KEY=${MONID_API_KEY:-}
VERCEL_API_KEY=${VERCEL_API_KEY:-}
OPENROUTER_MODEL=${OPENROUTER_MODEL:-openai/gpt-oss-120b}
MONID_BUDGET_USD=${MONID_BUDGET_USD:-500}
MONID_MAX_CALL_USD=${MONID_MAX_CALL_USD:-5}
EOF
  chmod 600 .secrets/eve.env
  echo "Wrote .secrets/eve.env (from environment). Edit it if any key is blank."
fi

for d in lab agents/catalog/*/ agents/reference/*/ agents/production/*/ agents/integrations/*/; do
  [ -d "$d" ] && cp .secrets/eve.env "$d/.env.local"
done

echo "Installing workspace dependencies..."
npm install

bash scripts/setup-monid.sh 2>/dev/null || echo "(skip monid CLI — set MONID_API_KEY in .secrets/eve.env, then: bash scripts/setup-monid.sh)"

echo "Setup complete."
echo "  Unified catalog:  cat AGENT_CATALOG.md"
echo "  List all agents:  npm run catalog:list"
echo "  Reference agents: ls agents/reference/"
echo "  Catalog agents:   ls agents/catalog/"
echo "  Monid research:   npm run research:monid"
echo "  Monid workflow:   MONID.md + https://monid.ai/SKILL.md"
echo "  Happy path:       cd lab && npx eve dev --no-ui --port 3000"