# PetPark Booking Request Conversation MVP — Snapshot, Audit, Plan

Date: 2026-05-15
Current HEAD before feature work: `bc360f4617c6dea2f791a6b59d43083c8fdb85bc`
Remote: `origin/main` aligned at the same commit.

## 00 Snapshot

- Redesign / Service Listings / Booking Request / status actions / contact identity / owner requests / owner withdraw / notifications activity are closed.
- Current GitHub Actions for `bc360f46` are green:
  - `CI/CD Pipeline`: success
  - `CI`: success
- Required routes exist locally:
  - `/usluge`
  - `/usluge/[slug]`
  - `/objavi-uslugu`
  - `/moje-usluge`
  - `/moji-upiti`
  - `/upozorenja`
  - `/notifikacije`
- Vercel CLI lists active PetPark deployments.
- Hard non-goals preserved: no Stripe, no payment, no calendar lock, no confirmed booking conversion, no external email/SMS/WhatsApp/push messaging, no file upload, no bulk backfill.

## 01 Readiness Audit — No Writes

### Existing schema summary

Existing generated types include canonical booking chat tables:

- `conversations`
  - `id`, `booking_id`, `created_by_profile_id`, `last_message_at`, timestamps
  - `booking_id` is a one-to-one FK to canonical `bookings`
- `conversation_participants`
  - `conversation_id`, `profile_id`, `last_read_at`, `created_at`
- `messages`
  - `conversation_id`, `sender_profile_id`, nullable text content, nullable image storage path, message type, deleted timestamp

Booking request tables currently support the request flow:

- `booking_requests`
  - has `owner_profile_id`, `provider_slug`, requester contact fields, status, notes, dates
- `booking_request_events`
  - append-only activity timeline, request-scoped
- `notifications`
  - in-app inbox with `booking_request_id`, recipient profile, type/title/body/target_path/metadata/read timestamp

### RLS summary from local migrations/types

- `booking_request_events`: owner/provider/admin select policies; no normal user insert/update/delete.
- `notifications`: recipient/admin select; recipient may update `read_at`; server/service role inserts.
- `booking_requests`: reconstructed base table has RLS enabled, but app currently uses server-side ownership checks/admin client for provider/owner request views and actions.
- Existing conversation/message policies were not present in local reconstructed migration files, so reusing those tables would require additional verification and could risk canonical booking chat behavior.

### Existing `conversations.booking_id` assessment

Do **not** reuse `conversations.booking_id` for booking requests. It is a FK to canonical `bookings`, one-to-one, and semantically tied to confirmed bookings. Overloading it for request threads would blur the explicit boundary: request conversation must not create or imply confirmed booking/payment/calendar state.

### Participant resolution readiness

- Owner: `booking_requests.owner_profile_id === auth user id`.
- Provider: `booking_requests.provider_slug -> service_listings.slug -> service_listings.provider_id -> providers.id -> providers.profile_id === auth user id`.
- Anonymous booking requests have `owner_profile_id = null`; they must not get an owner-side in-app thread.

### GO/NO-GO

GO for a small request-scoped text-only conversation MVP with a dedicated table. A migration is required.

## 02 MVP Plan

### Data model recommendation

Use a dedicated `booking_request_messages` table instead of reusing canonical `conversations/messages`.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `booking_request_id uuid not null references public.booking_requests(id) on delete cascade`
- `sender_profile_id uuid not null references public.profiles(id) on delete cascade`
- `sender_role text not null check in ('owner','provider','admin')`
- `body text not null` with trimmed length check `1..2000`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Indexes:

- `(booking_request_id, created_at asc)` for thread reads
- `(sender_profile_id, created_at desc)` for audit/support

Notifications:

- Extend `notifications_type_check` with `booking_request_message`.

### API design

Route: `/api/booking-requests/[id]/messages`

- `GET`: auth required, return messages for owner/provider/admin participant only.
- `POST`: auth required, rate-limited, text-only, trim, reject empty and >2000 chars.
- Server resolves participant from request and listing/provider ownership.
- Server rejects anonymous owner requests (`owner_profile_id` missing) for message thread use.
- Server inserts message via service role after app-level auth checks.
- Server creates in-app `notifications` row for the other participant only; no external send.

### UI design

- Owner `/moji-upiti`: compact thread in request detail area.
- Provider `/moje-usluge`: compact thread in each request panel.
- Include privacy copy and disabled state when anonymous request cannot use in-app thread.
- Mobile-friendly card, no file uploads, no edit/delete/read receipt UI.

### Security/privacy

- Participant resolution is server-side and does not trust client-supplied participant IDs.
- Public listing pages must never fetch/request thread data.
- No requester contact data is returned from the messages API.
- Anonymous owner requests cannot use owner-side thread.
- POST is rate-limited.

### Rollback

- Disable UI/API by reverting code commit.
- Drop `booking_request_messages` and restore prior `notifications_type_check` if needed.
- No booking/payment/calendar/canonical booking data is touched.

## 03 Migration Final Review — No Apply

Exact migration filename:

`supabase/migrations/20260515090000_booking_request_conversation_messages.sql`

Affected tables:

- New: `public.booking_request_messages`
- Existing: `public.notifications` check constraint is widened to include `booking_request_message`

GO recommendation: GO after owner explicitly approves applying only this migration to production Supabase.

Required approval before production apply:

`Odobravam da sada primijeniš samo 20260515090000_booking_request_conversation_messages.sql na produkcijski Supabase za Booking Request Conversation MVP. Nema paymenta, nema Stripea, nema calendar locka, nema backfilla i nema vanjskog slanja poruka.`
