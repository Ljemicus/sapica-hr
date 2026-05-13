-- PetPark Service CRUD listing layer draft
-- Status: created for review only. Do not apply to production until live schema is confirmed.

begin;

create table if not exists public.service_listings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  provider_service_id uuid references public.provider_services(id) on delete set null,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  category text,
  display_category text,
  city text,
  district text,
  service_area text,
  photos jsonb not null default '[]'::jsonb,
  included_features jsonb not null default '[]'::jsonb,
  house_rules jsonb not null default '[]'::jsonb,
  availability_mode text not null default 'request',
  status text not null default 'draft' check (status in ('draft', 'listed', 'paused', 'archived')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  seo_title text,
  seo_description text,
  listed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_listings_provider_id_idx on public.service_listings(provider_id);
create index if not exists service_listings_provider_service_id_idx on public.service_listings(provider_service_id);
create index if not exists service_listings_public_idx on public.service_listings(status, moderation_status, city, category);
create index if not exists service_listings_updated_at_idx on public.service_listings(updated_at desc);

alter table public.service_listings enable row level security;

-- Public marketplace read: only approved/listed listings attached to listed+verified providers.
drop policy if exists "Public can read listed service listings" on public.service_listings;
create policy "Public can read listed service listings"
on public.service_listings
for select
to anon, authenticated
using (
  status = 'listed'
  and moderation_status = 'approved'
  and exists (
    select 1
    from public.providers p
    where p.id = service_listings.provider_id
      and p.public_status = 'listed'
      and p.verified_status = 'verified'
  )
);

-- Provider owner management. Assumes providers.profile_id stores auth.users.id/profile id.
drop policy if exists "Providers can manage own service listings" on public.service_listings;
create policy "Providers can manage own service listings"
on public.service_listings
for all
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = service_listings.provider_id
      and p.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.providers p
    where p.id = service_listings.provider_id
      and p.profile_id = (select auth.uid())
  )
);

-- Keep updated_at current if the common trigger helper exists.
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'touch_updated_at'
  ) then
    drop trigger if exists service_listings_touch_updated_at on public.service_listings;
    create trigger service_listings_touch_updated_at
    before update on public.service_listings
    for each row
    execute function public.touch_updated_at();
  end if;
end;
$$;

commit;
