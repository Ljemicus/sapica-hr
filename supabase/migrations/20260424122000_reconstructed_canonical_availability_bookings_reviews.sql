-- Reconstructed migration placeholder for remote version 20260424122000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: canonical provider availability, bookings, reviews. Do not apply blindly.

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  service_code text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Europe/Zagreb',
  status text not null default 'available',
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_slots_time_check check (ends_at > starts_at)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  pet_id uuid,
  provider_kind text not null,
  primary_service_code text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  currency text not null default 'EUR',
  subtotal_amount numeric not null default 0,
  platform_fee_amount numeric not null default 0,
  total_amount numeric not null default 0,
  owner_note text,
  provider_note text,
  cancellation_reason text,
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stripe_checkout_session_id text,
  dispute_state text,
  provider_amount numeric,
  platform_fee numeric,
  constraint bookings_time_check check (ends_at > starts_at)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists availability_slots_provider_time_idx on public.availability_slots(provider_id, starts_at, ends_at);
create index if not exists bookings_owner_profile_id_idx on public.bookings(owner_profile_id);
create index if not exists bookings_provider_id_idx on public.bookings(provider_id);
create index if not exists bookings_starts_at_idx on public.bookings(starts_at);
create index if not exists reviews_provider_id_idx on public.reviews(provider_id);
create index if not exists reviews_booking_id_idx on public.reviews(booking_id);

alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
