# Sprint 1 Faza 2 — Owner Essentials (Retry)

**Status: DONE**
**Date: 2026-04-02**

## Files Changed

| File | What Changed |
|------|-------------|
| `app/dashboard/vlasnik/owner-dashboard-content.tsx` | Wrapped all fetch calls (`savePet`, `deletePet`, `cancelBooking`, `submitReview`) in try/catch for network error handling. Added `deletingPetId` state to guard against double-delete. |
| `app/ljubimac/[id]/karton/pet-passport.tsx` | Clear localStorage draft after successful backend save. Simplified `cancelEdit` to revert to server-provided prop instead of stale localStorage. |
| `app/api/pet-passport/[petId]/route.ts` | Added Zod schema validation to PATCH endpoint (previously accepted any body). |
| `lib/validations.ts` | Added `petPassportSchema` with nested schemas for vaccinations, allergies, medications, vet_info, notes. |

## What Changed

### 1. Network error handling (owner-dashboard-content.tsx)
- All four async actions (`savePet`, `deletePet`, `cancelBooking`, `submitReview`) now have try/catch around fetch calls
- Network failures show a user-friendly toast ("Mrežna greška — pokušajte ponovo") instead of crashing with unhandled promise rejections

### 2. Pet delete double-click guard (owner-dashboard-content.tsx)
- Added `deletingPetId` state to track which pet is being deleted
- Prevents multiple DELETE requests from rapid clicks while awaiting response

### 3. Pet passport localStorage hygiene (pet-passport.tsx)
- After successful backend save, `localStorage.removeItem(storageKey)` clears the draft
- Prevents stale localStorage drafts from overriding newer server data on next page visit

### 4. Pet passport cancel revert fix (pet-passport.tsx)
- `cancelEdit()` now always reverts to the server-provided `passport` prop
- Previously it loaded from localStorage, which could contain outdated data from a prior session

### 5. Pet passport API input validation (route.ts + validations.ts)
- PATCH `/api/pet-passport/[petId]` now validates the request body with `petPassportSchema`
- Rejects malformed payloads (bad severity values, wrong types) with 400 + error details
- Schema covers: vaccinations (name/date/vet/next_date), allergies (name/severity/notes), medications (name/dose/schedule/start_date/end_date), vet_info (name/phone/address/emergency), notes

## What Remains

- **Favorites are localStorage-only** — No backend persistence; data lost on browser clear. Feature decision, not a bug.
- **QR code on pet passport is decorative** — Static CSS pattern, not a real scannable QR.
- **Image upload error states** — `ImageUpload` component could surface more specific errors.
- **No optimistic UI for pet deletion** — Pet card stays visible until `router.refresh()` completes.
- **Real Supabase credentials** needed to test upload and DB persistence end-to-end.

## Blockers

None.
