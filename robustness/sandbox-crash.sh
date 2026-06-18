#!/bin/bash
# Robustness: if the SuperServe VM is destroyed between turns, the backend's reconnect fails and it
# transparently provisions a fresh VM (state is gone, but the agent keeps working — no crash).
set -u
export NVM_DIR="$HOME/.nvm"; export PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH"; hash -r 2>/dev/null || true
DIR=/workspace/archetypes/11-durable-resume; PORT=3141
cd "$DIR"
[ -f .eve/dev-process.pid ] && { kill -9 "$(cat .eve/dev-process.pid)" 2>/dev/null; sleep 1; }
setsid npx eve dev --no-ui --port $PORT >/tmp/dev_$PORT.log 2>&1 &
for i in $(seq 1 50); do curl -s -m3 localhost:$PORT/eve/v1/health 2>/dev/null | grep -q '"ok":true' && break; sleep 1; done

RESP=$(curl -s -XPOST localhost:$PORT/eve/v1/session -H 'content-type: application/json' -d '{"message":"Save the value CRASH-TEST to /workspace/state.txt and confirm."}')
SID=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).sessionId)' "$RESP")
TOK=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).continuationToken)' "$RESP")
curl -sN -m 50 "localhost:$PORT/eve/v1/session/$SID/stream" >/dev/null 2>&1
SBX=$(grep -oE 'sandbox=[a-f0-9-]+' /tmp/dev_$PORT.log | tail -1 | cut -d= -f2)
echo "session sandbox = $SBX"

echo "=== destroying the VM out from under the agent ==="
node -e 'import("@superserve/sdk").then(async ({Sandbox})=>{await Sandbox.killById(process.argv[1]);console.log("killed",process.argv[1])})' "$SBX"
sleep 2

echo "=== follow-up turn (backend must recover) ==="
curl -s -XPOST "localhost:$PORT/eve/v1/session/$SID" -H 'content-type: application/json' -d "{\"continuationToken\":\"$TOK\",\"message\":\"Read /workspace/state.txt. If it is missing, write RECOVERED to it and confirm what you did.\"}" >/dev/null
curl -sN -m 60 "localhost:$PORT/eve/v1/session/$SID/stream" > /tmp/rob_crash.ndjson 2>/dev/null
NEWSBX=$(grep -oE 'sandbox=[a-f0-9-]+' /tmp/dev_$PORT.log | tail -1 | cut -d= -f2)
echo "new sandbox = $NEWSBX"
node -e 'const ls=require("fs").readFileSync("/tmp/rob_crash.ndjson","utf8").trim().split("\n").filter(Boolean);const types=[...new Set(ls.map(l=>{try{return JSON.parse(l).type}catch{return"?"}}))];console.log("turn2 types:",types.join(", "));const ok=types.includes("turn.completed")&&!types.includes("session.failed");console.log("turn2 completed cleanly:",ok);for(const l of ls){const e=JSON.parse(l);if(e.type==="message.completed")console.log("reply:",e.data.message.slice(0,200))}'
HEALTH=$(curl -s -m3 localhost:$PORT/eve/v1/health)
echo "health after crash+recovery: $HEALTH"
[ "$SBX" != "$NEWSBX" ] && echo "RESULT: PASS (recovered on a NEW VM $NEWSBX, old $SBX was destroyed)" || echo "RESULT: CHECK (sandbox id unchanged)"
kill -9 "$(cat .eve/dev-process.pid 2>/dev/null)" 2>/dev/null
echo done
