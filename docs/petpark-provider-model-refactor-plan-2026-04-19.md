# PetPark provider model refactor plan — 2026-04-19

## Goal
Replace the legacy provider/profile data reads (`trainers`, `groomers`, `sitter_profiles`, related review/availability/program tables) with the actual live Supabase provider model:
- `providers`
- `profiles`
- `provider_trainer_settings`
- `provider_groomer_settings`
- `provider_sitter_settings`
- `provider_services`
- `availability_slots`
- `reviews`

Primary first target:
- `/trener/[id]`

Then expand to:
- `/groomer/[id]`
- `/sitter/[id]`
- search/listing layers (`/pretraga`, `/dresura`, `/njega`, unified provider search)

---

## What we now know for sure

### Legacy model expected by app code
Current app code still expects these tables/shapes in many places:
- `trainers`
- `training_programs`
- `trainer_reviews`
- `trainer_availability`
- `groomers`
- `groomer_reviews`
- `sitter_profiles`

### Actual live Supabase model
Schema cache confirms these exist instead:
- `providers`
- `profiles`
- `provider_trainer_settings`
- `provider_groomer_settings`
- `provider_sitter_settings`
- `provider_services`
- `availability_slots`
- `reviews`

### Critical conclusion
The remaining profile data issue is a **schema mismatch**, not an SSR/runtime bug.

The SSR bug/workaround work already proved:
- `/trener/[id]` route shell can render correctly
- `TrainerProfile` itself is not the core problem
- the real blocker is that the route still pulls data from a schema that no longer exists in the current Supabase environment

---

## Provider model samples already confirmed

### providers
Fields observed:
- `id`
- `profile_id`
- `provider_kind`
- `display_name`
- `bio`
- `city`
- `address`
- `lat`
- `lng`
- `phone`
- `email`
- `experience_years`
- `verified_status`
- `public_status`
- `response_time_label`
- `rating_avg`
- `review_count`
- `stripe_account_id`
- `stripe_onboarding_complete`
- `instant_booking_enabled`

Trainer sample observed:
- `provider_kind = "trainer"`
- `display_name = "Maja Trainer"`
- `verified_status = "verified"`
- `public_status = "listed"`
- `rating_avg = 4.9`
- `review_count = 8`

### profiles
Fields observed:
- `id`
- `email`
- `display_name`
- `avatar_url`
- `phone`
- `city`
- `locale`
- `status`
- `onboarding_state`

### provider_trainer_settings
Fields observed:
- `provider_id`
- `specializations`
- `certified`
- `training_location`

Sample observed:
- `specializations = ["obedience", "puppies"]`
- `certified = true`
- `training_location = "Outdoor & at-home"`

### provider_services
Fields observed:
- `id`
- `provider_id`
- `service_code`
- `base_price`
- `currency`
- `duration_minutes`
- `is_active`

Sample observed:
- `service_code = "training_basic"`
- `base_price = 35`

### availability_slots
Fields observed:
- `provider_id`
- `service_code`
- `starts_at`
- `ends_at`
- `status`

Sample observed:
- `status = "available"`

### reviews
Fields observed:
- `provider_id`
- `rating`
- `comment`
- `status`
- `reviewer_profile_id`
- `reviewee_profile_id`
- `booking_id`

---

## First deliverable: trainer adapter

Create a new provider-model-backed trainer adapter that returns the UI shape currently expected by trainer pages.

### Proposed new files
- `lib/db/provider-trainers.ts`
- optionally `lib/db/provider-trainer-adapter.ts`
- optionally `lib/db/provider-model-types.ts`

### New functions to build
1. `getProviderTrainerById(providerId: string)`
2. `getProviderTrainerPrograms(providerId: string)`
3. `getProviderTrainerReviews(providerId: string)`
4. `getProviderTrainerAvailableDates(providerId: string)`
5. optional list helper: `getProviderTrainers(filters)`

### Adapter output shape target
Need to produce a shape compatible with current trainer UI expectations:

#### Trainer page expects `Trainer`
Current fields used by UI:
- `id`
- `name`
- `city`
- `specializations`
- `price_per_hour`
- `certificates`
- `rating`
- `review_count`
- `bio`
- `certified`
- `phone`
- `email`
- `address`

