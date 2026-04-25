# Zagreb Tier A Status — Cycle 19

## Current gate

Cycle 19 requires **5 real listed + verified Zagreb sitters** with pricing and availability.

Current live state:

| Metric                           | Current | Required |
| -------------------------------- | ------: | -------: |
| Listed + verified Zagreb sitters |       1 |        5 |
| Missing providers                |       4 |        0 |

Current listed Zagreb sitter:

| Provider    | City   | Active services | Availability slots | Reviews |
| ----------- | ------ | --------------: | -----------------: | ------: |
| Ivan Horvat | Zagreb |               4 |                  6 |       4 |

## Completed code-side work

- Added `public.waitlist_requests` migration.
- Applied remote Supabase migration.
- Added `/api/waitlist` POST endpoint.
- Added waitlist capture to `/pretraga` when Zagreb Tier A has fewer than 5 providers.
- Added `tests/e2e/zagreb-tier-a.test.ts`.
- Fixed provider search adapter to match live schema: `providers.is_demo` does not exist live.

## E2E result

- Waitlist/search smoke: PASS.
- Provider inventory gate: FAIL as expected, because current provider card count is 1 and required count is 5.

## Blocker

This cycle cannot be formally accepted until 4 more real Zagreb sitters are onboarded, verified, listed, priced, and given availability slots.
