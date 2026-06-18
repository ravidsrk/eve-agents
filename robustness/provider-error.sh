#!/bin/bash
# Robustness: a bad/unknown model id makes the provider call fail; eve surfaces a clean
# turn.failed event instead of crashing the server.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

DIR="$ROOT/lab"
PORT=3140
ENV_BACKUP=""

require_node24
ensure_env_local "$DIR"

cleanup() {
  kill_eve_dev "$DIR"
  if [ -n "$ENV_BACKUP" ] && [ -f "$ENV_BACKUP" ]; then
    cp "$ENV_BACKUP" "$DIR/.env.local"
    rm -f "$ENV_BACKUP"
  elif [ -f "$ROOT/.secrets/eve.env" ]; then
    cp "$ROOT/.secrets/eve.env" "$DIR/.env.local"
  fi
}
trap cleanup EXIT

ENV_BACKUP="$(mktemp)"
cp "$DIR/.env.local" "$ENV_BACKUP"
grep -v '^OPENROUTER_MODEL=' "$DIR/.env.local" >"$DIR/.env.local.tmp"
mv "$DIR/.env.local.tmp" "$DIR/.env.local"
echo 'OPENROUTER_MODEL=bogus/definitely-not-a-real-model-xyz' >>"$DIR/.env.local"

LOG="/tmp/rob-provider-${PORT}.log"
start_eve_dev "$DIR" "$PORT" "$LOG"
wait_for_health "$PORT"

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}')

SID=$(json_field "$RESP" sessionId)
echo "SID=$SID"

NDJSON="/tmp/rob_provider.ndjson"
curl -sN -m 40 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$NDJSON" 2>/dev/null

echo "--- events ---"
node -e '
const fs=require("fs");
const ls=fs.readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean);
console.log("types:",[...new Set(ls.map(l=>{try{return JSON.parse(l).type}catch{return"?"}}))].join(", "));
for(const l of ls){
  const e=JSON.parse(l);
  if(e.type==="turn.failed") console.log("turn.failed:",JSON.stringify(e.data).slice(0,300));
}
' "$NDJSON"

HEALTH_AFTER=$(curl -s -m3 "http://127.0.0.1:${PORT}/eve/v1/health")
echo "health after failure: $HEALTH_AFTER"

node -e '
const fs=require("fs");
const ls=fs.readFileSync(process.argv[1],"utf8");
const failed=ls.includes("turn.failed");
const up=process.argv[2].includes("\"ok\":true");
console.log((failed&&up)?"RESULT: PASS (turn.failed emitted, server still healthy)":"RESULT: FAIL (failed="+failed+", up="+up+")");
process.exit(failed&&up?0:1);
' "$NDJSON" "$HEALTH_AFTER"