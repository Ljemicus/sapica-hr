-- Reconstructed migration placeholder for remote version 20260424200000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: Stripe event idempotency table and payment-related provider/booking fields. Do not apply blindly.

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_result jsonb
);

alter table public.stripe_events enable row level security;

-- Advisor previously reported RLS enabled without policy; keep table service-role only by not adding anon/auth policies.
