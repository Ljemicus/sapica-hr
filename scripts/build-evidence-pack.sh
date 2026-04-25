#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="evidence/$STAMP"
ARTIFACTS="$OUT/_artifacts"
ZIP="petpark-evidence-$STAMP.zip"
HASH_FILE="pack.sha256"

mkdir -p "$ARTIFACTS"

# Precheck before any packing.
gitleaks detect --no-git -v --redact > "$ARTIFACTS/gitleaks-precheck.txt" 2>&1 || true

# Stage only sanitized evidence content.
if [ -d evidence ]; then
  rsync -a \
    --exclude '.env*' \
    --exclude '.next/cache/' \
    --exclude 'node_modules/' \
    --exclude '*.key' \
    --exclude '*.pem' \
    --exclude '*/.DS_Store' \
    evidence/ "$OUT/"
fi

# Keep the current precheck artifact from this run.
mkdir -p "$OUT/_artifacts"
if [ "$ARTIFACTS/gitleaks-precheck.txt" != "$OUT/_artifacts/gitleaks-precheck.txt" ]; then
  cp "$ARTIFACTS/gitleaks-precheck.txt" "$OUT/_artifacts/gitleaks-precheck.txt"
fi

# Defensive scan: no environment files may survive inside staged pack.
if find "$OUT" \( -name '.env' -o -name '.env.*' \) -print | grep -q .; then
  echo "Refusing to build evidence pack: env file detected in $OUT" >&2
  exit 1
fi

# Zip only the sanitized staged directory.
rm -f "$ZIP"
zip -r "$ZIP" "$OUT" \
  -x '*.env' '*.env.*' '.next/cache/*' 'node_modules/*' '*.key' '*.pem' > "$ARTIFACTS/zip.log"
shasum -a 256 "$ZIP" > "$HASH_FILE"

echo "Built $ZIP"
echo "Hash written to $HASH_FILE"
