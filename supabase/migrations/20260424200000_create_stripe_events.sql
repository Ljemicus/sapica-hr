-- Cycle 12: Stripe webhook dedup + lifecycle state columns

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_result jsonb
);

alter table public.stripe_events enable row level security;

alter table if exists public.payments
  add column if not exists refund_status text,
  add column if not exists refunded_amount numeric(12,2);

alter table if exists public.providers
  add column if not exists payout_last_status text;

alter table if exists public.bookings
  add column if not exists stripe_checkout_session_id text,
  add column if not exists dispute_state text;

create index if not exists stripe_events_unprocessed_idx
  on public.stripe_events (received_at)
  where processed_at is null;

create index if not exists stripe_events_event_type_idx
  on public.stripe_events (event_type, received_at desc);

create index if not exists bookings_stripe_checkout_session_id_idx
  on public.bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;
