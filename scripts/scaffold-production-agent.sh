#!/bin/bash
# Scaffold a Tier 2 production agent in agents/production/<slug>.
# Usage: bash scripts/scaffold-production-agent.sh <slug> <package-name> "<description>"
set -euo pipefail

SLUG="${1:-}"
PKG="${2:-}"
DESC="${3:-}"
if [ -z "$SLUG" ] || [ -z "$PKG" ]; then
  echo "Usage: bash scripts/scaffold-production-agent.sh <slug> <package-name> \"<description>\""
  echo "Example: bash scripts/scaffold-production-agent.sh p01-incident-triage production-p01-incident-triage \"On-call incident triage\""
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/agents/production/$SLUG"
mkdir -p "$DEST/agent/tools" "$DEST/agent/sandbox" "$DEST/agent/channels"
cp "$ROOT/agents/production/_shared/sandbox.ts" "$DEST/agent/sandbox/sandbox.ts"
cp "$ROOT/agents/production/_shared/channels/eve.ts" "$DEST/agent/channels/eve.ts"

cat > "$DEST/package.json" <<EOF
{
  "name": "$PKG",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "description": "$DESC",
  "imports": {
    "#*": "./agent/*",
    "#evals/*": "./evals/*"
  },
  "scripts": {
    "dev": "eve dev",
    "build": "eve build",
    "start": "eve start",
    "typecheck": "tsgo",
    "test:e2e": "eve eval --strict"
  },
  "dependencies": {
    "@ai-sdk/openai-compatible": "3.0.0-beta.57",
    "@eve-catalog/agent-kit": "*",
    "@eve-catalog/openrouter": "*",
    "@eve-catalog/profile": "*",
    "@eve-catalog/superserve-backend": "*",
    "@eve-catalog/monid-tools": "*",
    "ai": "7.0.0-beta.178",
    "eve": "^0.11.4",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@types/node": "24.x",
    "@typescript/native-preview": "7.0.0-dev.20260523.1"
  },
  "engines": { "node": "24.x" }
}
EOF

cat > "$DEST/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["agent/**/*.ts", "evals/**/*.ts", ".eve/**/*.d.ts"]
}
EOF

cp "$ROOT/agents/reference/agent-tools/.gitignore" "$DEST/.gitignore"

cat > "$DEST/agent/agent.ts" <<'EOF'
import { defineAgent } from "eve";
import { DEFAULT_CONTEXT_WINDOW, resolveModel } from "@eve-catalog/profile";

export default defineAgent({
  model: resolveModel(),
  modelContextWindowTokens: DEFAULT_CONTEXT_WINDOW,
});
EOF

for tool in monid_discover monid_inspect monid_run; do
  case "$tool" in
    monid_discover) export from="monidDiscoverTool" ;;
    monid_inspect) export from="monidInspectTool" ;;
    monid_run) export from="monidRunTool" ;;
  esac
  cat > "$DEST/agent/tools/${tool}.ts" <<EOF
export { ${from} as default } from "@eve-catalog/monid-tools/tools";
EOF
done

echo "Scaffolded $DEST"