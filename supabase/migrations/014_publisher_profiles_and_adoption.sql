-- Faza 1: Publisher profiles / onboarding
-- Faza 2: Adoption listings

create table if not exists public.publisher_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  type text not null check (type in ('vlasnik', 'čuvar', 'groomer', 'trener', 'uzgajivač', 'veterinar')),
  display_name text not null,
  bio text,
  city text,
  phone text,
  avatar_url text,
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_publisher_profiles_type on public.publisher_profiles(type);
create index if not exists idx_publisher_profiles_city on public.publisher_profiles(city);

create table if not exists public.adoption_listings (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'adopted', 'expired')),
  name text not null,
  species text not null check (species in ('dog', 'cat', 'rabbit', 'other')),
  breed text,
  age_months integer check (age_months is null or age_months >= 0),
  gender text check (gender is null or gender in ('male', 'female')),
  size text check (size is null or size in ('small', 'medium', 'large')),
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg >= 0),
  color text,
  sterilized boolean not null default false,
  vaccinated boolean not null default false,
  microchipped boolean not null default false,
  good_with_kids boolean,
  good_with_pets boolean,
  description text not null,
  personality text,
  special_needs text,
  city text not null,
  images jsonb not null default '[]'::jsonb,
  contact_phone text,
  contact_email text,
  is_urgent boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint adoption_images_is_array check (jsonb_typeof(images) = 'array')
);

create index if not exists idx_adoption_listings_publisher_id on public.adoption_listings(publisher_id);
create index if not exists idx_adoption_listings_status on public.adoption_listings(status);
create index if not exists idx_adoption_listings_species on public.adoption_listings(species);
create index if not exists idx_adoption_listings_city on public.adoption_listings(city);
create index if not exists idx_adoption_listings_is_urgent on public.adoption_listings(is_urgent);
create index if not exists idx_adoption_listings_published_at on public.adoption_listings(published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_publisher_profiles_updated_at on public.publisher_profiles;
create trigger trg_publisher_profiles_updated_at
before update on public.publisher_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_adoption_listings_updated_at on public.adoption_listings;
create trigger trg_adoption_listings_updated_at
before update on public.adoption_listings
for each row
execute function public.set_updated_at();

alter table public.publisher_profiles enable row level security;
alter table public.adoption_listings enable row level security;

-- publisher_profiles policies
drop policy if exists "publisher_profiles_select_own" on public.publisher_profiles;
create policy "publisher_profiles_select_own"
on public.publisher_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "publisher_profiles_insert_own" on public.publisher_profiles;
create policy "publisher_profiles_insert_own"
on public.publisher_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "publisher_profiles_update_own" on public.publisher_profiles;
create policy "publisher_profiles_update_own"
on public.publisher_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- adoption_listings policies
drop policy if exists "adoption_listings_select_active_or_own" on public.adoption_listings;
create policy "adoption_listings_select_active_or_own"
on public.adoption_listings
for select
using (
  status = 'active'
  or exists (
    select 1
    from public.publisher_profiles pp
    where pp.id = adoption_listings.publisher_id
      and pp.user_id = auth.uid()
  )
);

drop policy if exists "adoption_listings_insert_own" on public.adoption_listings;
create policy "adoption_listings_insert_own"
on public.adoption_listings
for insert
with check (
  exists (
    select 1
    from public.publisher_profiles pp
    where pp.id = adoption_listings.publisher_id
      and pp.user_id = auth.uid()
  )
);

drop policy if exists "adoption_listings_update_own" on public.adoption_listings;
create policy "adoption_listings_update_own"
on public.adoption_listings
for update
using (
  exists (
    select 1
    from public.publisher_profiles pp
    where pp.id = adoption_listings.publisher_id
      and pp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.publisher_profiles pp
    where pp.id = adoption_listings.publisher_id
      and pp.user_id = auth.uid()
  )
);

drop policy if exists "adoption_listings_delete_own" on public.adoption_listings;
create policy "adoption_listings_delete_own"
on public.adoption_listings
for delete
using (
  exists (
    select 1
    from public.publisher_profiles pp
    where pp.id = adoption_listings.publisher_id
      and pp.user_id = auth.uid()
  )
);
