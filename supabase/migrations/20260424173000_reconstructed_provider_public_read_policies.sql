-- Reconstructed migration placeholder for remote version 20260424173000.
-- Exact original SQL is unavailable in repo. Reconstructed from production shape and app needs on 2026-05-13.
-- Purpose: baseline public marketplace read policies. Do not apply blindly.

drop policy if exists "Public can read listed verified providers" on public.providers;
create policy "Public can read listed verified providers"
on public.providers
for select
to anon, authenticated
using (public_status = 'listed' and verified_status = 'verified');

drop policy if exists "Public can read active services for listed providers" on public.provider_services;
create policy "Public can read active services for listed providers"
on public.provider_services
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.providers p
    where p.id = provider_services.provider_id
      and p.public_status = 'listed'
      and p.verified_status = 'verified'
  )
);
