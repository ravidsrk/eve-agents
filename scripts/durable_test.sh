#!/bin/bash
# Durable-resume proof for archetype 11: save state, kill the server process, recall on a new one.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

DIR="$ROOT/legacy/archetypes/11-durable-resume"
PORT=3111
OUT="$DIR/run.log"

require_node24
ensure_env_local "$DIR"

RAND="PURPLE-42-$(date +%s)"
SAVE_MSG="Save the secret code '${RAND}' to /workspace/state.txt, then confirm."
RECALL_MSG="Read /workspace/state.txt and tell me the exact secret code stored there."

echo "==> Durable resume test (11-durable-resume) secret=$RAND"

# --- Process #1: save ---
start_eve_dev "$DIR" "$PORT"
wait_for_health "$PORT"
PID1=""
[ -f "$DIR/.eve/dev-process.pid" ] && PID1="$(cat "$DIR/.eve/dev-process.pid")"
echo "=== PROCESS #1: save === PID1=$PID1"

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d "$(node -e 'process.stdout.write(JSON.stringify({message:process.argv[1]}))' "$SAVE_MSG")")

SID=$(json_field "$RESP" sessionId)
TOK=$(json_field "$RESP" continuationToken)
echo "SID=$SID"

TMP1="/tmp/durable-phase1.ndjson"
curl -sN -m 90 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$TMP1"

# Kill the entire dev server (not just the curl client)
echo "=== KILL server #1 entirely ==="
kill_eve_dev "$DIR"
sleep 2

# --- Process #2: recall on a fresh server ---
start_eve_dev "$DIR" "$PORT"
wait_for_health "$PORT"
PID2=""
[ -f "$DIR/.eve/dev-process.pid" ] && PID2="$(cat "$DIR/.eve/dev-process.pid")"
echo "=== PROCESS #2: recall === PID2=$PID2"

curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session/${SID}" \
  -H 'content-type: application/json' \
  -d "$(node -e 'process.stdout.write(JSON.stringify({continuationToken:process.argv[1],message:process.argv[2]}))' "$TOK" "$RECALL_MSG")" >/dev/null

TMP2="/tmp/durable-phase2.ndjson"
curl -sN -m 90 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$TMP2"

cat "$TMP1" "$TMP2" >"$OUT"

node -e '
const fs=require("fs");
const secret=process.argv[2];
const ls=fs.readFileSync(process.argv[1],"utf8");
const recalled=ls.includes(secret);
const completed=ls.includes("turn.completed");
if(recalled&&completed) { console.log("RESULT: PASS ✓ (recalled",secret,"after full restart)"); process.exit(0); }
console.log("RESULT: FAIL", {recalled,completed});
process.exit(1);
' "$OUT" "$RAND"

kill_eve_dev "$DIR"