# Sprint 1 Faza 5 — Payments + Notifications Core

**Status: DONE**

## Files Changed

1. `app/api/payments/create-checkout/route.ts`
2. `app/api/payments/webhook/route.ts`
3. `app/api/payments/refund/route.ts`
4. `app/checkout/[bookingId]/page.tsx`

## What Changed

### 1. Checkout: Booking status gate (create-checkout + checkout page)
- **Before:** Any booking could enter checkout regardless of status (pending, cancelled, rejected).
- **After:** Only `accepted` bookings can proceed to payment. Both the API route and UI now enforce this.

### 2. Checkout: Duplicate session prevention (create-checkout)
- **Before:** If `payment_status` was `pending` with an existing Stripe session, a new session could still be created, leading to orphaned sessions.
- **After:** Returns error if a pending session already exists.

### 3. Webhook: Idempotency guard (webhook)
- **Before:** Duplicate `checkout.session.completed` webhooks (which Stripe may retry) would insert duplicate payment records and send duplicate emails.
- **After:** Checks `payment_status === 'paid'` before processing; skips with log if already processed.

### 4. Webhook: Localized service names in emails (webhook)
- **Before:** Raw `service_type` slug (e.g., `boarding`) was used in payment confirmation emails.
- **After:** Uses `SERVICE_LABELS` mapping for Croatian display names (e.g., `Smještaj`).

### 5. Refund: Actor-reason validation (refund) — SECURITY FIX
- **Before:** An owner could send `reason: 'sitter_cancel'` to get 100% refund regardless of timing. No validation that the reason matched who was making the request.
- **After:** `sitter_cancel` requires the requester to be the sitter; `owner_cancel` requires the requester to be the owner. Admins bypass this check.

### 6. Refund: Cancellation email notification (refund)
- **Before:** Refund processed silently — the other party (sitter or owner) received no email notification about cancellation/refund.
- **After:** Sends `bookingCancelledEmail` to the other party after a successful refund.

## What Remains

- **Stripe webhook endpoint registration:** Requires real Stripe dashboard configuration to register the webhook URL and select events. Cannot be verified locally.
- **Resend email delivery:** Requires valid `RESEND_API_KEY` and domain verification. In dev mode, emails are logged but not sent.
- **Push notifications:** Infrastructure exists (`push_subscriptions` table, service worker, VAPID setup) but no server-side push sending is implemented — only subscription storage. Would need `web-push` library integration.
- **Stripe Connect end-to-end test:** Account creation, onboarding flow, and payout require real Stripe test mode credentials.
- **Payment failure retry UX:** When `payment_status` is `failed`, there's no explicit UI to retry payment (user must navigate back to checkout manually).

## Blockers

None — all changes are self-contained and the build passes cleanly.
