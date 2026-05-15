-- Booking Request Activity + In-App Notifications MVP
-- Applied only after explicit owner approval.
-- Scope guardrails:
-- - in-app notifications only; no email/SMS/WhatsApp/push send
-- - activity log only; no chat/messages/conversations writes
-- - no payment, no Stripe, no calendar slot locking, no canonical bookings writes
-- - no bulk backfill

create table if not exists public.booking_request_events (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  actor_role text not null,
  event_type text not null,
  old_status text null,
  new_status text null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint booking_request_events_actor_role_check
    check (actor_role in ('owner', 'provider', 'admin', 'system')),
  constraint booking_request_events_event_type_check
    check (event_type in ('created', 'provider_contacted', 'provider_closed', 'owner_withdrawn'))
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  booking_request_id uuid null references public.booking_requests(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  target_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint notifications_type_check
    check (type in ('booking_request_created', 'booking_request_contacted', 'booking_request_closed', 'booking_request_withdrawn')),
  constraint notifications_target_path_check
    check (target_path like '/%')
);

comment on table public.booking_request_events is
  'Append-only booking-request activity log for in-app timelines. No chat, no external notifications, no payment side effects.';
comment on table public.notifications is
  'In-app notification inbox. Does not send email, SMS, WhatsApp, push, chat messages, or payment/calendar actions.';

create index if not exists booking_request_events_request_created_idx
  on public.booking_request_events (booking_request_id, created_at desc);

create index if not exists notifications_recipient_read_created_idx
  on public.notifications (recipient_profile_id, read_at, created_at desc);

create index if not exists notifications_booking_request_idx
  on public.notifications (booking_request_id);

alter table public.booking_request_events enable row level security;
alter table public.notifications enable row level security;

-- Grants: app/server writes use service role. Authenticated users read allowed rows;
-- direct event writes are intentionally not granted/policied.
revoke all on public.booking_request_events from anon, authenticated;
revoke all on public.notifications from anon, authenticated;

grant select on public.booking_request_events to authenticated;
grant select on public.notifications to authenticated;
-- Recipients may mark their own notifications read. Column grant keeps direct client
-- updates limited to read_at; app API should still validate this server-side.
grant update (read_at) on public.notifications to authenticated;

-- booking_request_events policies

drop policy if exists "booking_request_events_owner_select" on public.booking_request_events;
create policy "booking_request_events_owner_select"
on public.booking_request_events
for select
to authenticated
using (
  exists (
    select 1
    from public.booking_requests br
    where br.id = booking_request_events.booking_request_id
      and br.owner_profile_id = (select auth.uid())
  )
);

drop policy if exists "booking_request_events_provider_select" on public.booking_request_events;
create policy "booking_request_events_provider_select"
on public.booking_request_events
for select
to authenticated
using (
  exists (
    select 1
    from public.booking_requests br
    join public.service_listings sl on sl.slug = br.provider_slug
    join public.providers p on p.id = sl.provider_id
    where br.id = booking_request_events.booking_request_id
      and p.profile_id = (select auth.uid())
  )
);

drop policy if exists "booking_request_events_admin_select" on public.booking_request_events;
create policy "booking_request_events_admin_select"
on public.booking_request_events
for select
to authenticated
using ((select public.is_admin()));

-- Optional admin management policy for dashboard/maintenance. Normal users still have
-- no event insert/update/delete policy. Service role bypasses RLS for app writes.
drop policy if exists "booking_request_events_admin_manage" on public.booking_request_events;
create policy "booking_request_events_admin_manage"
on public.booking_request_events
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- notifications policies

drop policy if exists "notifications_recipient_select" on public.notifications;
create policy "notifications_recipient_select"
on public.notifications
for select
to authenticated
using (recipient_profile_id = (select auth.uid()));

drop policy if exists "notifications_recipient_update_read_at" on public.notifications;
create policy "notifications_recipient_update_read_at"
on public.notifications
for update
to authenticated
using (recipient_profile_id = (select auth.uid()))
with check (recipient_profile_id = (select auth.uid()));

drop policy if exists "notifications_admin_select" on public.notifications;
create policy "notifications_admin_select"
on public.notifications
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "notifications_admin_manage" on public.notifications;
create policy "notifications_admin_manage"
on public.notifications
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
