#!/usr/bin/env bash
# Lab smoke: eve build for each production agent (keyless structural + compile).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0
PASS=0

for dir in "$ROOT"/agents/production/p*/; do
  name=$(basename "$dir")
  echo ""
  echo "======== $name ========"
  if (cd "$dir" && npm run build); then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAILED: $name"
  fi
done

echo ""
echo "Production builds: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]]