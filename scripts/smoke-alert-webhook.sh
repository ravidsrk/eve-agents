#!/usr/bin/env bash
# Smoke the A06 alert webhook on a running eve dev server (SEC-001).
# Without ALERT_WEBHOOK_SECRET (or with a wrong secret) the route must 401.
# With the correct secret it must return {ok,sessionId}.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

PORT="${1:-3206}"
require_node24

BASE="http://127.0.0.1:${PORT}/incident"
PAYLOAD='{"title":"Synthetic latency spike","reference":"INC-SMOKE-1","severity":"high"}'

echo "==> Alert webhook smoke on port $PORT"

echo "==> Unauthenticated POST must return 401"
UNAUTH_CODE=$(curl -s -o /tmp/alert-unauth.json -w "%{http_code}" -XPOST "$BASE" \
  -H 'content-type: application/json' \
  -d "$PAYLOAD")
if [[ "$UNAUTH_CODE" != "401" ]]; then
  echo "RESULT: FAIL expected 401 without secret, got $UNAUTH_CODE"
  cat /tmp/alert-unauth.json 2>/dev/null || true
  exit 1
fi
echo "    unauthenticated → 401"

echo "==> Wrong secret must return 401"
WRONG_CODE=$(curl -s -o /tmp/alert-wrong.json -w "%{http_code}" -XPOST "$BASE" \
  -H 'content-type: application/json' \
  -H 'x-alert-webhook-secret: wrong-secret-value' \
  -d "$PAYLOAD")
if [[ "$WRONG_CODE" != "401" ]]; then
  echo "RESULT: FAIL expected 401 with wrong secret, got $WRONG_CODE"
  cat /tmp/alert-wrong.json 2>/dev/null || true
  exit 1
fi
echo "    wrong secret → 401"

if [[ -z "${ALERT_WEBHOOK_SECRET:-}" ]]; then
  echo "RESULT: PASS (auth rejects unauthenticated/wrong secret; set ALERT_WEBHOOK_SECRET to also smoke the happy path)"
  exit 0
fi

echo "==> Authenticated POST must return ok+sessionId"
RESP=$(curl -s -XPOST "$BASE" \
  -H 'content-type: application/json' \
  -H "x-alert-webhook-secret: ${ALERT_WEBHOOK_SECRET}" \
  -d "$PAYLOAD")

echo "$RESP" | node -e '
const j=JSON.parse(require("fs").readFileSync(0,"utf8"));
if(j.ok&&j.sessionId){console.log("RESULT: PASS",j.sessionId);process.exit(0)}
console.log("RESULT: FAIL",j);process.exit(1);
'
