#!/bin/bash
# Robustness: a bad/unknown model id makes the provider call fail; eve surfaces a clean
# turn.failed event instead of crashing the server.
set -u
export NVM_DIR="$HOME/.nvm"; export PATH="$HOME/.nvm/versions/node/v24.17.0/bin:$PATH"; hash -r 2>/dev/null || true
DIR=/workspace/eve-lab; PORT=3140
cd "$DIR"
[ -f .eve/dev-process.pid ] && { kill -9 "$(cat .eve/dev-process.pid)" 2>/dev/null; sleep 1; }
# Force a bogus model via env (overrides .env.local through the harness export order).
export OPENROUTER_MODEL="bogus/definitely-not-a-real-model-xyz"
# Strip the override from .env.local for this run so our env wins.
grep -v '^OPENROUTER_MODEL=' .env.local > .env.local.tmp && cp .env.local.tmp .env.local && rm -f .env.local.tmp

setsid npx eve dev --no-ui --port $PORT >/tmp/dev_$PORT.log 2>&1 &
for i in $(seq 1 50); do curl -s -m3 localhost:$PORT/eve/v1/health 2>/dev/null | grep -q '"ok":true' && break; sleep 1; done
SID=$(curl -s -XPOST localhost:$PORT/eve/v1/session -H 'content-type: application/json' -d '{"message":"hello"}' | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).sessionId||"")}catch{process.stdout.write("")}})')
echo "SID=$SID"
curl -sN -m 40 "localhost:$PORT/eve/v1/session/$SID/stream" > /tmp/rob_provider.ndjson 2>/dev/null
echo "--- events ---"
node -e 'const ls=require("fs").readFileSync("/tmp/rob_provider.ndjson","utf8").trim().split("\n").filter(Boolean);console.log("types:",[...new Set(ls.map(l=>{try{return JSON.parse(l).type}catch{return"?"}}))].join(", "));for(const l of ls){const e=JSON.parse(l);if(e.type==="turn.failed")console.log("turn.failed:",JSON.stringify(e.data).slice(0,300))}'
HEALTH_AFTER=$(curl -s -m3 localhost:$PORT/eve/v1/health)
echo "health after failure: $HEALTH_AFTER"
node -e 'const ls=require("fs").readFileSync("/tmp/rob_provider.ndjson","utf8");const failed=ls.includes("turn.failed");const up=process.argv[1].includes("\"ok\":true");console.log((failed&&up)?"RESULT: PASS (turn.failed emitted, server still healthy)":"RESULT: CHECK (failed="+failed+", up="+up+")")' "$HEALTH_AFTER"
kill -9 "$(cat .eve/dev-process.pid 2>/dev/null)" 2>/dev/null
# restore .env.local
cp /workspace/.secrets/eve.env .env.local
echo done
