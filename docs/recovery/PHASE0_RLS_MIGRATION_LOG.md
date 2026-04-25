# Phase 0 RLS Migration Log

## 2026-04-24 — Cycle 2 preflight reconciliation

### Remote vs local migration history

`supabase migration list` output:

| Local             | Remote           | Time (UTC)          |
| ----------------- | ---------------- | ------------------- |
| _missing locally_ | `20260411124500` | 2026-04-11 12:45:00 |
| `20260421073000`  | `20260421073000` | 2026-04-21 07:30:00 |
| `20260423140000`  | `20260423140000` | 2026-04-23 14:00:00 |
| `20260423140001`  | `20260423140001` | 2026-04-23 14:00:01 |

### Finding

There is a migration-history mismatch between the linked remote database and the local `supabase/migrations` directory.

The remote project contains migration version `20260411124500`, but there is no corresponding local migration file.

`supabase db pull cycle2_live_snapshot --schema public --yes` fails with:

> The remote database's migration history does not match local files in supabase/migrations directory.
> Make sure your local git repo is up-to-date. If the error persists, try repairing the migration history table:
> `supabase migration repair --status reverted 20260411124500`

### Interpretation

Per playbook rules, this is a repo-vs-live conflict and must be reconciled before continuing Cycle 2 as a normal migration/apply flow.

We must not blindly add or apply new RLS migrations until this conflict is explained.

### Safe next moves

1. Identify what `20260411124500` was:
   - locate the original migration file from git history / other branch / backup if it exists
   - determine whether it was intentionally reverted or accidentally lost locally
2. Inspect live schema directly for the affected trainer / booking tables and helper expectations.
3. Only after reconciliation, decide whether to:
   - restore the missing migration file locally, or
   - explicitly repair remote migration history as reverted if that matches reality.

### Local schema notes already confirmed

- Local repo contains:
  - `20260421073000_create_trainer_feature_tables.sql`
  - `20260423140000_rls_least_privilege_hardening.sql`
  - `20260423140001_fix_rls_security_gaps.sql`
- Local trainer RLS currently uses direct ownership checks via `public.trainers.user_id = auth.uid()`.
- The playbook’s helper-based target state (`is_admin()`, `owns_provider()`) is not present in current local SQL.

### Live schema safety pass (read-only)

A read-only remote schema dump was successfully taken to:

- `docs/recovery/live-schema/public-schema-2026-04-24.sql`

Confirmed from live schema:

- helper functions already exist live:
  - `public.is_admin(uuid)`
  - `public.owns_provider(uuid, uuid)`
- current live booking/provider model is provider-based, not old trainer-owner-only logic:
  - `public.providers` exists with `id` and `profile_id`
  - `public.booking_requests` exists live
  - `public.bookings` exists live
- live RLS is already enabled for modern provider tables such as `providers`, `bookings`, `availability_slots`, `provider_trainer_settings`, etc.

Critical live finding:

- `public.trainer_bookings` exists live
- but there is **no `ENABLE ROW LEVEL SECURITY` statement** for `trainer_bookings` in the live dump
- and there are **no live `CREATE POLICY` entries** for `trainer_bookings`
- `public.booking_requests` also exists live with no visible RLS enable/policy block in the dump

This means the live schema truth is consistent with the playbook’s concern: trainer/booking-related RLS is still incomplete or inconsistent live even though helper functions already exist.

### Safety-pass conclusion

The remote-only migration `20260411124500` was not found anywhere in local git history, which makes it look like an orphaned remote migration record rather than an essential local source-of-truth file.

Because the live dump succeeded and exposed the real schema state directly, we now have enough evidence to say:

- repairing remote migration history for `20260411124500` to `reverted` is **likely safe**,
- **but only as migration-history reconciliation**, not as proof that Cycle 2 itself is finished.

After that repair, the next safe move would be:

1. re-run pull/list to confirm reconciliation is clean
2. author the Cycle 2 migration against the **live schema truth**
3. explicitly enable/fix RLS on `trainer_bookings` and any other uncovered booking tables using the helper-based provider model
4. verify with staging/live read-only checks before any merge conclusion

### Status

Cycle 2 is still not green yet.
It is now in a stronger reconciliation state with live-schema evidence, and repair of `20260411124500` has now been completed (`reverted`).

### Post-repair apply update

After repairing migration history, live migration history reconciled cleanly to:

