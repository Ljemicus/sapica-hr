-- Cycle 13: booking monetary invariant
-- total_amount = provider_amount + platform_fee

alter table public.bookings
  add column if not exists provider_amount numeric(10,2),
  add column if not exists platform_fee numeric(10,2);

update public.bookings
set provider_amount = round((total_amount / 1.10)::numeric, 2),
    platform_fee = round((total_amount - (total_amount / 1.10))::numeric, 2)
where provider_amount is null
  and total_amount is not null;

alter table public.bookings
  drop constraint if exists bookings_amount_sum_ck;

alter table public.bookings
  add constraint bookings_amount_sum_ck
  check (
    total_amount is null
    or (
      provider_amount is not null
      and platform_fee is not null
      and total_amount = provider_amount + platform_fee
    )
  );
