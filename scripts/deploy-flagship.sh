#!/usr/bin/env bash
# Build and deploy the flagship catalog agent (06-incident-commander) to Vercel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/deploy-catalog.sh" 06-incident-commander ${@+"$@"}