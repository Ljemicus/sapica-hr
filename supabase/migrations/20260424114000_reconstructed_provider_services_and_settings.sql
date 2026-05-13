-- Reconstructed migration placeholder for remote version 20260424114000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: canonical provider service inventory + provider-kind settings. Do not apply blindly.

create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  service_code text not null,
  base_price numeric not null,
  currency text not null default 'EUR',
  duration_minutes integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_sitter_settings (
  provider_id uuid primary key references public.providers(id) on delete cascade,
  home_type text,
  has_yard boolean not null default false,
  accepts_small_dogs boolean not null default true,
  accepts_large_dogs boolean not null default true,
  accepts_cats boolean not null default false,
  max_pets_per_day integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_groomer_settings (
  provider_id uuid primary key references public.providers(id) on delete cascade,
  specialization text,
  mobile_service boolean not null default false,
  working_hours_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_trainer_settings (
  provider_id uuid primary key references public.providers(id) on delete cascade,
  specializations text[] not null default '{}'::text[],
  certified boolean not null default false,
  training_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_services_provider_id_idx on public.provider_services(provider_id);
create index if not exists provider_services_code_active_idx on public.provider_services(service_code, is_active);

alter table public.provider_services enable row level security;
alter table public.provider_sitter_settings enable row level security;
alter table public.provider_groomer_settings enable row level security;
alter table public.provider_trainer_settings enable row level security;
