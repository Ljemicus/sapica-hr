-- Normalized sightings table — replaces lost_pets.sightings JSONB for new writes.
-- Existing JSONB data stays read-only until a backfill migration runs.

create table if not exists public.lost_pet_sightings (
  id          uuid        default gen_random_uuid() primary key,
  lost_pet_id uuid        not null references public.lost_pets(id) on delete cascade,
  reporter_ip text,                            -- hashed, for rate-limit / abuse checks
  location_label text     not null,            -- human-readable location text
  lat         decimal,
  lng         decimal,
  seen_at     timestamptz not null default now(),
  photo_url   text,
  description text        not null default '',
  created_at  timestamptz not null default now()
);

create index idx_sightings_lost_pet on public.lost_pet_sightings (lost_pet_id, created_at desc);

-- RLS
alter table public.lost_pet_sightings enable row level security;

-- Anyone can read sightings (same as lost_pets public read)
create policy "Public read sightings"
  on public.lost_pet_sightings for select
  using (true);

-- Anyone can insert a sighting (anonymous tips allowed)
create policy "Public insert sightings"
  on public.lost_pet_sightings for insert
  with check (true);

-- Only admins can delete (moderation)
create policy "Admin delete sightings"
  on public.lost_pet_sightings for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
