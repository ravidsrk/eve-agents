#!/bin/bash
# Boot a production agent, drive one session, capture NDJSON to run.log.
# Usage: bash scripts/run-production-agent.sh <slug> <port> "<message>"
# Example: bash scripts/run-production-agent.sh p01-incident-triage 3301 "Triage sample-incident.log"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

SLUG="${1:-}"
PORT="${2:-}"
MESSAGE="${3:-}"

if [ -z "$SLUG" ] || [ -z "$PORT" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: bash scripts/run-production-agent.sh <slug> <port> \"<message>\""
  exit 1
fi

DIR="$ROOT/agents/production/$SLUG"
if [ ! -f "$DIR/package.json" ]; then
  echo "Unknown production agent: $SLUG"
  exit 1
fi

require_node24
export EVE_KILL_SANDBOX_ON_DISPOSE=1
ensure_env_local "$DIR"

LOG="/tmp/eve-production-${PORT}.log"
OUT="$DIR/run.log"

echo "==> production/$SLUG on port $PORT"
start_eve_dev "$DIR" "$PORT" "$LOG"
wait_for_health "$PORT"

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d "$(node -e 'process.stdout.write(JSON.stringify({message:process.argv[1]}))' "$MESSAGE")")

SID=$(json_field "$RESP" sessionId)
if [ -z "$SID" ]; then
  echo "Failed to create session:"
  echo "$RESP"
  kill_eve_dev "$DIR"
  exit 1
fi

echo "sessionId=$SID"
curl -sN -m 420 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$OUT" || true
LINES=$(wc -l <"$OUT" | tr -d ' ')
echo "wrote $OUT ($LINES events)"
if ! grep -q '"type":"turn.completed"' "$OUT" 2>/dev/null; then
  echo "WARN: stream ended before turn.completed (curl timeout or agent error)"
  kill_eve_dev "$DIR"
  exit 1
fi
kill_eve_dev "$DIR"
echo "done"