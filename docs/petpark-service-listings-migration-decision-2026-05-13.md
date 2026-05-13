# PetPark Service Listings Migration Decision Gate

Date: 2026-05-13
Status: NO-APPLY decision package
Related deployment: `80084fb68a59731e50bdb450caa1821f662c5c1c`

## Executive summary

Do **not** apply `supabase/migrations/20260513093000_add_service_listings.sql` yet.

The read-first Service CRUD slice is live and stable because it gracefully tries `service_listings` and falls back to the existing production `provider_services + providers` model. Production does **not** currently have `public.service_listings`, and the Supabase migration history is significantly drifted: production has multiple remote `20260424*` / `20260425*` migrations that are missing from the repo.

Minimum safe path: reconstruct/pull the missing remote migrations, regenerate schema/types from production, confirm RLS ownership assumptions, then apply a revised additive `service_listings` migration.

## Current model

Production has these canonical marketplace tables:

- `providers`
- `provider_services`
- `provider_sitter_settings`
- `provider_groomer_settings`
- `provider_trainer_settings`
- `availability_slots`
- `bookings`
- `reviews`

`provider_services` is enough for a basic service inventory:

- provider id
- service code
- base price
- currency
- duration
- active flag

But it is not enough for public marketplace presentation or SEO.

## Why `service_listings` is needed

`provider_services` should stay the canonical purchasable service inventory. It should not become a CMS/listing table.

`service_listings` is needed for:

- stable public slug
- public title
- short card description
- long detail description
- display category
- city/district/service area copy
- photos/images
- included features
- house rules
- listing state: draft/listed/paused/archived
- moderation state: pending/approved/rejected
- listed timestamp
- SEO title/description

Without this layer, `/usluge` and `/usluge/[slug]` must infer too much from service code/provider metadata, which is not scalable.

## Routes that benefit

- `/objavi-uslugu`: can create a draft listing without making it public immediately.
- `/moje-usluge`: can show provider-owned listings with draft/listed/paused states.
- `/usluge`: can read approved public listings with card-ready fields.
- `/usluge/[slug]`: can render real service details from stable slugs.

## Required UI and SEO fields

Minimum fields:

- `slug`
- `title`
- `short_description`
- `description`
- `category`
- `display_category`
- `city`
- `district`
- `service_area`
- `photos jsonb`
- `included_features jsonb`
- `house_rules jsonb`
- `availability_mode`
- `status`
- `moderation_status`
- `seo_title`
- `seo_description`
- `listed_at`
- `created_at`
- `updated_at`

## RLS policies needed

Public read policy:

- `anon` and `authenticated` can select only rows where:
  - `service_listings.status = 'listed'`
  - `service_listings.moderation_status = 'approved'`
  - related `providers.public_status = 'listed'`
  - related `providers.verified_status = 'verified'`

Provider owner policy:

- authenticated users can create/update/archive their own listing only when the listing provider belongs to them.
- Draft migration assumes `providers.profile_id = auth.uid()`.
- This must be explicitly confirmed because production `providers.profile_id` references `profiles.id`; it is safe only if `profiles.id` equals `auth.users.id`.

Admin/service role path:

- service role bypass remains available for admin moderation and backfill scripts.

## Indexes needed

- unique index on `slug`
- `provider_id`
- `provider_service_id`
- public read composite: `(status, moderation_status, city, category)`
- `updated_at desc`

## Backfill strategy

No backfill should run until migration apply is approved.

Recommended dry-run first:

1. Read current `providers + provider_services` where provider is listed/verified and service is active.
2. Generate deterministic slugs from service code, provider display name, and service id suffix.
3. Map service codes to Croatian titles/categories.
4. Set initial listing rows as:
   - `status = 'draft'` for unreviewed data, or
   - `status = 'listed'` + `moderation_status = 'approved'` only for known safe seed/demo rows.
5. Export the proposed backfill to JSON/CSV for review before inserting.

## Migration readiness

Current readiness: **NO-GO for apply**.

Reasons:

- `service_listings` does not exist in production.
- draft migration is local-only.
- remote migration history has missing migrations in repo.
- local RLS migration `20260423140000` targets legacy columns and must not be applied blindly.
- direct `pg_policies` inspection was blocked; dashboard/advisor review still needed.
- several app paths still use legacy bookings/availability/reviews columns.

## What happens if migration fails

Because the migration is additive, app runtime should continue working through fallback as long as partial objects do not poison schema cache.

Potential failure points:

- `providers.profile_id = auth.uid()` assumption wrong.
- trigger helper `touch_updated_at` missing or differently named.
- RLS policy syntax valid but too restrictive for provider owner writes.
- migration history drift causes Supabase CLI apply confusion.

## Rollback plan

Before backfill:

```sql
drop table if exists public.service_listings;
```

After backfill:

1. Export `service_listings` rows.
2. Disable write UI or keep read fallback active.
3. Drop policies/triggers/indexes/table in one rollback migration.
4. Redeploy app if needed, but current read-first fallback should not require rollback.

## What remains read-only until later

- production `service_listings` creation
- `/objavi-uslugu` real submit
- `/moje-usluge` write/status actions
- public listing publish/approval
- booking creation
- Stripe/payment flows
- email/SMS/notification sends

## Minimum safe apply path

1. Pull/reconstruct missing remote migrations into repo.
2. Regenerate DB types/schema snapshot from production.
3. Confirm `profiles.id == auth.users.id` ownership assumption.
4. Inspect `pg_policies`/Supabase advisor from dashboard or direct DB connection.
5. Revise draft migration if needed.
6. Apply migration to staging/branch/local linked environment first.
7. Run read smoke and RLS tests.
8. Apply to production only after explicit approval.
9. Run a dry-run backfill report.
10. Apply limited backfill only after separate approval.

## GO / NO-GO recommendation

- Read-first deployed slice: **GO**
- Applying `service_listings` migration now: **NO-GO**
- Preparing write-slice implementation plan: **GO**
- Implementing production writes now: **NO-GO**

## Exact approval sentence required before applying migration

> I approve applying the PetPark `service_listings` migration to production after schema drift is reconciled and RLS ownership is verified.

A separate approval should be required for any production backfill or write-enabled UI release.
