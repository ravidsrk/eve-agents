#!/usr/bin/env bash
# Run strict evals on S-tier catalog agents (06, 04, 01, 11, 17).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

AGENTS=(
  "06-incident-commander"
  "04-support-ticket-triage"
  "01-revenue-analyst"
  "11-pr-triage-reviewer"
  "17-content-pipeline-agent"
)

for id in "${AGENTS[@]}"; do
  echo "==> eval: $id"
  (cd "$ROOT/agents/catalog/$id" && npx eve eval --strict)
done

echo "==> S-tier evals: all passed"