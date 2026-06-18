#!/bin/bash
# Boot an eve archetype, drive one session, capture the NDJSON stream to run.log.
#
# Usage (from repo root):
#   bash scripts/run_archetype.sh <archetype-dir> <port> "<message>"
#
# Example:
#   bash scripts/run_archetype.sh archetypes/01-data-analyst 3101 "Which region has the highest revenue?"
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib.sh
source "$ROOT/scripts/lib.sh"

DIR="${1:-}"
PORT="${2:-}"
MESSAGE="${3:-}"

if [ -z "$DIR" ] || [ -z "$PORT" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: bash scripts/run_archetype.sh <archetype-dir> <port> \"<message>\""
  exit 1
fi

if [[ "$DIR" != /* ]]; then
  DIR="$ROOT/$DIR"
fi

if [ ! -f "$DIR/package.json" ]; then
  echo "Not an eve project: $DIR"
  exit 1
fi

require_node24
ensure_env_local "$DIR"

LOG="/tmp/eve-archetype-${PORT}.log"
OUT="$DIR/run.log"

echo "==> $(basename "$DIR") on port $PORT"
start_eve_dev "$DIR" "$PORT" "$LOG"
trap 'kill_eve_dev "$DIR"' EXIT
wait_for_health "$PORT"

RESP=$(curl -s -XPOST "http://127.0.0.1:${PORT}/eve/v1/session" \
  -H 'content-type: application/json' \
  -d "$(node -e 'process.stdout.write(JSON.stringify({message:process.argv[1]}))' "$MESSAGE")")

SID=$(json_field "$RESP" sessionId)
TOK=$(json_field "$RESP" continuationToken)

if [ -z "$SID" ]; then
  echo "Failed to create session:"
  echo "$RESP"
  kill_eve_dev "$DIR"
  exit 1
fi

echo "sessionId=$SID"
STREAM_TIMEOUT="${EVE_STREAM_TIMEOUT_SECONDS:-180}"
set +e
curl -sN -m "$STREAM_TIMEOUT" "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$OUT"
CURL_STATUS=$?
set -e

if [ "$CURL_STATUS" -ne 0 ]; then
  if grep -q '"type":"session.waiting"\|"type":"session.completed"' "$OUT"; then
    echo "stream ended with curl status $CURL_STATUS after completion marker"
  else
    echo "stream failed with curl status $CURL_STATUS before completion marker"
    exit "$CURL_STATUS"
  fi
fi
echo "wrote $OUT ($(wc -l <"$OUT" | tr -d ' ') events)"

kill_eve_dev "$DIR"
trap - EXIT
echo "done"
