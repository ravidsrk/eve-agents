#!/bin/bash
# Run every generated real-world archetype once and capture each NDJSON stream
# to agents/catalog/<id>/run.log. This is intentionally sequential to avoid
# accidentally swamping model/sandbox providers.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/VERIFY-LIVE.md"
START_AT="${START_AT:-01}"
END_AT="${END_AT:-50}"
PROMPT_SUFFIX="${PROMPT_SUFFIX:-Load the dossier, analyze records, write a concise prioritized action report under 500 words, then reply with the report path.}"

{
  echo "# Live catalog verification"
  echo
  echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "| Agent | Port | Result | Events |"
  echo "| --- | ---: | --- | ---: |"
} >"$OUT"

for dir in "$ROOT"/agents/catalog/[0-9][0-9]-*/; do
  base="$(basename "$dir")"
  num="${base%%-*}"
  if [[ "$num" < "$START_AT" || "$num" > "$END_AT" ]]; then
    continue
  fi
  port="32${num}"
  title="${base#??-}"
  title="${title//-/ }"
  prompt="$PROMPT_SUFFIX"
  echo "==> live $base on $port"
  if EVE_STREAM_TIMEOUT_SECONDS="${EVE_STREAM_TIMEOUT_SECONDS:-240}" \
    bash "$ROOT/scripts/run-catalog-agent.sh" "agents/catalog/$base" "$port" "$prompt"; then
    events="$(wc -l <"$dir/run.log" | tr -d ' ')"
    printf '| `%s` | %s | PASS | %s |\n' "$base" "$port" "$events" >>"$OUT"
  else
    events=0
    [ -f "$dir/run.log" ] && events="$(wc -l <"$dir/run.log" | tr -d ' ')"
    printf '| `%s` | %s | FAIL | %s |\n' "$base" "$port" "$events" >>"$OUT"
    exit 1
  fi
done

echo "wrote $OUT"
