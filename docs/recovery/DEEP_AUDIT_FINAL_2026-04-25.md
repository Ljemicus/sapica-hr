# PetPark Deep Audit Final — 2026-04-25

Branch: `recovery/petpark-worktree-checkpoint-2026-04-25`
Production: `https://petpark.hr`
Final audited HEAD: `1dc52657`
Verdict: **NO-GO for full public marketplace launch. YES for controlled Zagreb beta / waitlist / supply acquisition.**

## Executive opinion

PetPark is no longer in the catastrophic recovery state. The core production surface is up, security gates are materially better, secrets are not visibly exposed in the public bundle, RLS is enabled on public base tables, basic tests/build pass, and the worst live breakages found during this audit were fixed and redeployed.

But I would not launch this as a real public marketplace yet. It is credible as a beta/waitlist and provider-acquisition site; it is not credible as a full booking marketplace because supply, trust proof, operational monitoring, and several product/legal proofs are still thin.

The right posture is: **“Zagreb beta — onboarding verified providers now.”** Not: “Croatian pet-care marketplace is fully live.”

## What was fixed during this audit

### 1. CSRF broke normal first-party POST flows — fixed

Previously, normal first-party app POSTs returned `CSRF_INVALID` before validation/business logic:

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/forgot-password`
- `/api/waitlist`
- `/api/support`
- cron endpoints with `CRON_SECRET`

Fixes:

- Same-origin `Origin` requests are allowed through CSRF validation.
- Cron/admin cron endpoints are excluded from generic CSRF so their bearer-secret auth can work.
- Commit: `8bff9606 fix: restore first-party api posts through csrf`

Post-fix live evidence:

- `/api/auth/login` POST `{}` → `400 INVALID_INPUT`, not CSRF.
- `/api/auth/register` POST `{}` → `400 INVALID_INPUT`, not CSRF.
- `/api/waitlist` POST `{}` → `400 Invalid waitlist request`, not CSRF.
- `/api/support` POST `{}` → `400 validation`, not CSRF.

### 2. SMS endpoint could authorize accidentally if `SMS_INTERNAL_KEY` was unset — fixed

Risk: request body `internalKey` comparison could become `undefined === undefined`, turning the endpoint into an unauthenticated SMS-send primitive in a bad env state.

Fixes:

- Internal SMS calls now require `Authorization: Bearer ${SMS_INTERNAL_KEY}`.
- Missing `SMS_INTERNAL_KEY` fails closed.
- Non-system SMS sending is restricted to admins.
- Commit: `4afbf391 fix: harden sms and email cron auth`

Post-fix live evidence:

- `/api/sms/send` POST `{}` → `401 Unauthorized`.

### 3. Email cron auth could fail open if `CRON_SECRET` was missing — fixed

Fixes:

- Missing `CRON_SECRET` now returns `503 Cron auth unavailable` instead of accepting an unset comparison.
- Mismatched bearer token still returns `401`.
- Commit: `4afbf391 fix: harden sms and email cron auth`

### 4. CSP was blocking Next App Router inline bootstrap scripts — fixed

Live audit reproduced browser console errors like:

> Executing inline script violates Content Security Policy directive `script-src ...`

This was serious because it could break hydration/interactivity on App Router pages.

Fixes:

- Allowed Next inline bootstrap/data scripts pragmatically with `unsafe-inline` for `script-src`.
- Removed the script nonce from `script-src` because browsers ignore `unsafe-inline` when nonce/hash is present.
- Kept CSP otherwise restrictive.
- Commits:
  - `d7d24daa fix: allow Next app bootstrap scripts in CSP`
  - `08d44c00 fix: remove script nonce that disabled inline CSP fallback`

Post-fix live Playwright evidence:

- `/veterinari` 200 — no CSP console errors.
- `/zajednica` 200 — no CSP console errors.
- `/postani-sitter` 200 — no CSP console errors.
- `/prijava` 200 — no CSP console errors.
- `/registracija` 200 — no CSP console errors.

Note: this is pragmatic, not perfect. Long-term, wire nonce propagation properly through the full Next/React tree and remove `unsafe-inline`.

### 5. Vet APIs returned 500 because `emergency_vet_clinics` is not provisioned — fixed to graceful empty state

Before:

- `/api/vets` → 500
- `/api/emergency-vets` → 500

Fix:

- If the backing table is absent, return a graceful empty/unavailable payload instead of 500.
- Commit: `1dc52657 fix: avoid vet api 500 when clinic table is absent`

Post-fix live evidence:

- `/api/vets` → `200 {"clinics":[],"count":0,"unavailable":true}`
- `/api/emergency-vets` → `200 {"clinics":[],"count":0,"unavailable":true}`

## Current live production evidence

### Production smoke

- `/` → 200
- `/pretraga` → 200
- `/blog` → 200
- `/veterinari` → 200
- `/zajednica` → 200
- `/postani-sitter` → 200
- `/prijava` → 200
- `/registracija` → 200
- `/api/health` → 200 healthy

### Health endpoint

`/api/health` reports:

- DB: ok
- Supabase Auth admin: ok
- Stripe: ok
- Redis: ok, but using in-memory fallback because Upstash is not configured
- Environment: production
- Version: unknown

### Inventory APIs

- `/api/sitters` → `[]`
- `/api/groomers` → `[]`
- `/api/adoption-listings` → `[]`
- `/api/vets` → empty/unavailable
- `/api/emergency-vets` → empty/unavailable

This confirms the product is technically serving, but marketplace inventory is thin/empty.

## Security / backend audit

### Stronger areas now

- RLS gate previously verified: 0 public base tables with RLS disabled.
- Tracked-source gitleaks gate clean.
- Build/test/typecheck pass after recent fixes.
- CSRF no longer blocks first-party flows.
- Dangerous SMS unset-secret auth issue fixed.
- Email cron unset-secret behavior fixed.
- Stripe create calls are guarded by CI regression checks for idempotency.

### Remaining backend/security concerns

1. **Legacy sync rate limiter still exists in several routes**
   - Some routes use a rate-limit path that effectively always returns allowed.
   - This is risky on support/contact/analytics/public write endpoints.
   - Real Upstash Redis is still not configured in production.

2. **Public `/api/health` exposes privileged dependency detail**
   - It proves DB/Auth/Stripe presence publicly.
   - Fine for short recovery, not ideal for production.
   - Recommendation: split public `/api/health` minimal ok/version from private `/api/admin/health` detailed checks.

3. **GDPR delete is incomplete**
   - App profile delete/soft-delete exists.
   - Supabase Auth identity deletion/anonymization is not fully proven.
   - Need authenticated live export/delete test with disposable user.

4. **Public analytics funnel endpoint remains too permissive**
   - It writes with privileged server-side capability and accepts arbitrary public payloads.
   - Needs strict schema, rate limiting, payload size caps, and abuse monitoring.

5. **Registration email confirmation posture is questionable**
   - Audit flagged auto-confirm behavior in production.
   - For marketplace trust, email verification should be enforced before sensitive actions.

6. **RLS/functions are not fully reproducible from migrations**
   - Current DB may be safer than the repo can recreate.
   - Need migrations for all helper functions/policies actually depended on.

## Frontend / UX audit

### Positive

- Main public pages load.
- Accessibility gate previously passed: 0 serious/critical axe issues on configured routes.
- CSP App Router breakage is now fixed in live browser tests.
- Core messaging is increasingly honest about beta / no fake inventory.

### Problems

1. **Too many public routes are “Uskoro”**
   - `/veterinari` and `/zajednica` are placeholder pages.
   - This is acceptable for beta, not for a polished public launch.

2. **Marketplace supply is visibly empty/thin**
   - APIs return empty arrays for sitters/groomers/adoption listings.
   - Zagreb Tier A provider gate remains 1/5.

3. **SEO issue: `/en` hreflang points to 404**
   - `app/layout.tsx` advertises `https://petpark.hr/en`, but root `/en` does not exist.
   - Fix by removing root English hreflang or adding a real `/en` route.

