# Cycle 22 — GDPR endpoints status

Date: 2026-04-25
Branch: `recovery/petpark-worktree-checkpoint-2026-04-25`

## Implemented locally

### Account export

Added:

- `app/api/account/export/route.ts`
- `lib/gdpr.ts`
- dependency: `jszip`

Behavior:

- `POST /api/account/export`
- requires authenticated session
- requires password confirmation in the request body
- rate limit: 1 request/hour via `checkRateLimit`
- returns `application/zip`
- ZIP contains:
  - `manifest.json`
  - `profile.json`
  - `profile_roles.json`
  - `pets.json`
  - `bookings_as_owner.json`
  - `reviews_authored.json`
  - `messages_sent.json`

### Account delete

Added:

- `app/api/account/delete/route.ts`
- migration `supabase/migrations/20260425071000_add_profile_deleted_at.sql`

Behavior:

- `POST /api/account/delete`
- requires authenticated session
- requires password confirmation in the request body
- rate limit: 1 request/day via `checkRateLimit`
- marks profile:
  - `status='deleted'`
  - `deleted_at=now()`
- states 30-day grace period in response

### Retention cron

Added:

- `app/api/cron/retention/route.ts`
- `vercel.json` cron entry: `/api/cron/retention` daily at `0 2 * * *`

Behavior:

- protected by `requireAdminOrCron`
- deletes messages older than 24 months
- clears old booking notes older than 7 years while preserving financial booking rows
- deletes abandoned registrations older than 30 days
- attempts hard-delete of profiles past the 30-day grace period

### Processor documentation

Added:

- `docs/privacy/processors.md`

Includes 8 processors:

- Supabase
- Vercel
- Stripe
- Upstash Redis
- Resend
- Cloudinary
- Sentry
- OpenAI / AI tooling

## Verification run locally

```bash
npm run type-check
npm test
npm run build
gitleaks protect --staged -v --redact
git diff --cached --check
```

Results:

- `npm run type-check`: PASS
- `npm test`: PASS — 15 files / 170 tests
- `npm run build`: PASS — routes include `/api/account/export`, `/api/account/delete`, `/api/cron/retention`
- `gitleaks protect --staged -v --redact`: PASS — no leaks found
- `git diff --cached --check`: PASS

## Known limitations / not yet live-accepted

Cycle 22 acceptance cannot be fully proven locally because it requires staging/live authenticated calls and DB state checks:

1. `curl -X POST https://petpark.hr/api/account/export` with fresh auth → ZIP response
2. second export call within 1h → 429
3. staging delete test → `profiles.deleted_at` is non-null
4. cron invocation decreases old `deleted_at` profile count over time

Also note:

- The current live schema did not contain `profiles.deleted_at`, so this cycle adds it via migration.
- `profiles` has multiple `ON DELETE RESTRICT` dependencies from bookings/reviews/messages in current schema. The cron attempts hard delete, but real production deletion may require additional anonymization policy for profiles with financial/community history. Booking financial rows are intentionally preserved.
- Password confirmation currently supports password-based accounts. OAuth-only users may need a separate fresh-auth UX path later.

## Status

Cycle 22 code-side implementation: **GREEN locally**

Full playbook acceptance: **pending staging/live verification and migration apply**
