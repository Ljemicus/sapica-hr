-- PetPark Owner Withdraw Request MVP
-- Prepared 2026-05-14 for owner review only.
-- DO NOT APPLY without explicit owner approval.
-- Minimal status constraint extension only: no backfill, no payment, no Stripe,
-- no calendar slot locking, no confirmed booking conversion, no canonical booking writes.

begin;

alter table public.booking_requests
  drop constraint if exists booking_requests_status_check;

alter table public.booking_requests
  add constraint booking_requests_status_check
  check (status in ('pending', 'contacted', 'closed', 'withdrawn'));

comment on constraint booking_requests_status_check on public.booking_requests
  is 'Allowed manual booking request lifecycle statuses for lead/request workflow, including owner-withdrawn terminal state.';

commit;
