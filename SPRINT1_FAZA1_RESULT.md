# Sprint 1 Faza 1 — Auth Foundation Audit & Fixes

**Status: DONE**

## Files Changed

| File | Change |
|------|--------|
| `lib/auth-redirect.ts` | Block backslash-prefixed paths in `safeRedirectPath` to prevent open redirect |
| `lib/supabase/middleware.ts` | Preserve query params when redirecting unauthenticated users to login |
| `app/api/auth/register/route.ts` | Validate `avatar_url` as a proper http(s) URL instead of passing raw body field |
| `app/prijava/login-form.tsx` | Add catch block for network errors with user-facing toast |
| `app/registracija/register-form.tsx` | Add catch block for network errors with user-facing toast |

## What Changed

### 1. Open redirect fix (security) — `lib/auth-redirect.ts`
`safeRedirectPath` blocked `//evil.com` but not `\evil.com`. Some browsers normalise backslash to forward slash, making `\evil.com` equivalent to `//evil.com` (protocol-relative open redirect). Added `trimmed.startsWith('\\')` check.

### 2. Query param preservation (UX) — `lib/supabase/middleware.ts`
When unauthenticated users hit protected routes, the middleware saved only `pathname` in the `?redirect=` param. Query parameters (e.g. `?tab=settings`) were lost. Now preserves full `pathname + search`.

### 3. avatar_url input sanitisation (security) — `app/api/auth/register/route.ts`
`body?.avatar_url` was used raw, bypassing Zod validation. A malicious client could submit `javascript:` or `data:` URIs. Now validated as a proper `http:` or `https:` URL via `new URL()` parsing; invalid values fall back to `null`.

### 4. Network error handling (resilience) — login & register forms
Both forms used `try/finally` without a `catch`. If `fetch` threw (network down, DNS failure), the error was swallowed silently — the user saw the button stop spinning with no feedback. Added `catch` blocks that show a Croatian-language network error toast.

## Audit Summary — What Already Works Well

- **Registration**: Zod validation, rate limiting, role-based profile sync, sitter profile creation
- **Login**: Zod validation, rate limiting, role resolution from DB with metadata fallback, correct default redirects per role
- **Logout**: Server-side cookie clear + client signOut, callers redirect to `/`
- **OAuth**: Safe callback with `exchangeCodeForSession`, profile sync, sitter profile creation, role forwarding
- **Redirects**: `safeRedirectPath` blocks protocol-relative, absolute, data/js URIs, newlines (now also backslash)
- **Session persistence**: Middleware refreshes tokens via `getUser()`, cookies synced correctly between request/response
- **Admin protection**: Middleware checks `users.role` in DB before allowing `/admin` access
- **Auth context**: Listens to `onAuthStateChange`, fetches profile from DB, falls back to auth metadata

## What Remains

| Item | Reason |
|------|--------|
| **Password reset flow** | No reset-password page, API route, or "forgot password" link exists. Needs Supabase `resetPasswordForEmail` integration. |
| **Email confirmation UX** | Registration returns `needsEmailConfirmation` flag and redirects to login with a toast, but there is no dedicated confirmation-pending page or resend-email button. |
| **Rate limiter is in-memory** | Works on single-process dev, best-effort on serverless. Should be replaced with Upstash Redis / Vercel KV for production. Already documented in code. |
| **Real OAuth testing** | Apple/Google/Facebook OAuth requires real Supabase project credentials and configured OAuth providers. Cannot be verified locally without those. |
| **CSRF on auth API routes** | Auth endpoints accept POST with JSON body. No explicit CSRF token. Supabase session cookies use `SameSite` but an additional check could harden this. |

## Blockers

None — all changes are self-contained and the build passes.