#### Mapping proposal
- `providers.id` → `Trainer.id`
- `providers.display_name` or `profiles.display_name` → `Trainer.name`
- `providers.city` or `profiles.city` → `Trainer.city`
- `providers.bio` → `Trainer.bio`
- `providers.phone` or `profiles.phone` → `Trainer.phone`
- `providers.email` or `profiles.email` → `Trainer.email`
- `providers.address` → `Trainer.address`
- `providers.rating_avg` → `Trainer.rating`
- `providers.review_count` → `Trainer.review_count`
- `provider_trainer_settings.certified` → `Trainer.certified`
- `provider_trainer_settings.specializations` → mapped `TrainingType[]`
- `provider_services.base_price` → lowest active trainer service price as `price_per_hour`
- certificates: currently no confirmed source in provider model, likely temporary `[]`

#### Specialization mapping required
Current UI expects legacy training types:
- `osnovna`
- `napredna`
- `agility`
- `ponasanje`
- `stenci`

Observed new values include:
- `obedience`
- `puppies`

Need a deterministic mapping table, e.g.:
- `obedience` → `osnovna`
- `puppies` → `stenci`
- plus discover/match any additional values from real data

---

## Programs strategy
The old UI expects `training_programs`, but the new schema currently exposes `provider_services`, not a dedicated training-programs table.

### Likely approach
Map active trainer services into temporary pseudo-program rows.

Proposed mapping:
- `provider_services.id` → `TrainingProgram.id`
- `provider_services.provider_id` → `trainer_id`
- `provider_services.service_code` → program/type-derived label
- `provider_services.base_price` → `price`
- `provider_services.duration_minutes` → used for description or session-derived placeholder
- `description` → generated copy until richer provider program content exists

Need a `service_code -> UI label/type` mapping, e.g.:
- `training_basic` → `Osnovna poslušnost`, type `osnovna`
- additional codes to be discovered and mapped

---

## Reviews strategy
The old UI expects trainer reviews with:
- `author_name`
- `author_initial`
- `rating`
- `comment`
- `created_at`

The new `reviews` table appears to support this but may not include author display fields inline.

### Likely approach
- fetch `reviews` filtered by `provider_id`
- join reviewer details from `profiles` using `reviewer_profile_id`
- map:
  - `profiles.display_name` → `author_name`
  - first character → `author_initial`
  - `reviews.rating`
  - `reviews.comment`
  - `reviews.created_at`
- keep only `status = 'published'`

---

## Availability strategy
The old trainer UI expects a set of available dates.

### Likely approach
- fetch `availability_slots` for `provider_id`
- keep rows with `status = 'available'`
- derive local date key from `starts_at`
- return deduplicated date strings for calendar component

---

## Trust/indexability implications
Current trust/indexability helpers likely assume legacy shapes.

Need to audit whether trainer trust can continue with adapter output or whether helper logic must be updated.

Minimum acceptable first step:
- make adapter output sufficient for current trust helper inputs
- do not widen trust logic until trainer route is stable again

---

## Route integration plan for `/trener/[id]`

### Phase 1: safe parallel path
1. add new provider-model trainer helper(s)
2. keep existing legacy helper untouched
3. add a temporary branch in trainer page data path to use the provider-model helper first
4. fall back only if necessary during transition

### Phase 2: trainer page switch
1. replace `getTrainerPageData` internals to use provider-model helper
2. keep SSR shell workaround until full confidence is restored
3. verify local build and route output
4. test API route `/api/public/trainers/[id]`
5. if payload works, verify client hydration

### Phase 3: reduce workaround dependence
Once provider-model hydration is confirmed:
- decide whether SSR shell workaround can stay as acceptable architecture
- or whether the route can safely render real data again without the old failure mode

---

## Search/listing follow-up
After trainer profile works on provider model, apply same pattern to:
- `/dresura`
- unified provider search (`lib/search/providers.ts`)
- `/groomer/[id]`
- `/sitter/[id]`

This likely requires a shared adapter layer for unified provider cards.

---

## Risks
- trainer UI currently expects a richer legacy data shape than the new schema may expose directly
- service/program semantics may not be 1:1
- specialization/service code mapping may need several explicit translation tables
- trust/indexability heuristics may need adjustment once adapter output is in place
- SSR shell workaround should not be removed until real route behavior is proven with raw HTML and hydrated client data

---

## Acceptance criteria for trainer refactor
A trainer refactor is only considered successful when all of these are true:
1. `/api/public/trainers/[id]` returns 200 with real trainer payload from provider model
2. `/trener/[id]` renders without broken UI
3. raw HTML contains `<h1>`
4. raw HTML contains breadcrumb nav
5. client hydration replaces shell fallback with real trainer content
6. `npm run build` passes

---

## Immediate next step
Implement `getProviderTrainerById(providerId)` and supporting mappings first.
