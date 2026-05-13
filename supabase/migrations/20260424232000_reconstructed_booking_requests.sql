-- Reconstructed migration placeholder for remote version 20260424232000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: lightweight booking request handoff table used by public UI. Do not apply blindly.

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  provider_slug text not null,
  provider_name text not null,
  provider_city text not null,
  provider_district text not null,
  service_label text not null,
  price_snapshot text not null,
  response_time_snapshot text not null,
  mode text not null,
  start_date date not null,
  end_date date not null,
  pet_name text not null,
  pet_type text not null,
  notes text not null default '',
  status text not null default 'new',
  source text not null default 'web',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists booking_requests_provider_slug_idx on public.booking_requests(provider_slug);
create index if not exists booking_requests_status_created_idx on public.booking_requests(status, created_at desc);

alter table public.booking_requests enable row level security;
