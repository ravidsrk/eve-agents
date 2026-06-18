#!/bin/bash
# Shared helpers for eve-exploration test harnesses.
set -euo pipefail

repo_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
}

require_node24() {
  if ! node -e 'process.exit(parseInt(process.versions.node) >= 24 ? 0 : 1)' 2>/dev/null; then
    echo "Node 24+ required (eve engines). Try: nvm install 24 && nvm use 24"
    exit 1
  fi
}

ensure_env_local() {
  local dir="$1"
  if [ ! -f "$dir/.env.local" ]; then
    local secrets
    secrets="$(repo_root)/.secrets/eve.env"
    if [ -f "$secrets" ]; then
      cp "$secrets" "$dir/.env.local"
    else
      echo "Missing $dir/.env.local — run: bash scripts/setup.sh"
      exit 1
    fi
  fi
}

kill_eve_dev() {
  local dir="$1"
  if [ -f "$dir/.eve/dev-process.pid" ]; then
    kill -9 "$(cat "$dir/.eve/dev-process.pid")" 2>/dev/null || true
    rm -f "$dir/.eve/dev-process.pid"
    sleep 1
  fi
}

start_eve_dev() {
  local dir="$1"
  local port="$2"
  local log="${3:-/tmp/eve-dev-${port}.log}"
  kill_eve_dev "$dir"
  (
    cd "$dir"
    rm -rf .eve
    if [ -f .env.local ]; then set -a && source .env.local && set +a; fi
    nohup npx eve dev --no-ui --port "$port" >"$log" 2>&1 &
  )
}

wait_for_health() {
  local port="$1"
  local tries="${2:-50}"
  local i
  for ((i = 1; i <= tries; i++)); do
    if curl -s -m3 "http://127.0.0.1:${port}/eve/v1/health" 2>/dev/null | grep -q '"ok":true'; then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for eve dev on port $port"
  return 1
}

json_field() {
  local json="$1"
  local field="$2"
  node -e 'const d=JSON.parse(process.argv[1]);process.stdout.write(String(d[process.argv[2]]??""))' "$json" "$field"
}