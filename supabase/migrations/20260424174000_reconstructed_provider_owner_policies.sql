-- Reconstructed migration placeholder for remote version 20260424174000.
-- Exact original SQL is unavailable in repo. Reconstructed from production ownership assumptions on 2026-05-13.
-- Purpose: provider owner policies. Confirm profiles.id == auth.users.id before applying.

drop policy if exists "Provider owners can manage own provider" on public.providers;
create policy "Provider owners can manage own provider"
on public.providers
for all
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

drop policy if exists "Provider owners can manage own services" on public.provider_services;
create policy "Provider owners can manage own services"
on public.provider_services
for all
to authenticated
using (exists (select 1 from public.providers p where p.id = provider_services.provider_id and p.profile_id = (select auth.uid())))
with check (exists (select 1 from public.providers p where p.id = provider_services.provider_id and p.profile_id = (select auth.uid())));
