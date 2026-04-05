-- Rescue organizations + appeals foundation (Lane 1)
-- Minimal production-safe schema for rescue/org fundraising workflows.

create table if not exists public.rescue_organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  publisher_profile_id uuid unique references public.publisher_profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'active', 'suspended', 'archived')),
  kind text not null default 'rescue' check (kind in ('rescue', 'shelter', 'association', 'sanctuary', 'other')),
  verification_status text not null default 'not_submitted' check (verification_status in ('not_submitted', 'pending', 'approved', 'rejected')),
  legal_name text not null,
  display_name text not null,
  slug text not null unique,
  description text,
  city text,
  country_code text not null default 'HR' check (char_length(country_code) = 2),
  email text,
  phone text,
  website_url text,
  donation_contact_name text,
  bank_account_iban text,
  stripe_account_id text,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rescue_organizations_owner_unique unique (owner_user_id)
);

create index if not exists idx_rescue_organizations_status on public.rescue_organizations(status);
create index if not exists idx_rescue_organizations_verification_status on public.rescue_organizations(verification_status);
create index if not exists idx_rescue_organizations_slug on public.rescue_organizations(slug);
create index if not exists idx_rescue_organizations_publisher_profile_id on public.rescue_organizations(publisher_profile_id);

create table if not exists public.rescue_appeals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rescue_organizations(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'active', 'funded', 'closed', 'cancelled')),
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high', 'critical')),
  title text not null,
  slug text not null,
  summary text not null,
  story text,
  beneficiary_name text,
  species text,
  location_label text,
  cover_image_url text,
  target_amount_cents integer not null default 0 check (target_amount_cents >= 0),
  currency text not null default 'EUR',
  raised_amount_cents integer not null default 0 check (raised_amount_cents >= 0),
  donor_count integer not null default 0 check (donor_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  closed_at timestamptz,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rescue_appeals_slug_per_org unique (organization_id, slug),
  constraint rescue_appeals_dates_valid check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index if not exists idx_rescue_appeals_org_id on public.rescue_appeals(organization_id);
create index if not exists idx_rescue_appeals_status on public.rescue_appeals(status);
create index if not exists idx_rescue_appeals_urgency on public.rescue_appeals(urgency);
create index if not exists idx_rescue_appeals_live_window on public.rescue_appeals(starts_at, ends_at);

create table if not exists public.rescue_appeal_updates (
  id uuid primary key default gen_random_uuid(),
  appeal_id uuid not null references public.rescue_appeals(id) on delete cascade,
  organization_id uuid not null references public.rescue_organizations(id) on delete cascade,
  update_type text not null default 'progress' check (update_type in ('progress', 'medical', 'financial', 'thank_you', 'closure')),
  title text,
  body text not null,
  image_url text,
  is_public boolean not null default true,
  published_at timestamptz,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rescue_appeal_updates_appeal_id on public.rescue_appeal_updates(appeal_id);
create index if not exists idx_rescue_appeal_updates_public on public.rescue_appeal_updates(appeal_id, is_public, published_at desc);

create table if not exists public.rescue_appeal_donations (
  id uuid primary key default gen_random_uuid(),
  appeal_id uuid not null references public.rescue_appeals(id) on delete cascade,
  organization_id uuid not null references public.rescue_organizations(id) on delete cascade,
  donor_user_id uuid references public.users(id) on delete set null,
  donor_name text,
  donor_email text,
  is_anonymous boolean not null default false,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
  provider text,
  provider_payment_intent_id text,
  provider_checkout_session_id text,
  message text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rescue_appeal_donations_appeal_id on public.rescue_appeal_donations(appeal_id);
create index if not exists idx_rescue_appeal_donations_org_id on public.rescue_appeal_donations(organization_id);
create index if not exists idx_rescue_appeal_donations_status on public.rescue_appeal_donations(status);
create unique index if not exists idx_rescue_appeal_donations_payment_intent_unique
  on public.rescue_appeal_donations(provider_payment_intent_id)
  where provider_payment_intent_id is not null;
create unique index if not exists idx_rescue_appeal_donations_checkout_session_unique
  on public.rescue_appeal_donations(provider_checkout_session_id)
  where provider_checkout_session_id is not null;

create table if not exists public.rescue_verification_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rescue_organizations(id) on delete cascade,
  document_type text not null check (document_type in ('registration_certificate', 'charity_proof', 'bank_confirmation', 'identity_document', 'other')),
  storage_bucket text not null,
  storage_path text not null,
  original_filename text,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_rescue_verification_documents_org_id on public.rescue_verification_documents(organization_id);
create index if not exists idx_rescue_verification_documents_type on public.rescue_verification_documents(document_type);

create or replace function public.set_rescue_appeal_donation_rollup()
returns trigger
language plpgsql
as $$
begin
  update public.rescue_appeals a
  set
    raised_amount_cents = coalesce((
      select sum(d.amount_cents)
      from public.rescue_appeal_donations d
      where d.appeal_id = a.id
        and d.status = 'succeeded'
    ), 0),
    donor_count = coalesce((
      select count(*)
      from public.rescue_appeal_donations d
      where d.appeal_id = a.id
        and d.status = 'succeeded'
    ), 0),
    updated_at = now()
  where a.id = coalesce(new.appeal_id, old.appeal_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_rescue_organizations_updated_at on public.rescue_organizations;
create trigger trg_rescue_organizations_updated_at
before update on public.rescue_organizations
for each row execute function public.set_updated_at();

drop trigger if exists trg_rescue_appeals_updated_at on public.rescue_appeals;
create trigger trg_rescue_appeals_updated_at
before update on public.rescue_appeals
for each row execute function public.set_updated_at();

drop trigger if exists trg_rescue_appeal_updates_updated_at on public.rescue_appeal_updates;
create trigger trg_rescue_appeal_updates_updated_at
before update on public.rescue_appeal_updates
for each row execute function public.set_updated_at();

drop trigger if exists trg_rescue_appeal_donations_updated_at on public.rescue_appeal_donations;
create trigger trg_rescue_appeal_donations_updated_at
before update on public.rescue_appeal_donations
for each row execute function public.set_updated_at();

drop trigger if exists trg_rescue_appeal_donations_rollup on public.rescue_appeal_donations;
create trigger trg_rescue_appeal_donations_rollup
after insert or update or delete on public.rescue_appeal_donations
for each row execute function public.set_rescue_appeal_donation_rollup();

alter table public.rescue_organizations enable row level security;
alter table public.rescue_appeals enable row level security;
alter table public.rescue_appeal_updates enable row level security;
alter table public.rescue_appeal_donations enable row level security;
alter table public.rescue_verification_documents enable row level security;

-- rescue_organizations
create policy "rescue_organizations_select_active_or_own"
on public.rescue_organizations
for select
using (
  status = 'active'
  or owner_user_id = auth.uid()
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "rescue_organizations_insert_own"
on public.rescue_organizations
for insert
with check (owner_user_id = auth.uid());

create policy "rescue_organizations_update_own_or_admin"
on public.rescue_organizations
for update
using (
  owner_user_id = auth.uid()
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
)
with check (
  owner_user_id = auth.uid()
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- rescue_appeals
create policy "rescue_appeals_select_live_or_owner"
on public.rescue_appeals
for select
using (
  status in ('active', 'funded', 'closed')
  or exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeals.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "rescue_appeals_insert_owner"
on public.rescue_appeals
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeals.organization_id
      and ro.owner_user_id = auth.uid()
  )
);

create policy "rescue_appeals_update_owner_or_admin"
on public.rescue_appeals
for update
using (
  exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeals.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
)
with check (
  exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeals.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- rescue_appeal_updates
create policy "rescue_appeal_updates_select_public_or_owner"
on public.rescue_appeal_updates
for select
using (
  (is_public = true and (published_at is null or published_at <= now()))
  or exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_updates.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "rescue_appeal_updates_insert_owner"
on public.rescue_appeal_updates
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_updates.organization_id
      and ro.owner_user_id = auth.uid()
  )
);

create policy "rescue_appeal_updates_update_owner_or_admin"
on public.rescue_appeal_updates
for update
using (
  exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_updates.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
)
with check (
  exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_updates.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- rescue_appeal_donations
create policy "rescue_appeal_donations_select_owner_or_donor"
on public.rescue_appeal_donations
for select
using (
  donor_user_id = auth.uid()
  or exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_donations.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "rescue_appeal_donations_insert_self_or_guest"
on public.rescue_appeal_donations
for insert
with check (
  donor_user_id is null or donor_user_id = auth.uid()
);

create policy "rescue_appeal_donations_update_owner_donor_or_admin"
on public.rescue_appeal_donations
for update
using (
  donor_user_id = auth.uid()
  or exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_donations.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
)
with check (
  donor_user_id = auth.uid()
  or exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_appeal_donations.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- rescue_verification_documents
create policy "rescue_verification_documents_select_owner_or_admin"
on public.rescue_verification_documents
for select
using (
  exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_verification_documents.organization_id
      and ro.owner_user_id = auth.uid()
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "rescue_verification_documents_insert_owner"
on public.rescue_verification_documents
for insert
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1 from public.rescue_organizations ro
    where ro.id = rescue_verification_documents.organization_id
      and ro.owner_user_id = auth.uid()
  )
);

create policy "rescue_verification_documents_update_admin_only"
on public.rescue_verification_documents
for update
using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

insert into storage.buckets (id, name, public)
values ('rescue-verification-docs', 'rescue-verification-docs', false)
on conflict (id) do nothing;

create policy "rescue verification docs upload"
on storage.objects
for insert
with check (
  bucket_id = 'rescue-verification-docs'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = 'orgs'
  and exists (
    select 1
    from public.rescue_organizations ro
    where ro.id::text = (storage.foldername(name))[2]
      and ro.owner_user_id = auth.uid()
  )
);

create policy "rescue verification docs owner read"
on storage.objects
for select
using (
  bucket_id = 'rescue-verification-docs'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = 'orgs'
  and (
    exists (
      select 1
      from public.rescue_organizations ro
      where ro.id::text = (storage.foldername(name))[2]
        and ro.owner_user_id = auth.uid()
    )
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  )
);
