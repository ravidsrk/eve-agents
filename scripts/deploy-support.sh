#!/usr/bin/env bash
# Build and deploy the second-wave catalog agent (04-support-ticket-triage) to Vercel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/deploy-catalog.sh" 04-support-ticket-triage ${@+"$@"}