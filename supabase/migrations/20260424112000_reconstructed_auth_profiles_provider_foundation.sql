-- Reconstructed migration placeholder for remote version 20260424112000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: document production canonical profile/provider foundation locally. Do not apply blindly.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  display_name text,
  avatar_url text,
  phone text,
  city text,
  locale text not null default 'hr',
  status text not null default 'active',
  onboarding_state text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  granted_at timestamptz not null default now(),
  granted_by_profile_id uuid references public.profiles(id) on delete set null,
  primary key (profile_id, role)
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_kind text not null,
  display_name text not null,
  bio text,
  city text,
  address text,
  lat numeric,
  lng numeric,
  phone text,
  email citext,
  experience_years integer,
  verified_status text not null default 'unverified',
  public_status text not null default 'draft',
  response_time_label text,
  rating_avg numeric not null default 0,
  review_count integer not null default 0,
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  instant_booking_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payout_last_status text
);

create index if not exists providers_profile_id_idx on public.providers(profile_id);
create index if not exists providers_kind_public_idx on public.providers(provider_kind, public_status, verified_status);

alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.providers enable row level security;
