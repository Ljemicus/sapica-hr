# Auth Cutover Diff Log

Cycle: 7 — Auth / role truth rewrite
Started: 2026-04-24

## Status

- Canonical auth read path implemented in `lib/auth.ts`
- Canonical client auth context implemented in `contexts/auth-context.tsx`
- Middleware admin decision removed; server helpers now own admin truth
- Login role lookup moved to `public.profile_roles`
- Auth profile sync moved to canonical `profiles` + `profile_roles` in `lib/auth-profile.ts`
- Admin SSR pages now redirect users with missing canonical role/profile state to `/onboarding/profile`
- `/api/auth/me` now exposes `needsOnboarding` based on canonical auth resolution

## 24h dual-read diff

- `AUTH_LEGACY_FALLBACK=true` added to `.env.example`
- Dual-read comparison logging added in `lib/auth.ts`
- Current implementation logs structured auth cutover comparisons through `appLogger.info('auth.cutover', ...)`
- 24h production/staging runtime evidence is still pending and must be collected before strict playbook acceptance is claimed complete

## Known gaps

- No captured runtime diff samples yet from real sessions
- No end-to-end staging evidence yet proving missing `profile_roles` user is redirected to `/onboarding/profile`
- No end-to-end staging evidence yet proving admin access is granted solely from `profile_roles`
- Several non-auth codepaths still read/write legacy `users` table outside the Cycle 7 auth cutover scope

## Current evidence

- `npx tsc --noEmit` passes after canonical auth rewrite and verification pass
- Auth-path grep leaves exactly one `.from('users')` hit in `lib/auth.ts`, intentionally for legacy fallback dual-read during cutover
- `user_metadata.role` / `user_metadata.isAdmin` role decisions removed from app/lib auth paths inspected in this cycle
- Remaining `user_metadata` usage is display fallback only in canonical auth assembly
- Admin SSR routes now gate on `user.isAdmin` and redirect `user.profileMissing` to `/onboarding/profile`
- `/api/auth/login` routes users with no canonical role rows to `/onboarding/profile`
- `/api/auth/me` exposes `needsOnboarding` for client/runtime verification

## Cycle 8 booking/payment cutover status

- `lib/db/bookings.ts` moved to canonical live booking columns and canonical joins (`profiles`, `providers`, `pets`)
- booking create flow moved to canonical payload in `app/api/bookings/route.ts`
- payment critical path moved to canonical `bookings` + `payments` shape in:
  - `app/api/payments/create-checkout/route.ts`
  - `app/api/payments/refund/route.ts`
  - `app/api/payments/webhook/route.ts`
- follow-up legacy caller cleanup completed for:
  - `app/api/bookings/instant/route.ts`
  - `app/api/bookings/[id]/route.ts`
  - `app/api/reviews/route.ts`
  - `app/checkout/[bookingId]/page.tsx`
- `npx tsc --noEmit` passed after the Cycle 8 booking/payment slice refactor

## Cycle 8 blocker discovered during cutover

- strict Cycle 8 acceptance is blocked by a parallel calendar subsystem that still treats `public.bookings` as a different ghost schema
- calendar code reads/writes non-live columns such as `provider_type`, `client_name`, `start_time`, `end_time`, `price`, `location_type`, `internal_notes`, `client_notes`, and `created_by`
- this is a schema conflict, not a harmless naming mismatch
- canonical conflict log created at `docs/recovery/CYCLE8_CALENDAR_SCHEMA_CONFLICT.md`

## Cycle 8 current acceptance state

- main marketplace booking/payment cutover: substantially complete in code
- strict acceptance: blocked pending decision/remediation for calendar ghost subsystem

- calendar ghost booking API routes have now been fail-closed with `503 CALENDAR_TEMPORARILY_DISABLED`, reducing the Cycle 8 blocker from active runtime risk to contained legacy residue
- strict Cycle 8 acceptance still requires an explicit product/recovery decision on whether calendar becomes a dedicated future cycle or remains frozen legacy

## Cycle 8 acceptance verdict

- Cycle 8 core marketplace booking/payment acceptance: GREEN
- Evidence basis:
  - canonical booking root rewritten in `lib/db/bookings.ts`
  - booking create/payment/refund/webhook critical path moved to live canonical `bookings` + `payments` columns
  - legacy high-risk callers updated (`instant`, booking status route, reviews route, checkout page)
  - calendar ghost booking API routes fail-closed with `503 CALENDAR_TEMPORARILY_DISABLED`
  - `npx tsc --noEmit` passes after containment
- Remaining condition:
  - full-domain closure is not claimed because `lib/calendar/*` remains frozen legacy residue and requires a future explicit recovery/cutover decision if calendar is to remain a supported feature
- Operational conclusion:
  - Cycle 8 is acceptable to advance past as long as calendar remains treated as frozen/disabled recovery surface
