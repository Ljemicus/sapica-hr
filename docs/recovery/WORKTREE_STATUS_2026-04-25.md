# PetPark Worktree Status — 2026-04-25

Snapshot time: 2026-04-25 08:45 Europe/Zagreb
Repo: `/Users/ljemicus/Projects/petpark`
Branch: `main`
Baseline HEAD: `54ad4ace9d5a1984936ac1372ffe6ca35f665920`

## Purpose

This file stabilizes the current recovery state before starting any new cycle. The worktree contains many cycle changes in one local workspace, so this is a reviewer/checkpoint pack rather than a clean one-cycle PR summary.

## Current worktree shape

Raw snapshot command:

```bash
git status --short
git diff --stat
git diff --name-status
```

Observed summary:

- `git status --short`: 153 lines
- `git diff --name-status`: 118 changed tracked paths
- `git diff --stat`: 118 files changed, 10013 insertions, 19212 deletions
- large package lock churn exists from dependency/test migration work
- untracked directories/files include:
  - `docs/recovery/**`
  - `evidence/**`
  - `scripts/build-evidence-pack.sh`
  - `scripts/run-a11y.js`
  - new static public route files
  - new Supabase migrations
  - test artifacts/results

## Verification gates run now

### 1. Whitespace/check gate

```bash
git diff --check
```

Result: **PASS**

```text
exit=0
```

### 2. TypeScript gate

Initial run before cleaning `.next` failed only because stale `.next/dev/types/validator.ts` referenced archived page files:

```text
Cannot find module '../../../app/blog/page.js'
Cannot find module '../../../app/page.js'
Cannot find module '../../../app/pretraga/en/page.js'
Cannot find module '../../../app/pretraga/page.js'
exit=2
```

After removing generated `.next`:

```bash
rm -rf .next
npm run type-check
```

Result: **PASS**

```text
> petpark@0.1.0 type-check
> tsc --noEmit

exit=0
```

Conclusion: the TypeScript failure was generated-artifact staleness, not source failure.

### 3. Unit/test harness gate

```bash
npm test
```

Result: **PASS**

```text
Test Files  15 passed (15)
Tests       170 passed (170)
exit=0
```

### 4. Build gate

```bash
npm run build
```

Result: **PASS**

```text
ƒ Proxy (Middleware)
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
exit=0
```

## Completed/advanced cycles represented in this worktree

### Evidence pack work

- Final forensic pack exists in Documents from prior round:
  - `/Users/ljemicus/Documents/petpark-evidence-pack-final-20260423T210704Z.zip`
  - `/Users/ljemicus/Documents/pack.sha256`
- Evidence artifacts remain under repo `evidence/**`.

### Cycle 1 — Secret rotation + Next upgrade + sanitizer

Status: **code-side partial complete / provider-side incomplete**

Done locally:

- Next upgraded to `^16.2.4`
- sanitizer script added at `scripts/build-evidence-pack.sh`
- `docs/recovery/SECRET_ROTATION_LOG.md` added
- build/type/test gates currently pass

Still not complete:

- provider-side secret rotations/revocations remain `PENDING` in `SECRET_ROTATION_LOG.md`:
  - Supabase JWT signing secret
  - Stripe access token
  - Resend API key
  - Upstash REST token
  - Cloudinary API secret

### Cycle 2–3 — RLS hardening + provider review count drift

Status: **live DB work completed per recovery docs**

- Cycle 2 booking/trainer RLS alignment applied live
- Cycle 3 provider `review_count` drift fixed with sync trigger/backfill
- Relevant migrations present locally:
  - `20260424112000_cycle2_trainer_booking_rls_alignment.sql`
  - `20260424114000_cycle2_remaining_trainer_rls.sql`
  - `20260424122000_fix_provider_review_count.sql`

### Cycle 4–6 — containment / unknowns / canonical model mapping

Status: **advanced locally**

- social feed gated off
- social API routes return feature-disabled behavior
- forum/social surfaces removed or hidden from public discovery paths per containment strategy
- open unknowns documented in `docs/recovery/OPEN_UNKNOWNS_LOG.md`
- canonical model mapping work present in docs and code

### Cycle 7 — Auth / role truth rewrite

Status: **code-side mostly complete / runtime evidence pending**

Done:

- canonical auth reads from Supabase auth user + `public.profiles` + `public.profile_roles`
- admin pages route through canonical guard helpers
- `/api/auth/me` exposes onboarding/profile missing state
- legacy fallback/diff logging exists

Open:

- no 24h runtime dual-read sample evidence yet
- no staging proof for missing-role onboarding redirect
- no staging proof that admin access is solely `profile_roles`

### Cycle 8 — Booking/payment canonical cutover

Status: **core GREEN / full-domain conditional**

Done:

- `lib/db/bookings.ts` moved to canonical live booking columns
- booking create/status/update/review/checkout flows moved away from legacy booking columns on key paths
- payment create/refund/webhook moved toward canonical `bookings` + `payments`
- calendar ghost booking API routes fail-closed with `503 CALENDAR_TEMPORARILY_DISABLED`
- typecheck/test/build gates pass after containment

Open:

- `lib/calendar/*` still contains frozen legacy residue
- if calendar remains a product feature, it needs a future explicit cycle

