# Sprint 3 — Slice 2: Owner Core Flow

**Status: DONE**

## Files Changed

| File | Change |
|------|--------|
| `lib/validations.ts` | Fix `petSchema.photo_url` to accept `null` via `.nullish()` |
| `app/dashboard/vlasnik/owner-dashboard-content.tsx` | Fix `savePet` to keep dialog open on error |
| `app/api/pet-passport/[petId]/route.ts` | Add PATCH endpoint with ownership check |
| `app/ljubimac/[id]/karton/pet-passport.tsx` | Wire health card save to backend + toast feedback |
| `app/dashboard/adoption/adoption-listing-form.tsx` | Fix image upload to preserve existing images; show thumbnails for new listings too |

## What Changed

### 1. Pet form — `photo_url` null rejection (bug fix)
`petSchema` used `.optional()` which only allows `undefined`. The client sends `null` for empty photo URLs. Changed to `.nullish()` so both `null` and `undefined` pass validation.

### 2. Pet form — dialog stays open on save error (UX fix)
Previously `savePet` unconditionally closed the dialog and called `router.refresh()` regardless of whether the API call succeeded. Now the dialog only closes and refreshes on success; on failure the user keeps their form state and sees the error toast.

### 3. Health card — backend persistence (feature completion)
The health card edit/save was localStorage-only — `updatePassport()` in `lib/db/pet-passport.ts` existed but was never called from the UI. Added:
- A PATCH endpoint at `/api/pet-passport/[petId]` with ownership check (`pet.owner_id === user.id`)
- The `PetPassportView` save now POSTs to the backend, with localStorage as fallback for unauthenticated users
- Save button shows loading state and toast feedback

### 4. Adoption form — image upload overwrites existing images (bug fix)
`onUploadComplete` replaced the entire `images` array with only newly uploaded URLs, discarding any previously saved images when editing a listing. Now it appends new images (deduped by URL) and caps at 8. Also removed the `listing &&` guard so uploaded image thumbnails appear for new listings, not just edits.

## What Remains

- **Ownership guard on health card page**: `/ljubimac/[id]/karton` renders for any visitor who knows the pet ID. The edit save now checks ownership server-side, but the page itself is still publicly viewable. Needs an auth check at the page level if health data should be private (requires product decision).
- **Image upload for new pets**: When adding a pet, images upload to a `new` folder since no pet ID exists yet. After creation the URL still resolves, but the storage path is not ideal. A two-step flow (create pet first, then upload) would fix this.
- **Favorites are localStorage-only**: Both `useFavorites` and `useAdoptionFavorites` persist to localStorage with no server sync. Works fine for single-device use but won't carry across devices/browsers.
- **Real login testing**: All API ownership checks (`savePet`, `deletePet`, `PATCH passport`) require a real Supabase auth session. Verified code paths and build, but end-to-end testing needs real credentials.
- **Health card draft migration**: Existing localStorage drafts won't auto-sync to the backend. First save after this change will push local data to the server.

## Known Blockers

None for the code changes. Full flow closure requires Supabase credentials for end-to-end verification.
