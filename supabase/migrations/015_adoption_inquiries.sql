-- Adoption inquiries: persist every inquiry and link to listing/publisher

create table if not exists public.adoption_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.adoption_listings(id) on delete cascade,
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  has_experience boolean not null default false,
  has_yard boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_adoption_inquiries_listing_id on public.adoption_inquiries(listing_id);
create index if not exists idx_adoption_inquiries_publisher_id on public.adoption_inquiries(publisher_id);

alter table public.adoption_inquiries enable row level security;

-- Publishers can read inquiries for their own listings
drop policy if exists "adoption_inquiries_select_own" on public.adoption_inquiries;
create policy "adoption_inquiries_select_own"
on public.adoption_inquiries
for select
using (
  exists (
    select 1
    from public.publisher_profiles pp
    where pp.id = adoption_inquiries.publisher_id
      and pp.user_id = auth.uid()
  )
);

-- Anyone can insert an inquiry (public form)
drop policy if exists "adoption_inquiries_insert_public" on public.adoption_inquiries;
create policy "adoption_inquiries_insert_public"
on public.adoption_inquiries
for insert
with check (true);
