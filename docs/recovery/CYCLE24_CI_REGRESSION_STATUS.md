# Cycle 24 — CI regression block status

Date: 2026-04-25
Branch: `recovery/petpark-worktree-checkpoint-2026-04-25`

## Implemented locally

Added:

- `scripts/check-regressions.mjs`
- `docs/recovery/ci-regression-baseline.json`
- `npm run ci:regression`
- CI workflow steps in:
  - `.github/workflows/ci.yml`
  - `.github/workflows/ci-cd.yml`

## What CI blocks

### 1. New legacy `public.users` reads

The script scans `app`, `lib`, `tests`, and `scripts` for:

```regex
\.from\(\s*['"]users['"]\s*\)
```

Existing known hits are captured in `docs/recovery/ci-regression-baseline.json` because the repo still contains legacy residues that cannot be removed safely inside Cycle 24. CI fails only on new hits beyond the baseline.

Failure title:

```text
block regression strings: new .from('users') references
```

### 2. New Stripe checkout create calls without idempotency

The script scans for:

```regex
stripe.checkout.sessions.create(
```

For each hit it checks the local call block for `idempotencyKey:`. CI fails if a new missing-idempotency checkout call appears.

Failure title:

```text
block regression strings: new stripe.checkout.sessions.create without idempotencyKey
```

## Acceptance evidence

### Normal repo path

```bash
npm run ci:regression
```

Expected/current result:

```text
CI regression check passed.
legacyUserReads baseline/current: 23/23
checkoutMissingIdempotency baseline/current: 0/0
```

### Added `.from('users')` test

Temporary local test file (removed before commit):

```ts
// app/api/cycle24-regression-test.ts
supabase.from("users").select("id");
```

Expected failure:

```text
CI regression check failed.
block regression strings: new .from('users') references
```

### Added checkout create without idempotency test

Temporary local test file (removed before commit):

```ts
// app/api/cycle24-stripe-regression-test.ts
await stripe.checkout.sessions.create({ mode: "payment" });
```

Expected failure:

```text
CI regression check failed.
block regression strings: new stripe.checkout.sessions.create without idempotencyKey
```

## Status

Cycle 24 code-side implementation: **GREEN locally once gates pass**

Full acceptance: **CI enforcement live after branch/PR runs GitHub Actions**
