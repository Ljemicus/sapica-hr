-- Reconstructed migration placeholder for remote version 20260425071000.
-- Exact original SQL is unavailable in repo. Reconstructed from production REST OpenAPI schema on 2026-05-13.
-- Purpose: Pet Passport persistence table. Do not apply blindly.

create table if not exists public.pet_passports (
  pet_id uuid primary key,
  notes text,
  vet_name text,
  vet_phone text,
  vet_address text,
  raw_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pet_passports enable row level security;
