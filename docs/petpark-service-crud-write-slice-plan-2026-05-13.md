# PetPark Service CRUD Write Slice Plan

Date: 2026-05-13
Status: plan only — no writes implemented
Prerequisites: live read-first slice deployed, schema drift audit complete, migration decision accepted later

## Current decision

Do not implement production writes yet.

Reason: production schema is canonical-provider-shaped, but repo migrations are drifted and `service_listings` does not exist in production. Write-enabled Service CRUD should wait until the `service_listings` migration is approved and applied safely.

## Goal

Connect marketplace UI to real data safely:

- `/objavi-uslugu` creates a provider service/listing draft.
- `/moje-usluge` shows real provider services/listings for the logged-in provider.
- `/usluge` shows public listed services/listings.
- `/usluge/[slug]` shows real listing detail.

No bookings, payments, Stripe, emails, SMS, or notifications in this slice.

## Data model mapping

### Provider ownership

Every write requires authenticated ownership:

- user session → `auth.uid()`
- `profiles.id` should match `auth.uid()`
- provider row: `providers.profile_id = auth.uid()`
- listing row: `service_listings.provider_id = providers.id`

Before implementation, confirm the `profiles.id == auth.users.id` invariant in production.

### `/objavi-uslugu` form → database

Provider identity:

- provider kind → `providers.provider_kind`
- display name → `providers.display_name`
- city/address → `providers.city`, `providers.address`
- bio/experience → `providers.bio`, `providers.experience_years`

Service inventory:

- service type/category → `provider_services.service_code`
- price → `provider_services.base_price`
- currency → `provider_services.currency` default `EUR`
- duration → `provider_services.duration_minutes`
- active flag → `provider_services.is_active`

Listing content:

- title → `service_listings.title`
- slug → `service_listings.slug`
- short description → `service_listings.short_description`
- long description → `service_listings.description`
- display category → `service_listings.display_category`
- city/district/service area → `service_listings.city`, `district`, `service_area`
- photos → `service_listings.photos`
- included features → `service_listings.included_features`
- house rules → `service_listings.house_rules`
- availability mode → `service_listings.availability_mode`
- SEO title/description → `service_listings.seo_title`, `seo_description`

### Status transitions

Recommended initial state machine:

1. `draft` + `pending`
   - created by provider
   - visible only to owner/admin
2. `draft` + `pending`
   - provider edits freely
3. `listed` + `pending`
   - provider requests publish, still hidden publicly
4. `listed` + `approved`
   - public marketplace visible
5. `paused` + `approved`
   - owner pauses, hidden from public search or marked unavailable depending product choice
6. `archived`
   - soft removal; no destructive delete in first write slice

Do not allow provider to self-set `moderation_status='approved'`.

## API/server actions

Prefer server actions or route handlers with server-side Supabase session client.

### `createDraftListing(input)`

Responsibilities:

1. Require auth session.
2. Find or create provider row for current profile.
3. Insert/ensure `provider_services` row.
4. Insert `service_listings` row with `status='draft'`, `moderation_status='pending'`.
5. Return draft id/slug.

### `updateDraftListing(id, input)`

Responsibilities:

1. Require auth.
2. Verify listing ownership via provider relation.
3. Allow editing only when status is `draft` or `paused`.
4. Validate all fields.
5. Update listing and possibly provider service price/duration.

### `requestPublishListing(id)`

Responsibilities:

1. Require ownership.
2. Validate minimum public fields.
3. Set `status='listed'`, keep `moderation_status='pending'`.
4. Optional: set `listed_at` only after approval, not at request time.

### `pauseListing(id)`

Responsibilities:

1. Require ownership.
2. Set `status='paused'`.
3. Do not delete row.

### Admin approval later, not in this slice

Admin moderation is out of scope for this first write slice unless a minimal internal-only tool is approved separately.

## UI integration

### `/objavi-uslugu`

- Keep current v6 UI.
- Add submit handler behind authenticated session.
- If logged out, redirect to `/prijava?redirect=/objavi-uslugu`.
- Save as draft first; never publish publicly immediately.
- Show success state: “Usluga je spremljena kao nacrt.”
- Link to `/moje-usluge`.

### `/moje-usluge`

- Read current provider’s listings.
- Show cards by status: draft, pending review, listed, paused, archived.
- Actions for first slice:
  - edit draft
  - request publish
  - pause listed listing
- No destructive delete.

### `/usluge`

- Already read-first wired.
- After migration/backfill, prefer `service_listings` rows.
- Keep fallback to provider services until data quality is proven.

### `/usluge/[slug]`

- Already attempts real slug lookup.
- After migration/backfill, detail page uses `service_listings` as canonical source.
- Preserve static fallback slug until enough real listings exist.

## Validation

Required fields:

- title: 6–80 chars
- short description: 20–180 chars
- description: 80–2000 chars
- service code/category: allowlist only
- base price: number, `>= 0`, max reasonable cap
- currency: `EUR`
- city: required
- slug: generated, unique, reserved-route safe
- photos: array of safe storage URLs only
- included features/house rules: string array length limits

Ownership validation:

- server-side check that `provider.profile_id = auth.uid()`.
- never trust provider id from client without ownership check.

Public privacy validation:

- no private phone/email surfaced publicly unless product explicitly enables it.
- address should be coarse unless provider opted into exact display.

## Test plan

### Unit/validation

- valid draft input passes
- missing title fails
- negative price fails
- invalid service category fails
- duplicate slug gets suffix
- provider id spoofing fails

### Integration/server action tests

- unauthenticated create redirects/fails
- authenticated owner can create draft
- non-owner cannot update listing
- owner can pause own listing
- provider cannot set `moderation_status='approved'`

### RLS tests

Run with anon/authenticated/service-role roles if available:

- anon can read only approved/listed rows
- anon cannot read draft/pending rows
- provider can read/write own rows
- provider cannot read/write another provider’s private rows
- service role can backfill/moderate

### Playwright

- `/objavi-uslugu` logged-out redirect or login CTA
- authenticated draft creation happy path with test user only
- `/moje-usluge` shows draft
- publish request changes visible status
- public `/usluge` does not show pending listing
- public `/usluge` shows approved/listed fixture

## Rollback strategy

Before production write release:

- keep read-first fallback active
- feature flag write actions if practical
- deploy UI with writes disabled by env flag first

If write release fails:

1. Disable write feature flag.
2. Keep public read fallback active.
3. Do not delete rows.
4. If needed, pause affected listings with service role after export.
5. Roll back app commit if runtime errors affect public pages.

If migration/backfill fails:

1. Stop app write rollout.
2. Export partial rows.
3. Drop or repair `service_listings` only if no dependent data is live.
4. Leave `provider_services` intact.

## Implementation order after approval

1. Reconcile migrations and apply approved `service_listings` migration.
2. Generate DB types.
3. Add validation schema (`zod`) for service listing draft.
4. Add server read/write helpers with ownership checks.
5. Wire `/objavi-uslugu` create draft.
6. Wire `/moje-usluge` list + status actions.
7. Add tests.
8. Deploy behind safe fallback.
9. Run live smoke with test-only data.
10. Only then consider backfill/listing approval workflow.

## Explicit approvals needed

Before migration:

> I approve applying the PetPark `service_listings` migration to production after schema drift is reconciled and RLS ownership is verified.

Before production write UI:

> I approve enabling PetPark Service CRUD writes for authenticated providers, excluding bookings, payments, and notifications.

Before backfill:

> I approve the reviewed PetPark service listing backfill into production.
