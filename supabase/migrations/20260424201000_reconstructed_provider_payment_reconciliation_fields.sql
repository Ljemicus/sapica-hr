-- Reconstructed migration placeholder for remote version 20260424201000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: ensure payment reconciliation columns present. Do not apply blindly.

alter table public.providers
  add column if not exists payout_last_status text;

alter table public.bookings
  add column if not exists stripe_checkout_session_id text,
  add column if not exists dispute_state text,
  add column if not exists provider_amount numeric,
  add column if not exists platform_fee numeric;
