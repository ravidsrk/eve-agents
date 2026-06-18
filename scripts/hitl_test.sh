#!/bin/bash
# Human-in-the-loop proof for archetype 08-hitl: pause at approval, approve, resume.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

DIR="$ROOT/agents/integrations/08-hitl"
PORT=3118
OUT="$DIR/run.log"

require_node24
ensure_env_local "$DIR"

echo "==> HITL test (08-hitl) on port $PORT"
start_eve_dev "$DIR" "$PORT"
wait_for_health "$PORT"

# Phase A: request a refund — should park at input.requested
RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"Please refund charge ch_123 for $40."}')

SID=$(json_field "$RESP" sessionId)
TOK=$(json_field "$RESP" continuationToken)
echo "sessionId=$SID"

TMP_A="/tmp/hitl-phase-a.ndjson"
curl -sN -m 60 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$TMP_A"

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

if [ -z "$REQUEST_ID" ]; then
  echo "FAIL: no input.requested event in phase A"
  kill_eve_dev "$DIR"
  exit 1
fi
echo "requestId=$REQUEST_ID (phase A parked ✓)"

# Phase B: approve and resume
BODY=$(node -e '
process.stdout.write(JSON.stringify({
  continuationToken: process.argv[1],
  inputResponses: [{ requestId: process.argv[2], optionId: "approve" }],
}));
' "$TOK" "$REQUEST_ID")

curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session/${SID}" \
  -H 'content-type: application/json' \
  -d "$BODY" >/dev/null

TMP_B="/tmp/hitl-phase-b.ndjson"
curl -sN -m 60 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$TMP_B"

cat "$TMP_A" "$TMP_B" >"$OUT"

node -e '
const fs=require("fs");
const ls=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean);
const types=[...new Set(ls.map(l=>{try{return JSON.parse(l).type}catch{return"?"}}))];
const hasInput=types.includes("input.requested");
const hasResult=ls.some(l=>{try{const e=JSON.parse(l);return e.type==="action.result"&&e.data?.result?.toolName==="refund_charge"}catch{return false}});
const hasReply=ls.some(l=>{try{const e=JSON.parse(l);return e.type==="message.completed"&&/refund/i.test(e.data?.message??"")}catch{return false}});
if(hasInput&&hasResult&&hasReply) { console.log("RESULT: PASS ✓"); process.exit(0); }
console.log("RESULT: FAIL", {hasInput,hasResult,hasReply});
process.exit(1);
' "$OUT"

kill_eve_dev "$DIR"