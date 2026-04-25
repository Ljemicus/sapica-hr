# Open Unknowns Resolution Log

Timestamp: 2026-04-24 10:40 UTC
Run by: Zippo

## U1 — provider_applications

Query:

```sql
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_name='provider_applications';
```

Result:

```text
0 rows
```

Decision: archive / treat as absent from canonical model.

## U2 — Canonical role source

Queries:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles' AND column_name='role';

SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='profile_roles';

SELECT count(*) FROM public.profile_roles;
SELECT * FROM public.profile_roles LIMIT 5;
```

Result:

```text
profiles.role:
0 rows

profile_roles columns:
profile_id | uuid
role | text
granted_at | timestamp with time zone
granted_by_profile_id | uuid

profile_roles count:
25

profile_roles sample:
('e0526b82-1825-4e78-8d77-d945782022ee', 'owner', '2026-04-10 06:01:25.167439+00', NULL)
('76e04347-9f66-480f-b8c2-c475f94cd522', 'owner', '2026-04-10 06:01:25.538515+00', NULL)
('3fd175e4-4dab-44da-bbb8-f7e7f44474dc', 'owner', '2026-04-10 06:01:25.741601+00', NULL)
('ff4ae391-91d8-4de6-a616-e344e8f65ef3', 'owner', '2026-04-10 06:01:25.939258+00', NULL)
('dccdca60-5862-4517-ab76-55c991b19baf', 'owner', '2026-04-10 06:01:26.136571+00', NULL)
```

Decision: **`profile_roles` je canonical role source.** `profiles.role` ne postoji live i od Cycle 7+ nijedan auth/guard path ne smije čitati role iz drugog izvora.

## U3 — Canonical Stripe session kolona

Query:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='bookings' AND column_name ~* 'stripe';
```

Result:

```text
0 rows
```

Additional live schema evidence (`public.bookings` columns):

```text
id
owner_profile_id
provider_id
pet_id
provider_kind
primary_service_code
starts_at
ends_at
status
payment_status
currency
subtotal_amount
platform_fee_amount
total_amount
owner_note
provider_note
cancellation_reason
accepted_at
completed_at
created_at
updated_at
```

Decision: **na `bookings` nema canonical Stripe session kolone.** `stripe_session_id` u app kodu je legacy/ghost assumption i Cycle 8 mora rezati booking-level reliance; Stripe truth treba biti iz `payments`/webhook flow, ne iz nepostojeće kolone na `bookings`.

## U4 — booking_requests retained?

Query:

```sql
SELECT count(*) AS rows, max(created_at) AS last_write FROM public.booking_requests;
```

Result:

```text
rows: 1
last_write: 2026-04-11 11:07:48.210249+00
```

Raw sample from live data dump:

```text
('f3c2dc09-b960-479f-85bf-2084a8e5757a', 'petra-rijeka', 'Petra Jurić', 'Rijeka', 'Trsat', 'Kućni posjeti', 'od 16 EUR / posjet', 'odgovara unutar 2 sata', 'visit', '2026-04-18', '2026-04-18', 'Zippo', 'pas', 'Test insert za Batch 07c cleanup checkpoint prije nastavka Batcha 8. Bez paymenta i bez potvrđene rezervacije.', 'pending', 'web_request_flow', '2026-04-11 11:07:48.210249+00', '2026-04-11 11:07:48.210249+00')
```

Decision: retain in Tier A for now. Nije ghost jer ima live row i recent-ish write, ali ostaje fail-closed dok ne dobije canonical ownership model.

## U5 — trainer surface retained?

Query:

```sql
SELECT 'trainers', count(*) FROM public.trainers
UNION ALL SELECT 'trainer_bookings', count(*) FROM public.trainer_bookings
UNION ALL SELECT 'trainer_reviews', count(*) FROM public.trainer_reviews
UNION ALL SELECT 'training_programs', count(*) FROM public.training_programs;
```

Result:

```text
trainers: 6
trainer_bookings: 0
trainer_reviews: 8
training_programs: 8
```

Raw live samples:

```text
trainers sample includes real seeded/listing rows such as Bruno Horvat (Zagreb), Martina Kovač (Zagreb), Davor Perić (Rijeka)
trainer_reviews sample count: 8
training_programs sample count: 8
trainer_bookings count: 0
```

Decision: retain trainer surface. Nije archival candidate; postoji real content surface even though bookings are still empty.

## U6 — Intentionally dynamic routes

Query:

```bash
grep -rEn "export const dynamic|dynamic =|revalidate =" app
```

Result:

