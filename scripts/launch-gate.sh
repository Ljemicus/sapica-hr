#!/usr/bin/env bash
set +euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

ARTIFACT_DIR="${LAUNCH_GATE_ARTIFACT_DIR:-/tmp/petpark-launch-gate}"
mkdir -p "$ARTIFACT_DIR"
REPORT="docs/recovery/LAUNCH_GATE_REPORT.md"
NOW_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

pass=0
fail=0
unknown=0
rows=()

record() {
  local name="$1" status="$2" detail="$3" artifact="${4:-}"
  rows+=("| ${name} | ${status} | ${detail} | ${artifact} |")
  case "$status" in
    PASS) pass=$((pass+1));;
    FAIL) fail=$((fail+1));;
    *) unknown=$((unknown+1));;
  esac
}

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'
}

echo "=== Launch Gate Check ==="
echo "timestamp_utc=$NOW_UTC"
echo "artifact_dir=$ARTIFACT_DIR"

run_sql_count() {
  local sql="$1" out="$2" err="$3"
  if [[ -z "${DB_URL:-}" ]]; then
    return 2
  fi
  if command -v psql >/dev/null 2>&1; then
    psql "$DB_URL" -tAc "$sql" > "$out" 2> "$err"
    return $?
  fi
  node - "$sql" > "$out" 2> "$err" <<'NODE'
const { Client } = require('pg');
const sql = process.argv[2];
const client = new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
(async () => {
  await client.connect();
  const result = await client.query(sql);
  const value = Object.values(result.rows[0] || {})[0];
  console.log(value ?? '');
  await client.end();
})().catch(async (error) => {
  console.error(error.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
NODE
}

echo "1. RLS-disabled public tables"
if [[ -n "${DB_URL:-}" ]]; then
  run_sql_count "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity;" "$ARTIFACT_DIR/rls_disabled.txt" "$ARTIFACT_DIR/rls_disabled.err"
  code=$?
  count="$(tr -d '[:space:]' < "$ARTIFACT_DIR/rls_disabled.txt" 2>/dev/null)"
  if [[ $code -eq 0 && "$count" == "0" ]]; then
    record "RLS-disabled public tables" "PASS" "0" "rls_disabled.txt"
  elif [[ $code -eq 0 ]]; then
    record "RLS-disabled public tables" "FAIL" "$count tables without RLS" "rls_disabled.txt"
  else
    record "RLS-disabled public tables" "UNKNOWN" "DB query failed" "rls_disabled.err"
  fi
else
  record "RLS-disabled public tables" "UNKNOWN" "DB_URL not set" ""
fi

echo "2. npm audit high+critical"
npm audit --json > "$ARTIFACT_DIR/npm-audit.json" 2>/dev/null
audit_code=$?
highcrit="$(jq -r '(.metadata.vulnerabilities.high // 0) + (.metadata.vulnerabilities.critical // 0)' "$ARTIFACT_DIR/npm-audit.json" 2>/dev/null)"
if [[ "$highcrit" == "0" ]]; then
  record "npm audit high+critical" "PASS" "0" "npm-audit.json"
else
  record "npm audit high+critical" "FAIL" "${highcrit:-unknown}" "npm-audit.json"
fi

echo "3. gitleaks tracked-source scan"
GITLEAKS_SOURCE="$ARTIFACT_DIR/gitleaks-source"
rm -rf "$GITLEAKS_SOURCE"
mkdir -p "$GITLEAKS_SOURCE"
git ls-files -z | rsync -a --files-from=- --from0 ./ "$GITLEAKS_SOURCE"/
gitleaks detect --no-git --source "$GITLEAKS_SOURCE" -v --redact > "$ARTIFACT_DIR/gitleaks-no-git.txt" 2>&1
gitleaks_code=$?
findings="$(grep -c '^Finding' "$ARTIFACT_DIR/gitleaks-no-git.txt" || true)"
if [[ $gitleaks_code -eq 0 && "$findings" == "0" ]]; then
  record "gitleaks tracked source" "PASS" "0 findings" "gitleaks-no-git.txt"
else
  record "gitleaks tracked source" "FAIL" "exit=$gitleaks_code findings=$findings" "gitleaks-no-git.txt"
fi

echo "4. tests"
npm test > "$ARTIFACT_DIR/npm-test.log" 2>&1
test_code=$?
if [[ $test_code -eq 0 ]]; then
  record "npm test" "PASS" "exit=0" "npm-test.log"
else
  record "npm test" "FAIL" "exit=$test_code" "npm-test.log"
fi

echo "5. Lighthouse live mobile smoke"
mkdir -p "$ARTIFACT_DIR/lighthouse"
lighthouse_fail=0
lighthouse_summary=""
if [[ -z "${CHROME_PATH:-}" ]]; then
  CHROME_PATH="$(node -e "try{console.log(require('playwright').chromium.executablePath())}catch(e){}")"
  export CHROME_PATH
fi
for pair in "home|https://petpark.hr/" "pretraga|https://petpark.hr/pretraga" "blog|https://petpark.hr/blog"; do
  slug="${pair%%|*}"
  url="${pair##*|}"
  npx lighthouse "$url" --form-factor=mobile --throttling-method=simulate --output=json --output-path="$ARTIFACT_DIR/lighthouse/${slug}-mobile.json" --chrome-flags="--headless --no-sandbox" --quiet > "$ARTIFACT_DIR/lighthouse/${slug}.stdout" 2> "$ARTIFACT_DIR/lighthouse/${slug}.stderr"
  code=$?
  if [[ $code -ne 0 ]]; then
    lighthouse_fail=1
    lighthouse_summary+="$slug:error "
    continue
  fi
  lcp="$(jq -r '.audits["largest-contentful-paint"].numericValue // empty' "$ARTIFACT_DIR/lighthouse/${slug}-mobile.json")"
  perf="$(jq -r '.categories.performance.score // empty' "$ARTIFACT_DIR/lighthouse/${slug}-mobile.json")"
  lcp_int="${lcp%.*}"
  lighthouse_summary+="$slug:perf=$perf,lcp_ms=${lcp_int:-unknown} "
  if [[ -z "$lcp_int" || "$lcp_int" -gt 2500 ]]; then
    lighthouse_fail=1
  fi
done
if [[ $lighthouse_fail -eq 0 ]]; then
  record "Lighthouse mobile LCP" "PASS" "$lighthouse_summary" "lighthouse/"
else
  record "Lighthouse mobile LCP" "FAIL" "$lighthouse_summary" "lighthouse/"
fi

echo "6. axe serious/critical"
A11Y_BASE_URL=https://petpark.hr node scripts/run-a11y.js > "$ARTIFACT_DIR/axe.log" 2>&1
axe_code=$?
if [[ $axe_code -eq 0 ]]; then
  record "axe serious/critical" "PASS" "0 serious/critical on configured routes" "axe.log"
else
  record "axe serious/critical" "FAIL" "exit=$axe_code" "axe.log"
fi

echo "7. idempotency grep"
node <<'NODE' > "$ARTIFACT_DIR/missing-idempotency.txt"
const fs = require('fs');
const path = require('path');
const roots = ['app', 'lib'];
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return exts.has(path.extname(entry.name)) ? [p] : [];
  });
}
const patterns = [
  /stripe\.checkout\.sessions\.create\s*\(/,
  /stripe\.paymentIntents\.create\s*\(/,
  /stripe\.accountLinks\.create\s*\(/,
  /stripe\.accounts\.create\s*\(/,
  /stripe\.refunds\.create\s*\(/,
];
for (const file of roots.flatMap(walk)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (!patterns.some((pattern) => pattern.test(line))) return;
    const block = lines.slice(idx, Math.min(lines.length, idx + 24)).join('\n');
    if (!/idempotencyKey\s*:/.test(block)) {
      console.log(`${file}:${idx + 1}:${line.trim()}`);
    }
  });
}
NODE
missing_idem_count="$(wc -l < "$ARTIFACT_DIR/missing-idempotency.txt" | tr -d ' ')"
if [[ "$missing_idem_count" == "0" ]]; then
  record "Stripe create idempotency" "PASS" "0 missing idempotencyKey" "missing-idempotency.txt"
else
  record "Stripe create idempotency" "FAIL" "$missing_idem_count missing idempotencyKey" "missing-idempotency.txt"
fi

echo "8. webhook events handled"
webhook_count="$(grep -cE "case '(checkout\.session\.expired|charge\.refunded|refund\.created|charge\.dispute\.created|payout\.failed|payment_intent\.canceled)'" app/api/payments/webhook/route.ts || true)"
if [[ "$webhook_count" -ge 6 ]]; then
  record "Webhook event coverage" "PASS" "$webhook_count target cases" ""
else
  record "Webhook event coverage" "FAIL" "$webhook_count/6 target cases" ""
fi

echo "9. Zagreb Tier A providers"
if [[ -n "${DB_URL:-}" ]]; then
  run_sql_count "SELECT count(*) FROM providers p JOIN profiles pr ON pr.id=p.profile_id WHERE p.public_status='listed' AND p.verified_status='verified' AND pr.city ILIKE 'Zagreb';" "$ARTIFACT_DIR/zagreb-providers.txt" "$ARTIFACT_DIR/zagreb-providers.err"
  zg_code=$?
  zg="$(tr -d '[:space:]' < "$ARTIFACT_DIR/zagreb-providers.txt" 2>/dev/null)"
  if [[ $zg_code -eq 0 && "$zg" -ge 5 ]]; then
    record "Zagreb Tier A providers" "PASS" "$zg/5" "zagreb-providers.txt"
  elif [[ $zg_code -eq 0 ]]; then
    record "Zagreb Tier A providers" "FAIL" "$zg/5" "zagreb-providers.txt"
  else
    record "Zagreb Tier A providers" "UNKNOWN" "DB query failed" "zagreb-providers.err"
  fi
else
  # Fallback to documented current state if DB_URL is unavailable.
  if [[ -f docs/recovery/ZAGREB_TIER_A_STATUS.md ]]; then
    current="$(grep -E '^\| Listed \+ verified Zagreb sitters' docs/recovery/ZAGREB_TIER_A_STATUS.md | awk -F'|' '{gsub(/ /,"",$3); print $3}')"
    if [[ -n "$current" && "$current" -ge 5 ]]; then
      record "Zagreb Tier A providers" "PASS" "$current/5 from status doc" "docs/recovery/ZAGREB_TIER_A_STATUS.md"
    else
      record "Zagreb Tier A providers" "FAIL" "${current:-unknown}/5 from status doc" "docs/recovery/ZAGREB_TIER_A_STATUS.md"
    fi
  else
    record "Zagreb Tier A providers" "UNKNOWN" "DB_URL not set and no status doc" ""
  fi
fi

echo "10. DMARC"
dig +short TXT _dmarc.petpark.hr > "$ARTIFACT_DIR/dmarc.txt" 2>&1
dmarc="$(cat "$ARTIFACT_DIR/dmarc.txt" | tr '\n' ' ')"
if echo "$dmarc" | grep -q 'rua=' && echo "$dmarc" | grep -q 'ruf='; then
  record "DMARC monitoring" "PASS" "$dmarc" "dmarc.txt"
else
  record "DMARC monitoring" "FAIL" "missing rua/ruf: $dmarc" "dmarc.txt"
fi

echo "11. GDPR endpoints"
curl -sSI https://petpark.hr/api/account/export > "$ARTIFACT_DIR/gdpr-export-head.txt" 2>&1
curl -sSI https://petpark.hr/api/account/delete > "$ARTIFACT_DIR/gdpr-delete-head.txt" 2>&1
export_head="$(head -1 "$ARTIFACT_DIR/gdpr-export-head.txt")"
delete_head="$(head -1 "$ARTIFACT_DIR/gdpr-delete-head.txt")"
if echo "$export_head $delete_head" | grep -Eq 'HTTP/[0-9.]+ (200|401|405)'; then
  record "GDPR endpoints reachable" "PASS" "export=${export_head}; delete=${delete_head}" "gdpr-*-head.txt"
else
  record "GDPR endpoints reachable" "FAIL" "export=${export_head}; delete=${delete_head}" "gdpr-*-head.txt"
fi

cat > "$REPORT" <<EOF_REPORT
# PetPark Launch Gate Report

Generated: $NOW_UTC
Branch: $(git branch --show-current)
Commit: $(git rev-parse --short HEAD)
Artifact dir: \`$ARTIFACT_DIR\`

## Summary

| Metric | Count |
|---|---:|
| PASS | $pass |
| FAIL | $fail |
| UNKNOWN | $unknown |

## Gate results

| Gate | Status | Detail | Artifact |
|---|---|---|---|
$(printf '%s\n' "${rows[@]}")

## Decision

EOF_REPORT

if [[ $fail -eq 0 && $unknown -eq 0 ]]; then
  cat >> "$REPORT" <<'EOF_REPORT'
**LAUNCH READY** — all launch gate checks passed.
EOF_REPORT
  exit_code=0
else
  cat >> "$REPORT" <<'EOF_REPORT'
**NOT LAUNCH READY** — one or more launch gate checks failed or could not be verified. Keep site in pre-launch / recovery posture and run targeted fixes for each failing gate.
EOF_REPORT
  exit_code=1
fi

cat >> "$REPORT" <<EOF_REPORT

## Notes

- This script does not perform destructive DB changes.
- DB-backed checks use \`DB_URL\` when available; otherwise they are marked UNKNOWN or use existing recovery status docs where explicitly noted.
- Gitleaks output is redacted and stored outside the repo artifact dir by default.
EOF_REPORT

cat "$REPORT"
exit "$exit_code"
