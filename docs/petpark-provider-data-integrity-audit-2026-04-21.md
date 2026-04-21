# PetPark provider data integrity audit — 2026-04-21

## Scope
Audit of the current canonical provider data model for:
- sitters
- groomers
- trainers

Focus areas:
1. read model consistency
2. adapter consistency
3. schema relationship assumptions
4. write-path risk
5. remaining legacy risk

## Executive summary
The current **public read path** for trainer / groomer / sitter appears structurally sound enough for production.

The biggest remaining risk is not the public pages themselves, but **write-path drift** and **mixed parallel models** still present in the broader codebase.

## What looks good

### 1. Canonical public read model is now consistent
Current public/provider adapters use the same core tables:
- `providers`
- `profiles`
- `provider_trainer_settings`
- `provider_groomer_settings`
- `provider_sitter_settings`
- `provider_services`
- `availability_slots`
- `reviews`

This is the right direction and matches the production fixes we shipped.

### 2. Public pages and public APIs are aligned with provider adapters
Observed usage confirms alignment:
- sitemap uses provider-model read path
- `/trener/[id]`, `/groomer/[id]`, `/sitter/[id]` read through provider adapters
- public profile APIs read through provider adapters
- unified search/listing path reads through provider model adapters

This is important because it reduces the chance of public page vs API divergence.

### 3. Listing/read restrictions are explicit
Provider adapters consistently apply:
- `provider_kind = sitter|groomer|trainer`
- `public_status = listed`

That is a healthy production guardrail for public visibility.

## Adapter-specific findings

### Trainers
`lib/db/provider-trainers.ts`

Strengths:
- uses canonical provider + profile + settings + services model
- programs derived from `provider_services`
- reviews derived from `reviews`
- availability derived from `availability_slots`
- public listing filtered by `public_status = listed`

Risks / notes:
- trainer programs are reconstructed from service codes, not dedicated structured program records
- `certificates` currently become a synthetic `['Verified trainer']` array when `certified` is true
- this is fine for public rendering, but it is not a rich canonical training-program domain model

Verdict:
- structurally acceptable for current public product
- not yet ideal if trainer programs become a deeper product surface

### Groomers
`lib/db/provider-groomers.ts`

Strengths:
- canonical provider-model joins are clean
- services and prices derive from `provider_services`
- reviews and availability use shared canonical tables
- settings table is used for specialization and working-hours-like data

Risks / notes:
- specialization mapping is narrow and code-driven
- unknown specialization values silently collapse to `'oba'`
- acceptable for resilience, but this can hide dirty source data

Verdict:
- good public read adapter
- should eventually emit diagnostics or stricter mapping checks in admin/internal audit tooling

### Sitters
`lib/db/provider-sitters.ts`

Strengths:
- canonical provider + profile + sitter settings + services model
- reviews and availability from shared canonical tables
- explicit mapping for service codes

Risks / notes:
- sitter adapter is more limited than trainer/groomer listing adapters because the main public by-id path is the important one here
- geo fields are currently null in the mapped public object
- acceptable now, but means the provider model is not yet fully exploited for location-rich sitter features

Verdict:
- production-safe for current public profile use
- likely needs extension if sitter map/location UX becomes more advanced

## Schema integrity concerns still worth watching

### 1. Provider settings row assumptions
Public mapping assumes that each listed provider of a given kind has the expected settings row:
- trainer -> `provider_trainer_settings`
- groomer -> `provider_groomer_settings`
- sitter -> `provider_sitter_settings`

Current adapters fail soft when settings rows are missing.
That keeps public pages alive, but it can mask incomplete provider records.

Recommendation:
- add an internal integrity audit script/query later that flags listed providers missing expected settings rows

### 2. Provider services are doing heavy lifting
A lot of business meaning is reconstructed from `provider_services.service_code`.
That is practical, but it means:
- service_code taxonomy must stay stable
- unknown codes may silently disappear from public UX

Recommendation:
- define canonical service code registries in docs/code
- validate service_code values during write flows

### 3. Mixed legacy model still exists in repo history and some code areas
We still have clear signs of the old world in the codebase/history:
- legacy trainer schema migration file exists locally
- old trainer/groomer/sitter concepts still exist in other repo zones and naming

Recommendation:
- treat provider model as canonical and explicitly mark old schema artifacts as legacy
- avoid introducing new trainer/groomer/sitter feature work on legacy tables

## Write-path risk
This is the main unresolved structural concern.

### Problem
We proved the public read path.
We have **not yet fully proved** that all onboarding/admin/dashboard/provider-edit flows write complete and correct data into the canonical provider model every time.

### Evidence of risk
Search results show provider-related write flows in areas like:
- `app/onboarding/provider/*`
- `lib/db/provider-applications.ts`
- `app/api/provider-connect/route.ts`
- admin/founder/provider KPI flows

But the public provider adapters read from:
- `providers`
- `provider_*_settings`
- `provider_services`
- `availability_slots`
- `reviews`

There is still room for drift if application/onboarding state and live public provider state are not synchronized cleanly.

## Real conclusion

### For current production public behavior
- trainer / groomer / sitter data is good enough and structurally coherent
- I do **not** see an immediate public-facing database crisis right now

### For long-term confidence
- the missing piece is a dedicated **provider write-path audit** and a **data integrity check for listed providers**

## Recommended next actions
1. create an internal integrity check for listed providers missing required settings rows
2. audit onboarding/provider application -> canonical provider tables write path
3. document canonical provider model and explicitly mark legacy trainer/groomer/sitter paths as deprecated
4. eventually add admin diagnostics for unknown service codes / missing settings rows / partial provider state

## Final verdict
Current provider databases are **good enough for live production read behavior** and substantially better than before the migration.

They are not yet "perfectly governed" structurally.
The real next job is not another public route fix, but a write-path and integrity-audit pass.
