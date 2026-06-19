#!/usr/bin/env bash
# Smoke a deployed catalog agent: health (public) + session (basic auth or OIDC).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

URL="${1:?deployment URL, e.g. https://eve-incident-commander.vercel.app}"
AGENT_DIR="${2:-}"

echo "==> health $URL"
code=$(curl -sS -o /tmp/eve-health.json -w "%{http_code}" "$URL/eve/v1/health")
echo "HTTP $code"
cat /tmp/eve-health.json
echo ""
[[ "$code" == "200" ]] || exit 1

USER="${ROUTE_AUTH_BASIC_USER:-}"
PASS="${ROUTE_AUTH_BASIC_PASSWORD:-}"
if [[ -z "$USER" || -z "$PASS" ]] && [[ -n "$AGENT_DIR" && -f "$AGENT_DIR/.env.local" ]]; then
  # shellcheck disable=SC1090
  set -a && source "$AGENT_DIR/.env.local" && set +a
  USER="${ROUTE_AUTH_BASIC_USER:-}"
  PASS="${ROUTE_AUTH_BASIC_PASSWORD:-}"
fi

if [[ -n "$USER" && -n "$PASS" ]]; then
  echo "==> session (HTTP basic)"
  code=$(curl -sS -o /tmp/eve-session.json -w "%{http_code}" -u "$USER:$PASS" \
    -X POST "$URL/eve/v1/session" \
    -H 'content-type: application/json' \
    -d '{"message":"Reply with exactly: DEPLOY-OK"}')
  echo "HTTP $code"
  head -c 800 /tmp/eve-session.json
  echo ""
  [[ "$code" == "200" || "$code" == "201" || "$code" == "202" ]] || exit 1
else
  echo "SKIP session — set ROUTE_AUTH_BASIC_USER/PASSWORD (or agent .env.local)"
fi

echo "PASS: deployed smoke for $URL"