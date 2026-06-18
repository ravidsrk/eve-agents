#!/bin/bash
# Port an official vercel/eve e2e fixture into agents/official/<name>.
# Adapts package.json for this monorepo (OpenRouter + shared packages).
#
# Usage: bash scripts/port-eve-fixture.sh <fixture-name>
# Example: bash scripts/port-eve-fixture.sh agent-openapi-swagger
set -euo pipefail

NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "Usage: bash scripts/port-eve-fixture.sh <fixture-name>"
  echo "Fixtures: agent-tools agent-schedules agent-openapi-swagger agent-subagents-hitl agent-skills agent-tools-sandbox agent-subagents agent-tools-hitl agent-basic-runtime agent-channels"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/agents/official/$NAME"
SRC_BASE="https://raw.githubusercontent.com/vercel/eve/main/e2e/fixtures/$NAME"
TREE_API="https://api.github.com/repos/vercel/eve/git/trees/main?recursive=1"

mkdir -p "$DEST"

echo "==> Fetching file list for e2e/fixtures/$NAME ..."
PATHS=$(curl -s "$TREE_API" | node -e "
const prefix='e2e/fixtures/${NAME}/';
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  const j=JSON.parse(d);
  for (const t of j.tree) {
    if (t.type==='blob' && t.path.startsWith(prefix)) {
      console.log(t.path.slice(prefix.length));
    }
  }
});
")

COUNT=0
while IFS= read -r relpath; do
  [ -z "$relpath" ] && continue
  mkdir -p "$(dirname "$DEST/$relpath")"
  curl -fsSL "$SRC_BASE/$relpath" -o "$DEST/$relpath"
  COUNT=$((COUNT + 1))
done <<< "$PATHS"

echo "   downloaded $COUNT files"

# package.json — wire to lab stack
node -e "
const fs=require('fs');
const p='$DEST/package.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.name='official-${NAME}';
j.imports={ '#*':'./agent/*', '#evals/*':'./evals/*' };
j.dependencies={
  '@ai-sdk/openai-compatible':'3.0.0-beta.57',
  '@lab/openrouter':'*',
  '@lab/superserve-backend':'*',
  '@lab/monid-tools':'*',
  'ai':'7.0.0-beta.178',
  'eve':'^0.11.4',
  'zod':'4.4.3',
};
j.devDependencies={
  '@types/node':'24.x',
  '@typescript/native-preview':'7.0.0-dev.20260523.1',
};
j.engines={ node:'24.x' };
j.scripts={ ...j.scripts, dev:'eve dev', build:'eve build', start:'eve start', typecheck:'tsgo' };
delete j.dependencies['@opentelemetry/core'];
delete j.dependencies['@opentelemetry/sdk-trace-base'];
delete j.dependencies['@vercel/otel'];
fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
"

# agent.ts — OpenRouter model
AGENT_TS="$DEST/agent/agent.ts"
if [ -f "$AGENT_TS" ]; then
  cat > "$AGENT_TS" << 'AGENTEOF'
import { defineAgent } from "eve";
import { orModel } from "@lab/openrouter";

// Ported from vercel/eve e2e/fixtures — model swapped to OpenRouter.
// Upstream: https://github.com/vercel/eve/tree/main/e2e/fixtures
export default defineAgent({
  model: orModel(),
  modelContextWindowTokens: 131072,
});
AGENTEOF
fi

# README credit
if [ -f "$DEST/README.md" ]; then
  {
    echo ""
    echo "## Ported into eve-exploration"
    echo ""
    echo "Source: [vercel/eve e2e/fixtures/$NAME](https://github.com/vercel/eve/tree/main/e2e/fixtures/$NAME)."
    echo "Model provider: OpenRouter via \`@lab/openrouter\`. Run from repo root after \`bash scripts/setup.sh\`."
  } >> "$DEST/README.md"
fi

# tsconfig if missing agent-only include
if [ -f "$DEST/tsconfig.json" ]; then
  node -e "
const fs=require('fs');const p='$DEST/tsconfig.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.include=['agent/**/*.ts','.eve/**/*.d.ts'];
fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
"
fi

echo "==> Ported to $DEST"
echo "    Next: bash scripts/setup.sh && cd agents/official/$NAME && npx eve eval --strict"