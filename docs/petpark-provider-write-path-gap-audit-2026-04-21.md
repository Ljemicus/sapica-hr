# PetPark provider write-path gap audit — 2026-04-21

## Scope
Audit of how provider onboarding/application flows relate to the canonical live provider model.

## Core finding
The current provider system uses **two separate models**:

### Application model
Used by onboarding and provider application workflow:
- `provider_applications`

### Live public provider model
Used by public pages, listings, sitemap, and public APIs:
- `providers`
- `provider_*_settings`
- `provider_services`
- `availability_slots`
- `reviews`

This separation is not inherently bad, but the bridge between them is not yet explicit enough in the codebase.

## Confirmed write-path behavior

### Onboarding flow writes to `provider_applications`
Observed in:
- `app/onboarding/provider/page.tsx`
- `app/onboarding/provider/provider-onboarding-form.tsx`
- `app/api/provider-application/route.ts`
- `lib/db/provider-applications.ts`

Behavior:
- draft save -> `provider_applications`
- submit -> `provider_applications.status = pending_verification`
- Stripe state also updates `provider_applications`

### Public/live read does NOT read from `provider_applications`
Observed in:
- `lib/db/provider-trainers.ts`
- `lib/db/provider-groomers.ts`
- `lib/db/provider-sitters.ts`
- `lib/search/provider-adapters.ts`
- `app/sitemap.ts`
- public provider API routes
- public provider pages

Behavior:
- reads exclusively from canonical live provider tables

## Important implication
Submitting onboarding data does **not automatically prove** that the live public provider tables are in sync.

That means the system currently depends on a bridge step between:
- application state
- live provider state

## What I found

### 1. Strong application workflow exists
The application layer is coherent:
- save draft
- submit application
- Stripe onboarding state
- status transitions

This part is okay.

### 2. Canonical public read layer exists
The public/provider adapters are also coherent.

This part is okay too.

### 3. The promotion/sync layer is not obvious enough
I did **not** find a clearly central, canonical service in the reviewed path that says:
- take `provider_applications`
- validate it
- upsert `providers`
- upsert `provider_*_settings`
- upsert `provider_services`
- declare provider listed/live

That is the main structural gap.

## One partial bridge that does exist
In `app/api/provider-application/route.ts` there is:
- `autoLinkProviderDirectoryListing(user.id, application, user.email)`

This suggests there is some linking/sync behavior after submit.
But from the currently reviewed path, it is not yet enough to treat the whole provider promotion lifecycle as clearly governed.

## Risk assessment

### Current production risk
Medium, not catastrophic.

Why not catastrophic:
- public pages currently work
- provider reads are good
- there is some directory-linking logic present

Why still risky:
- canonical promotion is not obvious/documented
- future changes may update `provider_applications` but forget to keep live provider tables aligned
- service/settings drift can happen silently

## Main structural gap
The system lacks one clearly documented and clearly named **canonical provider promotion/sync service**.

## What should exist
A single service/module responsible for:
1. reading a reviewed `provider_application`
2. mapping `provider_type` -> `provider_kind`
3. normalizing service names -> canonical service codes
4. creating/updating `providers`
5. creating/updating the correct `provider_*_settings` row
6. creating/updating `provider_services`
7. deciding `public_status`
8. being idempotent and safe to rerun

## Specific write-path concerns

### 1. Free-text / app-level service names vs canonical service codes
Onboarding form uses human-facing service labels like:
- `Čuvanje preko noći`
- `Dnevni boravak`
- `Šetnja pasa`
- `Njega i kupanje`
- `Trening i dresura`

Public adapters expect canonical internal codes like:
- `boarding`
- `daycare`
- `walking`
- `grooming_bath`
- `training_basic`

This translation layer must be centrally owned and validated.

### 2. Provider type naming mismatch
Onboarding/provider app uses values like:
- `čuvar`
- `groomer`
- `trener`
- `drugo`

Public provider model uses:
- `sitter`
- `groomer`
- `trainer`

Again, this requires canonical mapping in a single place.

### 3. Missing settings rows can be masked by read adapters
Read adapters fail soft.
That is good for resilience, but bad if it hides broken write promotion.

## Recommendation

### Immediate next engineering step
Create a dedicated service, for example:
- `lib/db/provider-promotion.ts`
or
- `lib/providers/sync-provider-application.ts`

Responsibilities:
- canonical mapping from application -> live provider model
- one path for create/update/sync
- idempotent behavior
- validation and diagnostics

### Immediate audit follow-up
Also create an integrity checker that flags:
- listed providers with missing settings rows
- listed providers with no active `provider_services`
- unknown service codes
- provider kind / settings table mismatch

## Final verdict
The provider write path is **not broken**, but it is **not explicit enough**.

The public side is healthier than the write side.

If you want the provider databases to be structurally trustworthy long-term, the next real step is:
- formalize and centralize the application -> live provider sync layer
- then add integrity diagnostics on top of it
