# PetPark F9 — Launch Blockers / Broken-Flow / Bug-Surface Pass

**Date:** 2026-04-03
**Scope:** Catch and fix high-value flow bugs and broken surface area before soft launch. Focus on critical user journeys, forms, error handling, routing, auth gates, and runtime footguns.

---

## What was done

### Comprehensive scan

Grep/read-driven pass across the entire repo covering:

- **All internal links & navigation** — 80+ pages, 50+ components, 60+ dynamic routes, 30+ `router.push()` calls, 15+ `redirect()` calls. No broken links found.
- **SEO/config surface** — `next.config.ts` (redirects, CSP, headers), `sitemap.ts`, `robots.ts`, metadata on key pages, `not-found.tsx`, `error.tsx`, `layout.tsx`. All clean.
- **Auth flows** — login, register, forgot-password, onboarding. Proper try/catch, loading states, redirect handling. No loops detected.
- **Form submissions** — all 3 booking dialogs, contact form, provider onboarding, profile forms.
- **Empty states** — messages, dashboard pages, search results. All have fallback UI.
- **Runtime footguns** — no `window`/`document` in server components, no missing `'use client'` directives.

### Bugs fixed (4 files, 4 issues)

#### 1. Sitter booking dialog — crash on network error
**File:** `app/sitter/[id]/booking-dialog.tsx`
**Issue:** `onSubmit` handler called `await fetch(...)` without try/catch. A network error would cause an unhandled rejection, leaving the form in a broken loading state with no feedback.
**Fix:** Wrapped in try/catch/finally with toast error message and proper loading state reset.

#### 2. Groomer booking dialog — silent slot fetch error
**File:** `app/groomer/[id]/booking-dialog.tsx`
**Issue:** `.catch(() => setSlots([]))` silently swallowed fetch errors. Users saw "Groomer trenutno nema otvorene termine" when the real problem was a network failure.
**Fix:** Added `toast.error()` in the catch handler so users know to retry.

#### 3. Trainer booking dialog — unhandled rejection + no error feedback
**File:** `app/trener/[id]/booking-dialog.tsx`
**Issue:** `fetchSlots` had a try/finally but no catch block. Network errors caused unhandled promise rejections with no user-visible feedback.
**Fix:** Added catch block with toast error message.

#### 4. Messages fetchPartner — unhandled promise rejection
**File:** `app/poruke/messages-content.tsx`
**Issue:** `void fetchPartner()` called an async function that could throw (Supabase `.single()` query) with no error handling, causing unhandled rejection in the browser console.
**Fix:** Wrapped the Supabase query in try/catch. Failure is non-fatal (user can still use existing conversations).

### Validation

- ESLint: 0 errors on changed files (1 pre-existing warning, unrelated)
- TypeScript: 0 errors across entire project

---

## What was NOT fixed (assessed as non-blocking)

### Low-priority patterns observed but left as-is

1. **`.catch(() => ({}))` on `response.json()`** — Used in login, register, onboarding, and trainer dashboard (~15 occurrences). This is a defensive pattern for non-JSON error responses. The outer code handles `!response.ok` correctly. Not a launch blocker.

2. **Owner dashboard `sitter!` non-null assertion** — `activeSitters.filter(Boolean).map(sitter => [sitter!.id, ...])`. The `filter(Boolean)` guarantees non-null, so the assertion is safe. Not a launch blocker.

3. **Dashboard data loading without error boundaries** — Server component `getOwnerDashboardData()`, groomer/sitter dashboard pages don't have granular error handling. The global `error.tsx` boundary catches these. Acceptable for launch.

4. **Checkout page loads booking without ownership check on frontend** — The API endpoint checks ownership; the frontend just displays what the API returns. No information leak. Not a launch blocker.

5. **Messages mark-read has no error handling** — `void markRead()` fires and forgets. Failure means unread count stays optimistically cleared on the client but isn't persisted. Cosmetic, not functional. Not a launch blocker.

---

## Follow-ups / risks

1. **Stripe webhook idempotency** — Webhook handles duplicate events by checking booking status, but doesn't prevent duplicate payment log entries. Low risk (Stripe deduplicates), but worth adding idempotency key logging post-launch.

2. **Trainer dashboard error feedback** — 8 API calls in `trainer-dashboard-content.tsx` use `.catch(() => ({}))` on JSON parsing. All check `!res.ok` and show toasts. Could be more specific about network vs. server errors, but functional for launch.

3. **API error format inconsistency** — Some routes return `{ error: 'string' }`, others use `apiError()` returning `{ error: { code, message } }`. Client code handles both (checks `payload.error` which works for both). Not urgent but should be unified post-launch.
