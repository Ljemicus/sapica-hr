# Sprint 3 Slice 1 — Authenticated QA Pass

**Status: DONE**

## Files Changed

| File | Change |
|------|--------|
| `lib/auth-redirect.ts` | Added `safeRedirectPath()` to validate redirect targets against open-redirect attacks |
| `app/prijava/login-form.tsx` | Login redirect param now sanitised via `safeRedirectPath` |
| `app/registracija/register-form.tsx` | Registration redirect param now sanitised via `safeRedirectPath` |
| `app/api/auth/callback/route.ts` | OAuth callback `next` param now sanitised via `safeRedirectPath` |
| `contexts/auth-context.tsx` | `signOut()` now calls `POST /api/auth/logout` before client-side signOut, ensuring server session cookies are invalidated |
| `lib/rate-limit.ts` | Added periodic eviction of expired entries to prevent unbounded memory growth |
| `lib/types.ts` | Added optional `payment_status` to `Booking` interface (pre-existing build error fix) |

## What Changed

### 1. Open redirect vulnerability fixed (security)
The `redirect` / `next` query parameter in login, registration, and OAuth callback flows was used verbatim for `router.push()` / `NextResponse.redirect()`. An attacker could craft a URL like `/prijava?redirect=https://evil.com` to redirect users after login. All three paths now use `safeRedirectPath()` which rejects absolute URLs, protocol-relative URLs, and data/javascript URIs.

### 2. Logout now invalidates server-side session (auth correctness)
Previously, logout only called `supabase.auth.signOut()` on the client. The dedicated `POST /api/auth/logout` route (which calls server-side `signOut()` and clears server session cookies) existed but was never invoked. The `AuthProvider.signOut()` now calls the server endpoint first, then the client-side signOut, ensuring a complete session teardown.

### 3. Rate limiter memory leak fixed (stability)
The in-memory rate limit map never evicted expired entries. On long-running processes, this would grow unboundedly. Added periodic cleanup every 5 minutes.

### 4. Pre-existing build error fixed
`Booking` interface was missing the `payment_status` field used by the checkout page, causing a TypeScript build failure.

## Auth Flow Audit Summary

The following were reviewed and found correct:

- **Middleware protection**: `/dashboard`, `/poruke`, `/admin`, `/omiljeni`, `/onboarding` all require auth; unauthenticated users are redirected to `/prijava?redirect=...`
- **Role-based access**: Admin routes check `role === 'admin'` in middleware; owner/sitter dashboards verify role in their data loaders
- **Session refresh**: Middleware calls `supabase.auth.getUser()` on every request, refreshing tokens automatically
- **Login flow**: Email/password via API route with Zod validation, rate limiting, and role-based default redirect
- **OAuth flow**: Google/Apple/Facebook via Supabase, with callback that syncs user profile and creates sitter profile when needed
- **Registration flow**: Role selection, email/password with confirmation, profile sync, sitter profile creation
- **Client-side session**: `AuthProvider` hydrates from `getSession()`, subscribes to `onAuthStateChange`, properly clears state on logout

## What Remains

| Item | Reason |
|------|--------|
| Full E2E login/logout cycle with real credentials | Requires configured Supabase instance and test accounts; cannot be verified from code review alone |
| OAuth provider redirect URIs validation | Depends on Supabase dashboard configuration, not code |
| Email confirmation flow end-to-end | Requires Supabase email templates and a real email inbox |
| Rate limiter shared backend (Redis/KV) | In-memory limiter is best-effort on serverless; production deployment needs Upstash/Vercel KV |
| CSRF protection on auth API routes | Supabase handles token-based auth which mitigates CSRF, but explicit CSRF tokens on form submissions would add defense-in-depth |

## Blockers for Full Auth-Flow Closure

- **No Supabase credentials in local env** — prevents live login/logout/session-persistence testing. All fixes above are verified structurally (code review + successful build).
- **No test user accounts** — E2E browser testing of owner vs sitter redirect paths requires seeded test accounts.
