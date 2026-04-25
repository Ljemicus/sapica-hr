# PetPark remaining blockers — 2026-04-25

## Current production state

`https://petpark.hr` is live and operational.

Latest verified launch gate state:

- PASS: 9
- FAIL: 2
- UNKNOWN: 0

Production smoke passed for:

- `/`
- `/pretraga`
- `/blog`
- `/veterinari`
- `/zajednica`
- `/api/health`

## Remaining hard blockers

### 1. Zagreb Tier A provider supply

**Status:** FAIL

Current gate result:

- `Zagreb Tier A providers | FAIL | 1/5`

Meaning:

- We currently have only 1 listed + verified Zagreb sitter/provider matching the launch gate requirement.
- The gate expects 5.

Why this is not solved in code:

- This is real business/data inventory.
- We should not fake providers or seed fake public supply.

What needs to happen:

- Onboard 4 more real Zagreb providers and mark them listed + verified after actual verification; or
- explicitly revise the launch gate if 5 providers is no longer a hard requirement.

### 2. DMARC / DNS security

**Status:** FAIL

Current observed DMARC:

```txt
v=DMARC1; p=none;
```

Gate issue:

- Missing `rua` and `ruf` reporting addresses.
- CAA record is also still absent.

Why this is not solved in code:

- Authoritative DNS is at `cdn.hr` / cyber_Folks:
  - `dns1.cdn.hr`
  - `dns2.cdn.hr`
- Vercel DNS does not control the records.

What needs to happen:

- Log into cyber_Folks / cdn.hr DNS panel.
- Add/adjust DMARC with reporting.
- Add CAA record(s).

Suggested DMARC direction, to be adapted to real mailbox/reporting preference:

```txt
_dmarc.petpark.hr TXT "v=DMARC1; p=none; rua=mailto:dmarc@petpark.hr; ruf=mailto:dmarc@petpark.hr; fo=1"
```

Suggested CAA direction:

```txt
petpark.hr CAA 0 issue "letsencrypt.org"
petpark.hr CAA 0 issue "pki.goog"
petpark.hr CAA 0 issuewild "letsencrypt.org"
petpark.hr CAA 0 issuewild "pki.goog"
```

Confirm exact CA needs before applying.

## Important non-blocking production gaps

### 3. Upstash Redis not configured

**Status:** Not launch-gate failing right now, but still operationally important.

Current health behavior:

- `/api/health` is healthy.
- Redis check reports app is using in-memory fallback rate limiting.

Why it matters:

- In-memory rate limiting is weaker across serverless instances.
- Abuse protection is less durable than Redis-backed rate limiting.

What needs to happen:

- Create real Upstash Redis instance.
- Add to Vercel Production env:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Redeploy and verify `/api/health` uses Redis without fallback message.

### 4. GDPR authenticated live verification

**Status:** Endpoint reachability passes, full user flow not yet proven.

Current launch gate:

- GDPR endpoints reachable: PASS
- HEAD returns 405, expected method mismatch.
- Unauthenticated POST protection previously returned 403.

What remains:

- Test authenticated export with a real test user.
- Test authenticated delete/deactivation flow with a disposable test user.
- Verify `profiles.deleted_at` behavior and retention cron effects safely.

### 5. Sentry / webhook cron end-to-end proof

**Status:** Code exists, cron protected, but controlled acceptance not fully proven.

What remains:

- Create controlled stuck/unprocessed `stripe_events` test condition or equivalent safe fixture.
- Trigger `/api/cron/webhook-health` with `CRON_SECRET`.
- Verify expected Sentry warning/ops notification behavior.

### 6. Manual secret rotation proof

**Status:** Not proven complete.

What remains:

- Confirm whether all previously exposed/old secrets were rotated.
- Document final rotation status.
- Keep secrets in Vercel/Keychain, avoid local plaintext where possible.

### 7. Legacy alias cleanup

**Status:** Non-critical cleanup.

Observed Vercel aliases still include:

- `https://sapica.vercel.app`

What remains:

- Decide if legacy alias should remain for backwards compatibility.
- If not needed, remove it from Vercel aliases.

## Already resolved today

- Production deploy to `petpark.hr` completed.
- RLS gate resolved: 0 public tables without RLS.
- Axe serious/critical issues resolved: 0 serious/critical on configured routes.
- CSP-blocked axe script issue resolved.
- Lighthouse gate no longer blocks due to local Lighthouse runtime; Playwright fallback smoke added.
- GDPR endpoints deployed and reachable.
- `/api/health` healthy.
- Typecheck, tests, regression checks, gitleaks tracked source pass.

## Recommended next order

1. DNS DMARC/CAA at cyber_Folks.
2. Decide Zagreb gate: onboard 4 providers or revise requirement.
3. Configure real Upstash Redis.
4. Run authenticated GDPR live tests with disposable user.
5. Prove webhook-health/Sentry behavior.
6. Confirm manual secret rotation status.
7. Decide/remove `sapica.vercel.app` alias.
