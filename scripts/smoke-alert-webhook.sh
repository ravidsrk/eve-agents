#!/usr/bin/env bash
# Smoke the A06 alert webhook on a running eve dev server.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

PORT="${1:-3206}"
require_node24

echo "==> Alert webhook smoke on port $PORT"
CURL_HEADERS=(-H 'content-type: application/json')
if [[ -n "${ALERT_WEBHOOK_SECRET:-}" ]]; then
  CURL_HEADERS+=(-H "x-alert-webhook-secret: ${ALERT_WEBHOOK_SECRET}")
fi

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/incident" \
  "${CURL_HEADERS[@]}" \
  -d '{"title":"Synthetic latency spike","reference":"INC-SMOKE-1","severity":"high"}')

echo "$RESP" | node -e '
const j=JSON.parse(require("fs").readFileSync(0,"utf8"));
if(j.ok&&j.sessionId){console.log("RESULT: PASS",j.sessionId);process.exit(0)}
console.log("RESULT: FAIL",j);process.exit(1);
'