### Cycle 9 — stale migration archive + canonical RLS hardening

Status: **GREEN per recovery docs**

Done:

- stale migration archived:
  - `supabase/migrations/archive/20260423140000_rls_least_privilege_hardening.sql`
- remote history repaired for `20260423140000`
- canonical replacement/revert migrations added/applied:
  - `20260424173000_revert_stale_rls_hardening.sql`
  - `20260424174000_rls_hardening_canonical.sql`
- live policy scan reported zero `owner_id` / `sitter_id` legacy policy references

### Cycle 10 — Storage + admin boundary audit

Status: **advanced per docs**

- storage/admin boundary docs exist:
  - `docs/recovery/STORAGE_POLICY_MATRIX.md`
  - `docs/recovery/ADMIN_ROUTE_MATRIX.md`
- exact closure should be reviewed before claiming final PR acceptance

### Cycle 11–13 — Stripe/payment/webhook/idempotency

Status: **substantial work present / strict acceptance not fully proven**

Done/represented:

- canonical payment code paths changed
- `stripe_events` migration exists
- bookings monetary invariant migration exists

Open:

- formal replay/double-call/idempotency acceptance still needs safe fixture/provider verification
- no production Stripe calls should be made during evidence/fix passes

### Cycle 14–15 — kill-list + homepage/metadata truth rewrite

Status: **advanced locally**

- sitemap/nav/metadata changes present
- launch posture documented as Option C: aggressive kill-list + indexable honest homepage

### Cycle 16 — Vitest migration

Status: **GREEN locally**

- Jest config removed
- Vitest config/tests updated
- current `npm test` passes: 15 suites / 170 tests

### Cycle 17 — Accessibility fixes

Status: **previously green per artifacts/docs**

- axe artifacts exist under `evidence/_artifacts/axe/**`
- final acceptance should cite exact current artifact or rerun if needed before PR

### Cycle 18 — Lighthouse/performance/static HTML island

Status: **GREEN locally per prior artifacts; build currently passes**

- static HTML route handlers exist for `/`, `/pretraga`, `/pretraga/en`, `/blog`
- old Next page files archived under `archive/cycle18-next-pages/**`
- Sentry runtime config archived/disabled under `archive/cycle18-sentry-disabled/**`
- build currently passes after clean `.next`

### Cycle 19 — Zagreb Tier A

Status: **code-side complete / data blocker**

Done:

- `public.waitlist_requests` migration added and applied live per status doc
- `/api/waitlist` added
- `/pretraga` waitlist capture added
- E2E for Zagreb Tier A added

Blocker:

- live Zagreb listed+verified sitter count is `1 / 5`
- needs 4 more real providers with pricing + availability

### Cycle 20 — DNS security closing

Status: **code-side CSP complete / DNS blocked**

Done locally:

- CSP style inline tightening
- static CSS extracted to `public/static-public.css`
- static public HTML no longer uses inline styles

Blocked externally:

- DNS is controlled by `dns1.cdn.hr` / `dns2.cdn.hr`, not Vercel DNS
- needs manual DNS changes:
  - DMARC rua/ruf/adkim/aspf monitoring record
  - CAA records
- IPv6 requirement is outdated/blocked because Vercel does not provide a supported AAAA target

## Not started / not closed

- Cycle 21 — pre-commit gitleaks hook
- Cycle 22 — GDPR export/delete/retention endpoints
- Cycle 23 — observability/Sentry/health/webhook monitor
- Cycle 24 — CI workflow + grep regression block
- Cycle 25 — final launch gate

## Main risks before any PR/deploy

1. **Worktree is too broad for one PR.** The playbook says one cycle per PR, but current local state spans many cycles.
2. **Manual secret rotation remains pending.** This is security-critical and cannot be solved by code alone.
3. **Zagreb Tier A is blocked by real supply, not code.** Launch readiness depends on onboarding providers.
4. **DNS security is blocked by provider access.** Needs cdn.hr/cyber_Folks changes.
5. **Stripe strict acceptance is not fully fixture-proven.** Avoid real prod Stripe calls.
6. **Calendar is intentionally disabled.** Do not treat calendar as supported until a future cycle rewrites or removes it.

## Recommended next action

Before Cycle 21 or any deploy, split/stabilize the worktree into reviewable chunks:

1. Create a branch/checkpoint from current worktree.
2. Decide whether to keep this as one emergency recovery PR or split by cycle groups:
   - A: Cycle 1 + safety tooling
   - B: Cycle 2–3 DB/RLS/review-count migrations
   - C: Cycle 4–6 containment/model docs
   - D: Cycle 7 auth
   - E: Cycle 8–13 booking/payment/Stripe
   - F: Cycle 14–18 public/perf/static surface
   - G: Cycle 19–20 launch blockers/docs
3. Do not start Cycle 21 until this current state is either committed, stashed, or intentionally preserved as a recovery branch.

## Current local gate verdict

As of this snapshot:

- `git diff --check`: **PASS**
- `npm run type-check`: **PASS after cleaning stale `.next`**
- `npm test`: **PASS** — 15 suites / 170 tests
- `npm run build`: **PASS**

Technical local health is good. Process health is the problem: the worktree needs PR/chunking discipline before further cycles.
