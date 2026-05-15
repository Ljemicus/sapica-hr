-- Booking Request Conversation MVP
-- Scope guardrails:
-- - text-only, request-scoped in-app messages
-- - no email/SMS/WhatsApp/push sends
-- - no file uploads/images
-- - no payment, no Stripe, no calendar slot locking, no canonical bookings writes
-- - no bulk backfill

create table if not exists public.booking_request_messages (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint booking_request_messages_sender_role_check
    check (sender_role in ('owner', 'provider', 'admin')),
  constraint booking_request_messages_body_length_check
    check (char_length(btrim(body)) between 1 and 2000)
);

comment on table public.booking_request_messages is
  'Text-only in-app messages tied to booking_requests. No external messaging, uploads, payment, calendar, or canonical booking side effects.';
comment on column public.booking_request_messages.body is
  'Text-only message body. No rich text, HTML, files, images, or external delivery in MVP.';

create index if not exists booking_request_messages_request_created_idx
  on public.booking_request_messages (booking_request_id, created_at asc);

create index if not exists booking_request_messages_sender_created_idx
  on public.booking_request_messages (sender_profile_id, created_at desc);

alter table public.booking_request_messages enable row level security;

revoke all on public.booking_request_messages from anon, authenticated;
grant select, insert on public.booking_request_messages to authenticated;

-- Widen in-app notification types for request conversation messages only.
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
    check (type in (
      'booking_request_created',
      'booking_request_contacted',
      'booking_request_closed',
      'booking_request_withdrawn',
      'booking_request_message'
    ));

-- Owner participant can read messages on their authenticated request.
drop policy if exists "booking_request_messages_owner_select" on public.booking_request_messages;
create policy "booking_request_messages_owner_select"
on public.booking_request_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.booking_requests br
    where br.id = booking_request_messages.booking_request_id
      and br.owner_profile_id = (select auth.uid())
  )
);

-- Provider participant can read messages for requests tied to their listing.
drop policy if exists "booking_request_messages_provider_select" on public.booking_request_messages;
create policy "booking_request_messages_provider_select"
on public.booking_request_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.booking_requests br
    join public.service_listings sl on sl.slug = br.provider_slug
    join public.providers p on p.id = sl.provider_id
    where br.id = booking_request_messages.booking_request_id
      and p.profile_id = (select auth.uid())
  )
);

-- Optional admin support read, explicit and bounded to existing admin helper.
drop policy if exists "booking_request_messages_admin_select" on public.booking_request_messages;
create policy "booking_request_messages_admin_select"
on public.booking_request_messages
for select
to authenticated
using ((select public.is_admin()));

-- Owner participant can insert only as themselves on their authenticated request.
drop policy if exists "booking_request_messages_owner_insert" on public.booking_request_messages;
create policy "booking_request_messages_owner_insert"
on public.booking_request_messages
for insert
to authenticated
with check (
  sender_profile_id = (select auth.uid())
  and sender_role = 'owner'
  and exists (
    select 1
    from public.booking_requests br
    where br.id = booking_request_messages.booking_request_id
      and br.owner_profile_id = (select auth.uid())
  )
);

-- Provider participant can insert only as themselves for their listing request.
drop policy if exists "booking_request_messages_provider_insert" on public.booking_request_messages;
create policy "booking_request_messages_provider_insert"
on public.booking_request_messages
for insert
to authenticated
with check (
  sender_profile_id = (select auth.uid())
  and sender_role = 'provider'
  and exists (
    select 1
    from public.booking_requests br
    join public.service_listings sl on sl.slug = br.provider_slug
    join public.providers p on p.id = sl.provider_id
    where br.id = booking_request_messages.booking_request_id
      and p.profile_id = (select auth.uid())
  )
);

-- Optional admin support insert, explicit and bounded to existing admin helper.
drop policy if exists "booking_request_messages_admin_insert" on public.booking_request_messages;
create policy "booking_request_messages_admin_insert"
on public.booking_request_messages
for insert
to authenticated
with check (
  sender_profile_id = (select auth.uid())
  and sender_role = 'admin'
  and (select public.is_admin())
);