4. **Metadata polish still needed**
   - Some routes previously showed duplicate title branding patterns.
   - Needs a metadata pass before serious SEO push.

5. **Mobile navigation/discoverability is thin**
   - Not a hard technical blocker, but it weakens conversion.

6. **Copy polish**
   - Prior audit caught `/postani-sitter` typo `mačkeu`.
   - Needs quick copy sweep.

## Business / launch readiness audit

### Hard blocker: supply

Current launch gate: **Zagreb Tier A providers = 1/5**.

That is not enough for a marketplace launch. A marketplace with one real provider is not a marketplace; it is a landing page with ambition. Launching paid acquisition or PR now would mostly burn trust.

### Trust/safety proof is thin

Need more visible proof before full launch:

- Verified provider badges with real criteria.
- Clear onboarding/review process.
- Cancellation/refund/support process.
- Incident handling process.
- Real provider identity/availability checks.

### Public claims must stay conservative

Do not imply national coverage or deep marketplace liquidity. The honest position is:

> Zagreb beta, onboarding verified sitters and pet-care providers now.

## DNS / email security

Current DNS state:

- DMARC: `"v=DMARC1; p=none;"`
- Missing DMARC `rua/ruf` reporting.
- CAA absent.
- DNS managed at `cdn.hr / cyber_Folks`, not Vercel DNS.

This remains a launch-gate fail.

## Operational readiness

Not launch-grade yet:

- Real Upstash Redis missing; app falls back to in-memory rate limiting.
- Webhook-health/Sentry/Slack alert delivery not proven end-to-end.
- Manual secret rotation proof incomplete.
- Public health endpoint too verbose.
- `version` in health is `unknown`.
- `sapica.vercel.app` alias still needs explicit keep/remove decision.

## Final go/no-go

### Full public marketplace launch

**NO-GO.**

Reasons:

1. Supply: 1/5 Zagreb Tier A providers.
2. Empty/thin inventory APIs.
3. DNS/DMARC gate failing.
4. Real rate limiting not configured.
5. GDPR/Auth deletion not proven live.
6. Trust/safety/ops proof too thin.
7. Several product surfaces are placeholders.

### Controlled beta / waitlist / provider acquisition

**GO.**

Conditions:

- Keep copy honest: beta, Zagreb-first, verified providers being onboarded.
- Do not run broad paid acquisition as if inventory exists.
- Use the site to collect demand and onboard real supply.
- Keep booking/payment flows limited until ops + trust + provider coverage are proven.

## Recommended next execution order

1. Onboard 4 more real verified Zagreb providers or lower the launch gate explicitly.
2. Fix DNS at cyber_Folks: DMARC reports + CAA.
3. Configure real Upstash Redis and verify rate limiting in production.
4. Run authenticated GDPR export/delete test with disposable user.
5. Prove webhook/Sentry/Slack alert delivery.
6. Remove or fix `/en` hreflang.
7. Split public/private health endpoint.
8. Harden analytics funnel and remaining weak rate-limit routes.
9. Add migrations for missing vet table or intentionally remove vet API until ready.
10. Copy/metadata/mobile-nav polish pass.

## Bottom line

My honest view: **PetPark is now safe enough to keep online as a controlled beta, but not honest or operationally strong enough for a real marketplace launch.**

The recovery work moved it from “risky/unreliable” to “usable beta foundation.” The next win is not more code polish first — it is real Zagreb supply + trust proof + ops hardening.
