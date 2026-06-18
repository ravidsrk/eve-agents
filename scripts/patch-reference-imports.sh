#!/bin/bash
# Rewrite agent/ relative imports .js → .ts for monorepo eve workflow snapshots.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for dir in "$ROOT"/agents/reference/*/agent; do
  [ -d "$dir" ] || continue
  find "$dir" -name '*.ts' -print0 | while IFS= read -r -d '' f; do
    sed -i '' -E 's|from "(\.\.?/[^"]+)\.js"|from "\1.ts"|g' "$f" 2>/dev/null \
      || sed -i -E 's|from "(\.\.?/[^"]+)\.js"|from "\1.ts"|g' "$f"
  done
  echo "patched $(dirname "$dir")"
done