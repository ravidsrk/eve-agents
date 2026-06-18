#!/bin/bash
# Robustness: if the SuperServe VM is destroyed between turns, the backend's reconnect fails and it
# transparently provisions a fresh VM (state is gone, but the agent keeps working — no crash).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

DIR="$ROOT/legacy/archetypes/11-durable-resume"
PORT=3141

require_node24
ensure_env_local "$DIR"

cleanup() { kill_eve_dev "$DIR"; }
trap cleanup EXIT

LOG="/tmp/rob-crash-${PORT}.log"
start_eve_dev "$DIR" "$PORT" "$LOG"
wait_for_health "$PORT"

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"Save the value CRASH-TEST to /workspace/state.txt and confirm."}')

SID=$(json_field "$RESP" sessionId)
TOK=$(json_field "$RESP" continuationToken)
curl -sN -m 50 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >/dev/null 2>&1

SBX=$(grep -oE 'sandbox=[a-f0-9-]+' "$LOG" | tail -1 | cut -d= -f2)
echo "session sandbox = $SBX"

if [ -z "$SBX" ]; then
  echo "RESULT: FAIL (could not read sandbox id from dev log)"
  exit 1
fi

echo "=== destroying the VM out from under the agent ==="
node -e 'import("@superserve/sdk").then(async ({Sandbox})=>{await Sandbox.killById(process.argv[1]);console.log("killed",process.argv[1])})' "$SBX"
sleep 2

echo "=== follow-up turn (backend must recover) ==="
curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session/${SID}" \
  -H 'content-type: application/json' \
  -d "$(node -e 'process.stdout.write(JSON.stringify({continuationToken:process.argv[1],message:process.argv[2]}))' "$TOK" "Read /workspace/state.txt. If it is missing, write RECOVERED to it and confirm what you did.")" >/dev/null

NDJSON="/tmp/rob_crash.ndjson"
curl -sN -m 60 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$NDJSON" 2>/dev/null

NEWSBX=$(grep -oE 'sandbox=[a-f0-9-]+' "$LOG" | tail -1 | cut -d= -f2)
echo "new sandbox = $NEWSBX"

node -e '
const fs=require("fs");
const ls=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean);
const types=[...new Set(ls.map(l=>{try{return JSON.parse(l).type}catch{return"?"}}))];
console.log("turn2 types:",types.join(", "));
const ok=types.includes("turn.completed")&&!types.includes("session.failed");
console.log("turn2 completed cleanly:",ok);
for(const l of ls){
  const e=JSON.parse(l);
  if(e.type==="message.completed") console.log("reply:",(e.data.message??"").slice(0,200));
}
process.exit(ok?0:1);
' "$NDJSON"

HEALTH=$(curl -s -m3 "http://127.0.0.1:${PORT}/eve/v1/health")
echo "health after crash+recovery: $HEALTH"

if [ "$SBX" != "$NEWSBX" ]; then
  echo "RESULT: PASS (recovered on a NEW VM $NEWSBX, old $SBX was destroyed)"
else
  echo "RESULT: FAIL (sandbox id unchanged)"
  exit 1
fi