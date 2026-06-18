#!/bin/bash
# Drive one session through each production agent. Stops on first failure unless CONTINUE=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

require_node24
bash "$ROOT/scripts/setup.sh" >/dev/null

declare -a RUNS=(
  "p01-incident-triage|3311|Triage /workspace/sample-incident.log. Use parse_logs then explain_error. Give SEV level and mitigations."
  "p02-pr-review|3312|Generate a PR description for: fix null pointer in checkout timeout handler."
  "p03-competitive-intel|3313|Weekly digest: Vercel vs Netlify product and pricing news from the last 7 days. Use web_search."
  'p04-invoice-extractor|3314|Extract line items from this invoice text: INV-2024-001 Acme Corp 3x Widget $10 $30 total $30.'
  "p05-support-router|3315|Customer says: I was charged twice for my subscription. Route to the right team and draft a reply."
  "p06-sql-analyst|3316|Using /workspace/schema.sql, write a SQL query for top 5 customers by order count."
  "p07-runbook-executor|3317|Execute /workspace/runbook-restart-service.md for service checkout-service in staging."
  "p08-lead-enricher|3318|Enrich lead: Jane Doe, jane@acmecorp.com, Acme Corp. Summarize company and contact intel."
  "p09-contract-checker|3319|Review this clause for red flags vs /workspace/policy-red-flags.md: Provider may change fees with 24h notice."
  "p10-pipeline-debugger|3320|Debug /workspace/sample-etl-failure.log. Use parse_logs and identify root cause."
)

PASS=0
FAIL=0
for entry in "${RUNS[@]}"; do
  IFS='|' read -r slug port msg <<<"$entry"
  echo ""
  echo "######## $slug ########"
  if bash "$ROOT/scripts/run-production-agent.sh" "$slug" "$port" "$msg"; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAILED: $slug"
    [ "${CONTINUE:-0}" = "1" ] || exit 1
  fi
done

echo ""
echo "Production runs: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]