#!/usr/bin/env bash
# Run strict evals on A-tier catalog agents (02, 05 HITL, 33, 39, 50).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> HITL catalog (05)"
bash "$ROOT/scripts/eval-catalog-hitl.sh"

AGENTS=(
  "02-sales-lead-researcher"
  "33-rag-support-search"
  "39-code-interpreter-analyst"
  "50-agent-fleet-router"
)

for id in "${AGENTS[@]}"; do
  echo "==> eval: $id"
  (cd "$ROOT/agents/catalog/$id" && npx eve eval --strict)
done

echo "==> A-tier evals: all passed"