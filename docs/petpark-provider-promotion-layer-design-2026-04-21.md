# PetPark provider promotion layer design — 2026-04-21

## Goal
Introduce one canonical, explicit layer that promotes provider onboarding/application data into the live public provider model.

## Problem this solves
Today the app has:
- application workflow in `provider_applications`
- public/live provider data in `providers`, `provider_*_settings`, `provider_services`

The bridge between those states is not explicit enough.

## Design goal
Create one service that becomes the single authority for:
- provider type normalization
- service code normalization
- provider row creation/update
- settings row creation/update
- provider services creation/update
- public/listed state decisions

## Proposed file
- `lib/db/provider-promotion.ts`

## Public API of the service

### 1. `promoteProviderApplication(applicationId: string, options?)`
Purpose:
- read a provider application
- normalize it
- upsert canonical live provider rows
- return diagnostics/result

Suggested return shape:
```ts
{
  ok: boolean;
  providerId?: string;
  providerKind?: 'sitter' | 'groomer' | 'trainer' | 'other';
  warnings: string[];
  errors: string[];
}
```

### 2. `syncProviderApplicationToLiveModel(application: ProviderApplication, userProfile?)`
Purpose:
- lower-level pure sync routine used by `promoteProviderApplication`

### 3. `normalizeProviderApplication(input)`
Purpose:
- centralize mapping logic before any DB writes

## Canonical mappings

### Provider type mapping
Application values -> canonical provider kind:
- `čuvar` -> `sitter`
- `trener` -> `trainer`
- `groomer` -> `groomer`
- `drugo` -> `other`

### Service label mapping
Human-facing application labels -> canonical service codes.

Initial mapping proposal:
- `Čuvanje preko noći` -> `boarding`
- `Dnevni boravak` -> `daycare`
- `Šetnja pasa` -> `walking`
- `Čuvanje u domu vlasnika` -> `house_sitting`
- `Njega i kupanje` -> kind-specific grooming code(s), default `grooming_bath`
- `Trening i dresura` -> kind-specific training code(s), default `training_basic`

This must be defined in one place only.

## Provider row ownership

### `providers`
Should own:
- `profile_id`
- `provider_kind`
- `display_name`
- `bio`
- `city`
- `address`
- `phone`
- `email`
- `experience_years`
- `verified_status`
- `public_status`
- maybe response defaults if needed

### `provider_sitter_settings`
Should own sitter-specific fields like:
- services array if still useful
- photos
- superhost

### `provider_groomer_settings`
Should own groomer-specific fields like:
- specialization
- mobile_service
- working_hours_json

### `provider_trainer_settings`
Should own trainer-specific fields like:
- specializations
- certified
- training_location

### `provider_services`
Should own canonical public service inventory:
- service_code
- base_price
- duration_minutes
- is_active

## Idempotency rule
Promotion must be safe to rerun.

Meaning:
- if provider row already exists for a profile + provider kind, update it
- settings row is upserted
- provider services are replaced or synchronized deterministically
- reruns should not create duplicates

## Publish/listing rule
Promotion should not automatically mean public listing unless explicitly intended.

Suggested rule:
- sync can create/update provider rows in a safe non-public state
- `public_status = listed` only when review/approval logic says so

This keeps moderation and public visibility separated.

## Diagnostics and warnings
The promotion service should emit warnings for:
- unknown provider type
- unknown service labels
- missing city/display_name
- missing kind-specific settings data
- unsupported `drugo` provider type

## Where it should be called
Likely call sites:
- after successful admin approval of provider application
- possibly after certain onboarding milestones, but only if moderation rules allow it

Best initial integration point:
- wherever provider applications transition from pending/reviewed into active/live state

## Not recommended
- do not spread mapping logic across route handlers
- do not let public adapters guess application labels
- do not directly write provider rows from many ad hoc endpoints

## Recommended next implementation steps
1. add `lib/db/provider-promotion.ts`
2. define provider type mapping constants
3. define canonical service label -> service code mapping constants
4. implement provider row upsert
5. implement kind-specific settings upsert
6. implement provider services sync
7. add structured warnings/errors
8. integrate at provider approval/promotion point

## Success criteria
The provider model is structurally trustworthy when:
- all onboarding/application data enters the live model through one canonical service
- all provider type/service mappings live in one place
- rerunning promotion is safe
- listed providers cannot exist in half-synced state without diagnostics
