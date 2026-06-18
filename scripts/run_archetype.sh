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
curl -sN -m 120 "http://127.0.0.1:${PORT}/eve/v1/session/${SID}/stream" >"$OUT"
echo "wrote $OUT ($(wc -l <"$OUT" | tr -d ' ') events)"

kill_eve_dev "$DIR"
echo "done"