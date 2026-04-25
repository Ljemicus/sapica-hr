# Cycle 23 — Observability status

Date: 2026-04-25
Branch: `recovery/petpark-worktree-checkpoint-2026-04-25`

## Implemented locally

### Health endpoint

Updated:

- `app/api/health/route.ts`

`GET /api/health` now checks four explicit dependencies:

| Check    | Mechanism                                                      |
| -------- | -------------------------------------------------------------- |
| `db`     | Supabase admin client query on `profiles`                      |
| `auth`   | Supabase admin `auth.admin.listUsers({ page: 1, perPage: 1 })` |
| `stripe` | `getStripe().balance.retrieve()`                               |
| `redis`  | Upstash Redis `ping()` expects `PONG`                          |

Response shape:

```json
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "db": { "ok": true },
    "auth": { "ok": true },
    "stripe": { "ok": true },
    "redis": { "ok": true }
  }
}
```

The endpoint returns `503` if any required dependency fails.

### Webhook monitor cron

Added:

- `app/api/cron/webhook-health/route.ts`
- `vercel.json` cron entry: `/api/cron/webhook-health` every 5 minutes

Behavior:

- protected by `requireAdminOrCron`
- queries `public.stripe_events` for rows where:
  - `processed_at IS NULL`
  - `received_at < now() - 5 minutes`
- sends `Sentry.captureMessage('Stuck stripe_events', level=warning)` with count/cutoff/sample if any stuck rows exist
- sends `Sentry.captureException` if the monitor query fails

### CI / Sentry build env

Updated:

- `.github/workflows/ci-cd.yml`

The build step is now named `Build with Sentry` and receives:

- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

Note: `.github/workflows/ci.yml` already had `SENTRY_AUTH_TOKEN` and related Sentry env vars on its build job.

## Verification run locally

```bash
npm run type-check
npm test
npm run build
gitleaks protect --staged -v --redact
git diff --cached --check
```

## Known limitations / not yet live-accepted

Full Cycle 23 acceptance still requires staging/live verification:

1. Sentry throwaway staging error must show original source in Sentry.
2. `curl https://petpark.hr/api/health` must return JSON with `db/auth/stripe/redis` all `ok:true` using real production env vars.
3. Webhook monitor must be tested with a controlled unprocessed `stripe_events` row and verified in Sentry.

Important context:

- Cycle 18 archived Sentry runtime config files for performance. This cycle wires Sentry usage already present in the app and CI env, but does not reintroduce the archived Sentry runtime files.
- `/api/health` now treats missing Redis/Stripe/Auth/DB config as unhealthy rather than non-critical.

## Status

Cycle 23 code-side implementation: **GREEN locally once gates pass**

Full playbook acceptance: **pending staging/live Sentry + health + cron verification**