```text
app/page.tsx: export const revalidate = 3600
app/pretraga/page.tsx: export const revalidate = 3600
app/blog/page.tsx: export const revalidate = 3600
app/blog/[slug]/page.tsx: export const dynamicParams = false
app/zajednica/[slug]/page.tsx: export const dynamicParams = false
app/hard-404/page.tsx: export const dynamic = 'force-static'

Intentional force-dynamic routes are dashboard/admin/api runtime surfaces:
- /dashboard/vlasnik
- /dashboard/vlasnik/onboarding
- /dashboard/rescue
- /dashboard/adoption/new
- /dashboard/adoption
- /dashboard/sitter
- /dashboard/breeder/*
- /api/payments/webhook
- /api/admin/*
- /api/appeals/donation-click
- /api/cron/*
```

Per-route justification:

- `/` — query-backed homepage, ISR via `revalidate=3600`; acceptable static-ish public route.
- `/pretraga` — ISR via `revalidate=3600`; acceptable public route.
- `/blog` — ISR via `revalidate=3600`; acceptable public route.
- `/blog/[slug]` — static params generated; acceptable SEO route.
- `/zajednica/[slug]` — static params generated; acceptable if retained as blog/community article alias.
- dashboard/admin/api routes — intentionally dynamic due to auth/session/webhook/cron behavior.
  Decision: no blocker found among core SEO routes, but `/zajednica/[slug]` remains a public article alias that should be reconciled later against the social/community containment strategy.

## U7 — Ghost-reading sitemap branches

Source: `app/sitemap.ts`
Result:

```text
Ghost-read branches still present:
- adoption_listings  -> app/sitemap.ts (Promise.all branch + adoptionEntries)
- rescue_organizations -> app/sitemap.ts (Promise.all branch + rescueOrgEntries)
- rescue_appeals -> app/sitemap.ts (Promise.all branch + rescueAppealEntries)
- blog_articles -> app/sitemap.ts via getArticles()
- lost_pets -> app/sitemap.ts via getLostPets()
- veterinarians -> static route only, no table read in sitemap currently
- dog_friendly_places -> static route only, no table read in sitemap currently
Already removed in Cycle 4:
- forum_topics
```

Decision: remove/contain non-Tier-A sitemap branches in later canonical cleanup. `blog_articles` and `lost_pets` may remain if explicitly retained; adoption/rescue branches are current ghost-read candidates.

## U8 — Homepage counters inventory

Source files:

- `app/page.tsx`
- `components/home/homepage-content.tsx`
- `app/layout.tsx`

Inventory:

```text
Featured sitter review counts -> QUERY_BACKED
  Source: app/page.tsx maps getSitters() rows to `reviews: s.review_count`

Featured sitter verified badge -> QUERY_BACKED
  Source: app/page.tsx maps `verified: s.verified`

Featured sitters section length -> QUERY_BACKED
  Source: app/page.tsx uses topSitters from DB

City cards (Zagreb, Rijeka, Split, Osijek, Pula, Zadar) -> STATIC_HARDCODED
  Source: const `cities` in app/page.tsx

Homepage service list / JSON-LD items -> STATIC_HARDCODED
  Source: const `homepageServices` in app/page.tsx

Trust strip items -> STATIC_HARDCODED copy
  Source: components/home/homepage-content.tsx translation content
```

Decision: homepage currently mixes real featured-provider query data with static editorial counters/city inventory. No stale cached numeric KPI block found in these files, but city/service inventory is static and should be replaced by canonical query-backed inventory in later cycles.

## U9 — Calendar bookings schema collision

Source:

- `app/api/calendar/bookings/route.ts`
- `lib/calendar/bookings.ts`
- `docs/recovery/live-schema/public-schema-post-cycle3.sql`

Result:

```text
Calendar subsystem still targets `public.bookings` with ghost columns including:
provider_type
client_name
client_email
client_phone
title
description
start_time
end_time
price
location_type
location_address
internal_notes
client_notes
source
created_by
```

Live canonical `public.bookings` does not have those columns. Live booking truth remains:

```text
owner_profile_id
provider_id
pet_id
provider_kind
primary_service_code
starts_at
ends_at
subtotal_amount
platform_fee_amount
total_amount
owner_note
provider_note
status
payment_status
```

Decision: calendar booking subsystem is a confirmed ghost-model collision against canonical `public.bookings`. This blocks strict Cycle 8 acceptance until the subsystem is either fail-closed, rewritten onto canonical bookings, or moved onto a separate dedicated model/table. See `docs/recovery/CYCLE8_CALENDAR_SCHEMA_CONFLICT.md`.
