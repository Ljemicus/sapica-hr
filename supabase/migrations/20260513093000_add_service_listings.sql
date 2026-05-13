-- PetPark Service CRUD listing layer draft
-- Status: revised for review only on 2026-05-13. Do not apply to production until explicitly approved.
--
-- Reconciled assumptions:
-- - Canonical production provider ownership is public.providers.profile_id = auth.uid().
-- - public.provider_services remains the pricing/service-code source of truth.
-- - public.service_listings is a presentation/editorial layer for richer marketplace copy, SEO,
--   photos, features, and moderation state; it should not replace booking/payment/provider_services flows.
-- - Admin checks use the existing public.is_admin() helper seen in production RLS.

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
  availability_mode text not null default 'request' check (availability_mode in ('request', 'calendar', 'instant')),
  status text not null default 'draft' check (status in ('draft', 'listed', 'paused', 'archived')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  seo_title text,
  seo_description text,
  listed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_listings_slug_not_blank check (length(btrim(slug)) > 0),
  constraint service_listings_title_not_blank check (length(btrim(title)) > 0),
  constraint service_listings_photos_array check (jsonb_typeof(photos) = 'array'),
  constraint service_listings_included_features_array check (jsonb_typeof(included_features) = 'array'),
  constraint service_listings_house_rules_array check (jsonb_typeof(house_rules) = 'array')
);

create index if not exists service_listings_provider_id_idx on public.service_listings(provider_id);
create index if not exists service_listings_provider_service_id_idx on public.service_listings(provider_service_id);
create unique index if not exists service_listings_provider_service_unique_idx
  on public.service_listings(provider_service_id)
  where provider_service_id is not null;
create index if not exists service_listings_public_idx on public.service_listings(status, moderation_status, city, category);
create index if not exists service_listings_provider_status_idx on public.service_listings(provider_id, status, moderation_status);
create index if not exists service_listings_updated_at_idx on public.service_listings(updated_at desc);

alter table public.service_listings enable row level security;

-- Public marketplace read: only approved/listed listings attached to listed+verified providers.
-- This mirrors the existing public read model for provider_services while adding listing moderation gates.
drop policy if exists "service_listings_public_select" on public.service_listings;
create policy "service_listings_public_select"
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

-- Provider owner/admin management. Confirmed production ownership model:
-- public.providers.profile_id = auth.uid().
drop policy if exists "service_listings_owner_or_admin_manage" on public.service_listings;
create policy "service_listings_owner_or_admin_manage"
on public.service_listings
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.providers p
    where p.id = service_listings.provider_id
      and p.profile_id = (select auth.uid())
  )
)
with check (
  public.is_admin()
  or exists (
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
  elsif exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
  ) then
    drop trigger if exists service_listings_set_updated_at on public.service_listings;
    create trigger service_listings_set_updated_at
    before update on public.service_listings
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

commit;
