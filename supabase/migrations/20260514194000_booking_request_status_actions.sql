-- PetPark Booking Requests status action constraint
-- Approved 2026-05-14 by owner in #full-rebuild.
-- Minimal change only: allow manual provider request statuses.
-- No payment, Stripe, calendar slot locking, backfill, or other Supabase changes.

begin;

alter table public.booking_requests
  alter column status set default 'pending';

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'booking_requests'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format('alter table public.booking_requests drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.booking_requests
  add constraint booking_requests_status_check
  check (status in ('pending', 'contacted', 'closed'));

commit;
