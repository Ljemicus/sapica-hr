# Sprint 3 — Slice 3: Messaging + Booking Flow

**Status: DONE**

## Files Changed

| File | Change |
|------|--------|
| `app/dashboard/sitter/components/sitter-bookings-tab.tsx` | Fix broken messages link |
| `app/poruke/messages-realtime.ts` | Fix realtime messages dropped for empty conversations |
| `app/poruke/messages-content.tsx` | Fix null content render + remove fake online status |
| `app/api/bookings/[id]/route.ts` | Add cancellation state-machine guard |

## What Changed

### 1. Fix broken sitter "Messages" link
The sitter dashboard "Poruke" button on upcoming bookings linked to `/dashboard/messages?booking=...` — a route that does not exist. Fixed to `/poruke?to=${booking.owner?.id}`, which correctly opens the messaging page with the owner pre-selected.

### 2. Fix realtime messages silently dropped for empty conversations
When a user opened a new conversation via `?to=` param (0 messages loaded) and the partner sent a message, the realtime handler skipped appending because it only appended when `existing.messages.length` was truthy. Now always appends incoming messages regardless of current message count. Also populated the sender object with available partner name/avatar from conversation state instead of empty strings.

### 3. Fix null message content rendering
`Message.content` is typed as `string | null` (DB allows null for image-only messages). The chat bubble rendered `null` directly inside `<p>`, producing an empty bubble with no visual content. Now falls back to non-breaking space for text-less messages, or empty string if an image_url is present.

### 4. Remove fake online status indicators
The conversation list and chat header showed green/gray online dots based on `partnerId.charCodeAt(0) % 2 === 0` — a deterministic hash with no relation to actual presence. This gave misleading impressions (half of all users always showed "Online"). Removed the fake dots and the fake "Online" / "Zadnji put vidjen danas" text. Typing indicator remains (it works via realtime).

### 5. Add booking cancellation state-machine guard
The PATCH `/api/bookings/[id]` endpoint allowed cancelling bookings in any state, including `completed`, `rejected`, and already `cancelled`. Added a guard: completed, rejected, and already-cancelled bookings now return 400 with an appropriate message.

## What Remains

- **Real presence tracking**: Online status was removed because it was fake. Implementing real presence requires Supabase Presence channels or a heartbeat mechanism — not a code-only fix.
- **Typing indicator broadcast**: Typing state is local-only (no server broadcast). Both users won't see each other typing without implementing `RealtimeChannel.track()` on the typing channel.
- **Image message support in UI**: `image_url` field exists in the schema but no upload UI is wired into the message input.
- **Booking-to-message linking**: Messages support `booking_id` foreign key, but no UI surfaces this context (e.g., "This message is about booking #X").
- **Payment ↔ booking status sync**: Bookings can be accepted before payment clears; no webhook or polling syncs Stripe payment status back to booking state.
- **Sitter availability conflict detection**: Unlike groomer bookings (which check for slot conflicts), sitter bookings have no overlap/availability checking.

## Blockers for Full Closure

- Presence tracking and typing broadcast require Supabase Realtime configuration and testing with real auth — cannot be verified locally without credentials.
- Payment sync requires Stripe webhook endpoint and test keys.
