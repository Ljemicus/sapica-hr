# Sprint 3 Slice 5 — Payments + Notifications

**Status: DONE**

## Files Changed

| File | Change |
|------|--------|
| `components/shared/payment-button.tsx` | Fix: `router.push` → `window.location.href` for external Stripe redirect; removed unused `useRouter` import |
| `app/checkout/[bookingId]/page.tsx` | Add already-paid guard — shows "already paid" card instead of payment form when `payment_status === 'paid'` |
| `lib/email-templates.ts` | Add two new templates: `paymentConfirmationEmail` (owner) and `sitterPaymentNotificationEmail` (sitter) |
| `app/api/payments/webhook/route.ts` | Wire payment confirmation emails — sends to both owner and sitter after `checkout.session.completed` (best-effort, non-blocking) |
| `app/api/bookings/route.ts` | Wire `newBookingRequestEmail` to sitter when a booking is created |
| `app/api/bookings/[id]/route.ts` | Wire `bookingAcceptedEmail` to owner on accept; `bookingCancelledEmail` to other party on cancel |
| `app/api/payments/refund/route.ts` | Add refund reason validation; cancel booking even when refund percentage is 0% (< 24h owner cancel) |

## What Changed

### Payment Flow Fixes
1. **Stripe redirect bug** — `PaymentButton` used Next.js `router.push()` which fails for external Stripe checkout URLs. Changed to `window.location.href`.
2. **Already-paid guard** — Checkout page now detects `payment_status === 'paid'` and shows an informational card instead of allowing a duplicate payment attempt.
3. **Refund edge case** — When an owner cancels < 24h before start (0% refund), the booking is now still marked as `cancelled`. Previously it returned a denial but left the booking status unchanged.
4. **Refund reason validation** — Added server-side validation of the `reason` field against the allowed enum.

### Notification Wiring
5. **Payment confirmation emails** — After Stripe webhook confirms payment, the owner receives a payment confirmation email and the sitter receives a payout notification email. Both are best-effort (non-blocking).
6. **Booking request email** — When a booking is created, the sitter now receives an email notification with booking details.
7. **Booking status emails** — When a sitter accepts a booking, the owner is emailed. When either party cancels, the other party is emailed.

## What Remains

### Requires Live Credentials / External Services
- **Stripe keys** — Full end-to-end payment testing requires `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` to be real test-mode keys
- **Resend API key** — Email sending requires a valid `RESEND_API_KEY`; in dev mode emails are logged to console
- **Webhook endpoint** — Stripe webhook must be registered to point at `/api/payments/webhook` (use `stripe listen --forward-to` for local testing)
- **VAPID keys** — Push notifications require `NEXT_PUBLIC_VAPID_PUBLIC_KEY` for real browser push subscriptions

### Not Yet Implemented (Out of Scope)
- Notification preferences persistence — settings UI exists but backend save is not wired
- Push notification sending from server (only subscription storage exists)
- SMS notification channel (UI shows "coming soon")
- Newsletter subscription backend
- Webhook handler for `charge.refunded` event (would confirm refund completed on Stripe side)
- Email for booking rejection (only accept and cancel are wired)
- Dispute handling beyond logging

## Blockers for Full Payments/Notifications Closure
1. **Live Stripe test keys** needed to validate the full checkout → webhook → email flow end-to-end
2. **Resend API key** needed to verify email delivery
3. **Notification preferences API** — the settings page toggles don't persist; needs a new API route + DB table
4. **Webhook `charge.refunded` handler** — would close the refund confirmation loop
