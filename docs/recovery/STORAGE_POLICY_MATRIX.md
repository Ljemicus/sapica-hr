# STORAGE_POLICY_MATRIX

## Cycle 10 — Storage posture audit (2026-04-24)

| bucket                   | public                                 | upload policy                                                                                                               | download policy                                                                                              | EXIF strip | signed URL TTL         |
| ------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- | ---------------------- |
| avatars                  | yes                                    | authenticated user own upload path via `app/api/upload/route.ts`                                                            | public via `getPublicUrl()`                                                                                  | TODO check | N/A                    |
| pet-photos               | yes                                    | authenticated user own upload path via `app/api/upload/route.ts`                                                            | public via `getPublicUrl()`                                                                                  | TODO check | N/A                    |
| verification-docs        | no (confirmed via remote storage dump) | authenticated user own upload path via `app/api/upload/verification/route.ts` and private mode in `app/api/upload/route.ts` | signed URL only via admin route / private reference response                                                 | TODO check | 10 min in current code |
| rescue-verification-docs | no (intended)                          | authenticated organization owner upload via `app/api/rescue-verification-documents/upload/route.ts`                         | signed URL via owner-or-admin route `app/api/rescue-verification-documents/[documentId]/signed-url/route.ts` | TODO check | 10 min in current code |
| pet-updates              | unknown / not verified in live probe   | authenticated user upload via generic upload route                                                                          | likely public URL if bucket is public                                                                        | TODO check | N/A                    |
| lost-pet-images          | unknown / not verified in live probe   | authenticated user upload via generic upload route                                                                          | likely public URL if bucket is public                                                                        | TODO check | N/A                    |

## Probe notes

- Direct unauthenticated probe against `verification-docs` and `pet-photos` using placeholder object paths returned `400`, so placeholder-path probing alone was inconclusive.
- Remote storage truth was then confirmed via `supabase db dump --linked --schema storage --data-only`:
  - `avatars` → `public = true`
  - `pet-photos` → `public = true`
  - `verification-docs` → `public = false`
- The same remote storage dump also confirmed that real objects exist in `avatars` and `pet-photos`, so this is actual deployed bucket state, not just code intent.
- Code intent still matches deployed state:
  - `verification-docs` is treated as private: upload endpoints return path refs only, and read access is mediated through signed URLs.
  - `avatars` and `pet-photos` are treated as public: generic upload route calls `getPublicUrl()` for those buckets.
- Current signed URL TTL is **10 minutes**, not the 1h example shown in the playbook matrix.

## Risks found

1. `app/api/upload/route.ts` allows client-specified bucket values including `verification-docs`; privacy relies on bucket config plus route behavior, not a tighter dedicated upload boundary.
2. EXIF stripping is not verified anywhere in current storage pipeline.
