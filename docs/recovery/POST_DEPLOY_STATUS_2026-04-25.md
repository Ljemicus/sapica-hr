# PetPark post-deploy status — 2026-04-25

## Current state

PetPark is deployed to production at `https://petpark.hr` from branch `recovery/petpark-worktree-checkpoint-2026-04-25`.

Latest relevant commits:

- `2de760f2 fix: allow health check without optional redis`
- `2bc230f9 fix: make webhook health cron deployable on hobby`
- `42be5314 chore: add launch gate report script`
- `166e52e1 ci: block legacy and stripe regression patterns`
- `b5a874c6 feat: add observability health and webhook monitor`
- `4e3ab719 feat: add GDPR export delete retention endpoints`

## Done

- Stabilized broad dirty worktree onto recovery branch.
- Added gitleaks pre-commit protection before lint-staged.
- Added GDPR export/delete endpoints and retention cron.
- Added `/api/health` with DB/Auth/Stripe/Redis-status checks.
- Added Stripe webhook health cron.
- Added CI regression gates for legacy `users` usage and Stripe idempotency regressions.
- Added launch gate report script.
- Pushed recovery branch to GitHub.
- Deployed production to `petpark.hr`.
- Applied Supabase migration `20260425071000_add_profile_deleted_at.sql`.
- Verified server secrets are not present in the public static bundle before deploy.
- Removed mistakenly-added placeholder Upstash envs from Vercel Production.
- Adjusted health check so missing Upstash is reported as in-memory fallback instead of failing production health.

## Post-deploy smoke result

Production probes after deploy:

- `/` — 200
- `/pretraga` — 200
- `/blog` — 200
- `/api/health` — 200 healthy
- DB — ok
- Supabase Auth admin — ok
- Stripe — ok
- Redis — ok with message: Upstash not configured; app is using in-memory fallback rate limiting.
- `/api/cron/webhook-health` unauthenticated — 403 expected
- GDPR endpoints with HEAD — 405 expected for method mismatch

## Not fully done / still open

- Formal launch gate is not yet fully green.
- Zagreb Tier A provider supply remains blocked: only 1/5 listed+verified Zagreb sitters.
- DNS security changes remain external/manual at `cdn.hr` / cyber_Folks:
  - DMARC still needs stronger configuration with reporting (`rua`/`ruf`).
  - CAA should be added.
- Upstash Redis is not really configured; local values were placeholders.
- GDPR export/delete still need authenticated live verification with a real test user.
- Accessibility and Lighthouse need final live re-run after production deploy.
- Sentry/webhook cron acceptance still needs controlled end-to-end proof.
- Manual secret rotation is not proven complete.

## Next audit focus

Run a detailed production audit covering:

1. Repo/worktree cleanliness and commit/deploy traceability.
2. Vercel env exposure and public bundle secret scan.
3. Production smoke routes and health endpoints.
4. DNS/security headers/CSP.
5. GDPR endpoint behavior with safe unauth/auth checks.
6. Cron endpoint protection.
7. Lighthouse and axe/accessibility.
8. Launch gate re-run and updated blocker list.
