# Sprint 1 Faza 4 — Booking + Messaging Core

**Status: DONE**

## Files Changed

1. `app/api/bookings/[id]/route.ts` — sitter cancellation + rejection email
2. `app/api/bookings/route.ts` — self-booking prevention
3. `app/api/groomer-bookings/route.ts` — past-date validation
4. `app/api/groomer-bookings/[id]/route.ts` — status whitelist validation
5. `app/api/payments/refund/route.ts` — fix broken Supabase join (profiles → users)
6. `app/sitter/[id]/booking-dialog.tsx` — step-by-step field validation
7. `lib/validations.ts` — message max length (2000), booking note max length (500)
8. `lib/email-templates.ts` — new `bookingRejectedEmail` template

## What Changed

### Booking fixes
- **Sitters can now cancel bookings** — `SITTER_ALLOWED` set was missing `'cancelled'`, meaning sitters could never cancel an accepted booking. The refund system already supported `sitter_cancel` but the status update route blocked it.
- **Self-booking prevention** — added check to prevent owners from booking their own sitter profile (`SELF_BOOKING` error).
- **Rejection email notification** — when a sitter rejects a booking, the owner now receives an email with a link to search for other sitters. Previously only acceptance and cancellation triggered emails.
- **Booking dialog step validation** — the multi-step booking form now validates that pet + service are selected before advancing to step 2, and that dates are selected before advancing to step 3. Previously users could click through all steps without filling anything.
- **Booking note max length** — capped at 500 characters to prevent abuse.

### Groomer booking fixes
- **Past-date validation** — groomer bookings can no longer be created for dates in the past.
- **Status whitelist** — PATCH route now validates the status against the known set (`pending`, `confirmed`, `rejected`, `completed`, `cancelled`). Previously any string was accepted.

### Messaging fixes
- **Message content max length** — added 2000-character limit to prevent oversized messages.

### Payment/refund fix
- **Broken Supabase join in refund email** — the cancellation email query used `profiles!bookings_owner_id_fkey` and `profiles!bookings_sitter_id_fkey` which don't exist (the table is `users`). Fixed to use `users!owner_id` / `users!sitter_id` with proper type handling for the `pet` relation.

## What Remains

- **Real Supabase/Stripe integration testing** — all fixes are structurally verified via build, but end-to-end flows require a live Supabase instance and Stripe test keys.
- **Groomer booking state machine** — `updateGroomerBookingStatus` in `lib/db/groomer-bookings.ts` does a raw status update without checking current state (e.g., a completed booking could be moved back to pending). The DB layer needs transition guards similar to the sitter booking route.
- **Message receiver existence check** — `POST /api/messages` doesn't verify the `receiver_id` exists in the users table before inserting. Messages to non-existent UUIDs are silently stored.
- **Realtime typing indicators** — currently local-only (no server broadcast). The `setTyping()` method on `RealtimeManager` doesn't use Supabase broadcast, so typing indicators only work within the same browser tab.
- **Push notification delivery** — the push subscription endpoint stores subscriptions but there's no server-side code that actually sends push notifications when a new message arrives (only email notifications are sent).

## Blockers

None — all changes compile and are locally verifiable.
