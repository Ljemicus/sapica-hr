# PetPark production audit — 2026-04-25

## Executive summary

`https://petpark.hr` is live and operational after the recovery deploy. Core public routes, Supabase DB/Auth, Stripe, production build, test suite, gitleaks tracked-source scan, and GDPR route reachability are green.

The site is **not yet fully launch-clean by the playbook** because several non-code/business/external gates remain open: Zagreb provider supply, DNS security records, real Upstash Redis, RLS verification via direct Postgres query, Lighthouse tooling failure, and two color-contrast issues on placeholder pages.

## Deployment traceability

- Branch: `recovery/petpark-worktree-checkpoint-2026-04-25`
- Production deployment: Vercel `dpl_DjX8eQvPMVZ95tFQWbMBJNuUoJD4`
- Production status: Ready
- Aliases include:
  - `https://petpark.hr`
  - `https://www.petpark.hr`
  - `https://petpark-xfb9f884sn-7849s-projects.vercel.app`
  - `https://sapica.vercel.app` — legacy alias still present
- Latest relevant commit: `2de760f2 fix: allow health check without optional redis`

## Repo / build / test gates

| Check                     | Result                              | Notes                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run ci:regression`   | PASS                                | Legacy `users` and Stripe idempotency regression gate passed.                                                                                                                                                                                           |
| `npm run type-check`      | PASS                                | TypeScript clean.                                                                                                                                                                                                                                       |
| `npm test`                | PASS                                | 15 suites / 170 tests passed.                                                                                                                                                                                                                           |
| Public bundle secret scan | PASS                                | Server secrets not found in `.next/static` or `public`.                                                                                                                                                                                                 |
| Gitleaks tracked source   | PASS                                | Launch gate tracked-source scan found 0 findings.                                                                                                                                                                                                       |
| Full local tree gitleaks  | FAIL / expected local hygiene issue | 129 findings caused by local `.env*` and `.next/server` build artifacts. These are not tracked and not public static bundle, but local generated artifacts contain server env material and should be cleaned before sharing machine/worktree artifacts. |

## Production smoke

| Route                             | Result                       |
| --------------------------------- | ---------------------------- |
| `/`                               | 200                          |
| `/pretraga`                       | 200                          |
| `/blog`                           | 200                          |
| `/robots.txt`                     | 200                          |
| `/sitemap.xml`                    | 200                          |
| `/api/health`                     | 200                          |
| `/api/account/export` HEAD        | 405 expected method mismatch |
| `/api/account/delete` HEAD        | 405 expected method mismatch |
| `/api/cron/retention` unauth      | 403 expected                 |
| `/api/cron/webhook-health` unauth | 403 expected                 |

Mobile Playwright smoke also loaded `/`, `/pretraga`, `/blog`, `/veterinari`, `/zajednica`, `/prijava`, and `/registracija` with status 200.

## Health endpoint

`/api/health` returns healthy:

- DB: ok
- Supabase Auth admin: ok
- Stripe: ok
- Redis: ok with fallback message

Redis note: Upstash is **not configured**. Health now reports that the app is using in-memory fallback rate limiting. This is acceptable for temporary operation, but not ideal for production scale or abuse resistance.

## Database / migrations

Supabase migration list confirms local and remote are aligned through:

- `20260425071000_add_profile_deleted_at.sql`

RLS-disabled public table check remains **UNKNOWN** because local `psql` is unavailable and `DB_URL` was not available to the launch gate script. Supabase CLI connectivity works, but it does not directly run the launch-gate SQL check.

## Vercel environment

Configured in Vercel Production:

- `STRIPE_SECRET_KEY` — encrypted, Production
- `STRIPE_WEBHOOK_SECRET` — encrypted, Production
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — encrypted, Production
- `CRON_SECRET` — encrypted, Production
- `RESEND_API_KEY` — encrypted, Production
- `NEXT_PUBLIC_SUPABASE_URL` — Production + Preview
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Production + Preview
- `SUPABASE_SERVICE_ROLE_KEY` — Production + Preview

Not configured:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Important: the local `.env.local` Upstash values were placeholders (`your-...`), not real credentials. They were removed from Vercel after being briefly added by mistake.

## Security headers / CSP

Production `/` sends strong baseline headers:

- `content-security-policy` present
- `strict-transport-security: max-age=31536000; includeSubDomains`
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy` present

