#!/usr/bin/env bash
# HITL proof for catalog agent 05-refund-approval-operator (refund_charge approval gate).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

DIR="$ROOT/agents/catalog/05-refund-approval-operator"
PORT=3205
OUT="$DIR/evidence/hitl-run.ndjson"

require_node24
ensure_env_local "$DIR"

echo "==> HITL catalog test (05-refund-approval-operator) on port $PORT"
start_eve_dev "$DIR" "$PORT"
wait_for_health "$PORT"

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"Refund charge ch_123 for $40 now using refund_charge. Do not load the dossier first."}')

SID=$(json_field "$RESP" sessionId)
TOK=$(json_field "$RESP" continuationToken)

TMP_A="/tmp/catalog-hitl-a.ndjson"
curl -sN -m 90 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$TMP_A" || true

REQUEST_ID=$(node -e '
const fs=require("fs");
for (const line of fs.readFileSync(process.argv[1],"utf8").trim().split("\n")) {
  try {
    const e=JSON.parse(line);
    if (e.type==="input.requested" && e.data?.requests?.[0]?.requestId) {
      process.stdout.write(e.data.requests[0].requestId);
      process.exit(0);
    }
  } catch {}
}
process.exit(1);
' "$TMP_A")

BODY=$(node -e '
process.stdout.write(JSON.stringify({
  continuationToken: process.argv[1],
  inputResponses: [{ requestId: process.argv[2], optionId: "approve" }],
}));
' "$TOK" "$REQUEST_ID")

curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session/${SID}" \
  -H 'content-type: application/json' -d "$BODY" >/dev/null

TMP_B="/tmp/catalog-hitl-b.ndjson"
curl -sN -m 90 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$TMP_B" || true

mkdir -p "$(dirname "$OUT")"
cat "$TMP_A" "$TMP_B" >"$OUT"

node -e '
const fs=require("fs");
const ls=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean);
const hasInput=ls.some(l=>{try{return JSON.parse(l).type==="input.requested"}catch{return false}});
const hasRefund=ls.some(l=>{try{const e=JSON.parse(l);return e.type==="action.result"&&e.data?.result?.toolName==="refund_charge"}catch{return false}});
if(hasInput&&hasRefund){console.log("RESULT: PASS");process.exit(0)}
console.log("RESULT: FAIL",{hasInput,hasRefund});
process.exit(1);
' "$OUT"

kill_eve_dev "$DIR"