- `20260421073000`
- `20260423140000`
- `20260423140001`

A new migration was authored and applied:

- `supabase/migrations/20260424112000_cycle2_trainer_booking_rls_alignment.sql`

During the first apply attempt, a live-schema conflict was caught immediately:

- attempted policy logic referenced `public.providers.slug`
- live `public.providers` has **no `slug` column**

Per playbook rule, this was treated as a real repo-vs-live conflict and corrected to match live schema instead of being worked around silently.

### What was applied live

Verified in:

- `docs/recovery/live-schema/public-schema-post-cycle2.sql`

Applied and confirmed:

- `public.booking_requests`
  - `ENABLE ROW LEVEL SECURITY`
  - `booking_requests_insert_anon_or_admin`
  - `booking_requests_select_admin_only`
  - `booking_requests_update_admin_only`
- `public.trainer_bookings`
  - `ENABLE ROW LEVEL SECURITY`
  - `trainer_bookings_insert_self_or_admin`
  - `trainer_bookings_select_participant_or_admin`
  - `trainer_bookings_update_provider_or_admin`

### Draft vs live differences documented

- Live helper functions already existed and were preserved:
  - `public.is_admin(uuid)`
  - `public.owns_provider(uuid, uuid)`
- `booking_requests` does **not** have a live `provider_id` foreign key or any safe ownership join column.
- `booking_requests` only contains denormalized provider snapshot text (`provider_slug`, `provider_name`, etc.).
- Because `public.providers.slug` does not exist live, provider-self-service policy logic for `booking_requests` could not be justified.
- Final posture for `booking_requests` was therefore set to **fail-closed**:
  - client request creation allowed
  - read/update restricted to admin only
- `trainer_bookings` was aligned to the helper/provider model while preserving compatibility with current live columns (`trainer_id`, `user_id`).

### Follow-up completion update

A second follow-up migration was authored and applied:

- `supabase/migrations/20260424114000_cycle2_remaining_trainer_rls.sql`

During the first apply attempt, another live-schema drift was caught:

- local historical assumption: `public.trainer_reviews.user_id` exists
- live truth: `public.trainer_reviews` has **no `user_id` column**

This was corrected in the migration before re-applying.

Verified final live schema artifact:

- `docs/recovery/live-schema/public-schema-post-cycle2-final.sql`

Final verified Cycle 2 table state:

- `booking_requests` — RLS enabled
- `trainers` — RLS enabled
- `trainer_availability` — RLS enabled
- `trainer_bookings` — RLS enabled
- `trainer_reviews` — RLS enabled
- `training_programs` — RLS enabled

Verified policy coverage now exists across all 6 Cycle 2 tables, including public-read vs owner/admin-write boundaries for the trainer-facing tables and fail-closed admin-only read/update for `booking_requests`.

### Remaining acceptance caveat

The schema-hardening acceptance for Cycle 2 is now satisfied from live schema evidence.

What is still not yet evidenced in this log:

- staged two-user probe output
- anon HTTP probe output against every table
- product smoke test for trainer registration/program creation

So the **database hardening work is complete**, while the broader operational acceptance pack is still only partially documented unless those runtime probes are added separately.

---

## 2026-04-24 — Cycle 3 review_count drift fix

### Live verification

Preconditions confirmed from live schema:

- `public.providers.review_count` exists
- `public.reviews.provider_id` exists
- `public.trainers.review_count` exists
- `public.trainer_reviews.trainer_id` exists

No existing provider review-count sync trigger was present before apply.

### Migration added

- `supabase/migrations/20260424122000_fix_provider_review_count.sql`

This migration:

- creates `public.sync_provider_review_count()`
- creates trigger `reviews_sync_provider_count` on `public.reviews`
- backfills `public.providers.review_count` from live `public.reviews` row counts

### Drift result

Verified from post-apply data inspection:

- provider review-count drift count = `0`

### Trigger verification

Verified in live schema dump:

- `docs/recovery/live-schema/public-schema-post-cycle3.sql`
- function present: `public.sync_provider_review_count()`
- trigger present: `reviews_sync_provider_count`

### Acceptance status

Cycle 3 core database acceptance is satisfied for:

- zero `providers.review_count` drift
- active sync trigger present on `public.reviews`

Runtime insert/delete staging probe is not yet separately evidenced in this log.