CSP is strict and does not use blanket `unsafe-inline`. It does include specific style hashes and `unsafe-hashes` for known inline style cases.

## DNS

Current authoritative nameservers:

- `dns1.cdn.hr`
- `dns2.cdn.hr`

Current records observed:

- Apex A: `76.76.21.21`
- `www`: `cname.vercel-dns.com.`
- DMARC: `v=DMARC1; p=none;`
- CAA: none observed
- Apex SPF exists

DNS blockers:

1. DMARC needs reporting addresses (`rua` and ideally `ruf`) and later policy hardening.
2. CAA should be added.
3. DNS changes must be made at `cdn.hr` / cyber_Folks, not Vercel DNS.

## Launch gate re-run

Latest launch gate result after production deploy:

- PASS: 6
- FAIL: 4
- UNKNOWN: 1

Pass:

- npm audit high+critical = 0
- gitleaks tracked source = 0 findings
- npm test
- Stripe create idempotency
- webhook event coverage
- GDPR endpoints reachable

Fail:

- Lighthouse mobile LCP — Lighthouse cannot reliably load pages, `net::ERR_ABORTED`.
- axe serious/critical — launch script currently fails because `scripts/run-a11y.js` injects an inline style that CSP blocks.
- Zagreb Tier A providers — still 1/5 from status doc.
- DMARC monitoring — missing `rua`/`ruf`.

Unknown:

- RLS-disabled public table count — `DB_URL`/`psql` unavailable for launch-gate SQL.

## Accessibility audit clarification

The built-in `scripts/run-a11y.js` fails under production CSP because `page.addStyleTag(...)` attempts inline style injection. That is a **tooling/CSP compatibility issue**, not necessarily a page accessibility failure.

A manual Playwright + axe run without style injection found:

| Route         | Status | Serious/Critical |
| ------------- | -----: | ---------------: |
| `/`           |    200 |                0 |
| `/pretraga`   |    200 |                0 |
| `/blog`       |    200 |                0 |
| `/veterinari` |    200 |                1 |
| `/zajednica`  |    200 |                1 |

Actual issues found:

- `/veterinari`: color contrast on orange rounded badge and small muted text.
- `/zajednica`: same color contrast issue.

## Open blockers, ranked

### P0 / launch integrity

1. Configure real Upstash Redis or another durable rate limiter.
2. Verify RLS-disabled public tables with direct Postgres access.
3. Run authenticated live GDPR export/delete test with a test user.
4. Confirm manual secret rotation is complete and documented.

### P1 / launch gate

5. Fix DNS DMARC/CAA at cyber_Folks.
6. Resolve Zagreb provider supply gate: onboard 4 more listed+verified Zagreb sitters or explicitly revise the gate.
7. Fix `scripts/run-a11y.js` to avoid CSP-blocked inline style injection, then re-run axe.
8. Fix contrast issues on `/veterinari` and `/zajednica`.
9. Investigate Lighthouse `net::ERR_ABORTED` with Chrome/Lighthouse; Playwright and curl load pages successfully.

### P2 / cleanup

10. Remove/retire legacy `sapica.vercel.app` alias if no longer needed.
11. Clean local `.next` and avoid storing generated server artifacts in evidence/share bundles.
12. Consider moving all production secrets out of local `.env.prod` into Keychain/Vercel-only workflow.

## Recommended next steps

1. Fix quick code/tooling issues:
   - remove CSP-blocking `page.addStyleTag` from `scripts/run-a11y.js` or wrap it in try/catch;
   - adjust contrast on `/veterinari` and `/zajednica`.
2. Re-run a11y and launch gate.
3. Add real Upstash Redis credentials to Vercel Production.
4. Use `psql` or another direct Postgres path to prove RLS gate.
5. Make DNS changes at cyber_Folks.
6. Decide whether Zagreb 5-provider gate is a hard launch blocker or business target after launch.
