-- PetPark Booking Request Contact Identity MVP
-- Prepared 2026-05-14 for owner review only.
-- Do not apply without explicit approval.
-- Minimal additive schema only: no backfill, no payment, no Stripe,
-- no calendar slot locking, no confirmed booking conversion.

begin;

alter table public.booking_requests
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists requester_name text,
  add column if not exists requester_email text,
  add column if not exists requester_phone text,
  add column if not exists contact_consent boolean not null default false,
  add column if not exists contact_source text not null default 'booking_request_form';

alter table public.booking_requests
  drop constraint if exists booking_requests_contact_source_check;

alter table public.booking_requests
  add constraint booking_requests_contact_source_check
  check (contact_source in ('booking_request_form'));

create index if not exists booking_requests_owner_profile_idx
  on public.booking_requests(owner_profile_id)
  where owner_profile_id is not null;

comment on column public.booking_requests.owner_profile_id is 'Nullable requester profile id when the booking request was submitted by an authenticated PetPark user.';
comment on column public.booking_requests.requester_name is 'Requester display name supplied for provider follow-up. Server/dashboard guarded; never public.';
comment on column public.booking_requests.requester_email is 'Requester email supplied for provider follow-up. Server/dashboard guarded; never public.';
comment on column public.booking_requests.requester_phone is 'Optional requester phone supplied for provider follow-up. Server/dashboard guarded; never public.';
comment on column public.booking_requests.contact_consent is 'True only when requester consents to PetPark sharing contact data with the provider for this request.';
comment on column public.booking_requests.contact_source is 'Origin of requester contact data.';

commit;
