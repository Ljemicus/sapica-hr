# PetPark Service CRUD Migration Plan — No Apply

Date: 2026-05-13
Status: draft only — do not apply to production yet

## Goal

Support real provider service publishing/listing while preserving the current PetPark v6 UI.

The existing `provider_services` table is useful as provider service inventory, but it is not enough for public marketplace cards/details because it only carries `provider_id`, `service_code`, price/duration, and `is_active`.

## Recommendation

Add a minimal additive `service_listings` layer keyed to `provider_services.id`.

Keep ownership split:

- `providers`: provider identity, trust, public status
- `provider_services`: canonical purchasable service inventory
- `service_listings`: public card/detail content, slug, moderation/publish state, SEO-ish fields
- `provider_*_settings`: kind-specific defaults
- `availability_slots`: separate availability model; do not solve booking availability in this slice

## Tables affected

- New: `public.service_listings`
- Existing referenced: `public.provider_services`, `public.providers`

## Proposed migration SQL draft

A draft migration file was created at:

`supabase/migrations/20260513093000_add_service_listings.sql`

Do not apply it until reviewed.

Summary of the draft:

- creates `public.service_listings`
- adds unique slug
- adds status check: `draft`, `listed`, `paused`, `archived`
- adds moderation metadata
- adds JSONB arrays for photos/features/rules
- adds indexes for public reads and provider ownership reads
- enables RLS
- public can read only `status='listed'` rows whose provider is `public_status='listed'` and `verified_status='verified'`
- providers can manage listings for their own provider rows via `auth.uid() = providers.profile_id`
- admins/service-role retain management path

## Risks

1. Existing production schema is not fully represented in repo migrations. Apply only after confirming current live columns.
2. Public reads currently use server/admin helpers in some adapters. RLS policy should still be correct before any client writes.
3. `provider_services` has no slug/title/description. Backfill strategy is needed before production listing UI relies on `service_listings` only.
4. `availability_slots` has competing schema assumptions and should not be tied to booking UX yet.
5. Booking/payment flows are intentionally out of scope.

## Rollback notes

Because the plan is additive, rollback is straightforward before data dependency exists:

```sql
drop table if exists public.service_listings;
```

If rows are created later, export/back up `service_listings` first.

## Exact next implementation step

Implement a safe read-first slice:

1. Add server helper `lib/db/service-listings.ts` that reads real listed provider services/listings where possible.
2. If `service_listings` does not exist yet, gracefully fall back to existing `provider_services + providers` data.
3. Wire `/usluge` and `/usluge/[slug]` to the helper.
4. Preserve current mock fallback if Supabase data is unavailable/incomplete.
5. Do not write production data and do not apply migration.
