#!/bin/bash
# Reproducible setup from a fresh clone.
#   1) requires Node 24+ (eve engines), npm, and the three API keys.
#   2) creates .secrets/eve.env from your env (or copy .env.example) and each archetype .env.local.
#   3) installs the npm workspace.
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
OPENROUTER_MODEL=${OPENROUTER_MODEL:-openai/gpt-oss-120b}
EOF
  chmod 600 .secrets/eve.env
  echo "Wrote .secrets/eve.env (from environment). Edit it if any key is blank."
fi

# Give eve-lab and every archetype its own .env.local (gitignored).
for d in eve-lab archetypes/*/; do
  [ -d "$d" ] && cp .secrets/eve.env "$d/.env.local"
done

echo "Installing workspace dependencies..."
npm install

echo "Setup complete. Try:  cd eve-lab && npx eve dev --no-ui --port 3000"
