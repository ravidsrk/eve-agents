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
  attempts=2
  [[ "$id" == "17-content-pipeline-agent" || "$id" == "04-support-ticket-triage" ]] && attempts=3
  ok=0
  for ((a = 1; a <= attempts; a++)); do
    if (cd "$ROOT/agents/catalog/$id" && npx eve eval --strict); then
      ok=1
      break
    fi
    [[ "$a" -lt "$attempts" ]] && echo "RETRY $id ($((a + 1))/$attempts)..." && sleep 5
  done
  [[ "$ok" -eq 1 ]] || exit 1
done

echo "==> S-tier evals: all passed"