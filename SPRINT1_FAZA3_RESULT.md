# Sprint 1 Faza 3 — Provider Essentials

**Status: DONE**

## Files Changed

1. `app/dashboard/sitter/onboarding/page.tsx`
2. `app/dashboard/sitter/sitter-dashboard-content.tsx`
3. `app/dashboard/sitter/components/sitter-dashboard-dialogs.tsx`
4. `app/dashboard/groomer/page.tsx`

## What Changed

### 1. Sitter onboarding now saves data (critical fix)
The multi-step onboarding form (bio, experience, services/prices, availability) collected all data in local state but **never submitted it to the API**. Clicking "Dalje" on step 4 just advanced to the completion screen without persisting anything.

**Fix:** The final step ("Raspoloživost" → "Gotovo!") now:
- Validates that bio has >= 10 chars and at least one service is selected
- POSTs to `/api/sitter-profile` with all collected data
- Shows loading state and error toasts on failure
- Only advances to completion screen on successful save
- Button text changes to "Spremi i završi" on the last data step

### 2. Avatar upload in profile edit dialog (bug fix)
The `ImageUpload` component in the sitter profile edit dialog had `onUploadComplete={() => {}}` — a no-op callback. After uploading a new avatar, nothing happened visually.

**Fix:** Added `onAvatarUploaded` prop that triggers `router.refresh()` so the page re-fetches server data and displays the new avatar.

### 3. Groomer dashboard — no-profile dead end (UX fix)
When a user without a groomer profile visited `/dashboard/groomer`, they saw a dead-end message with no way to create a profile.

**Fix:** Added a "Kreiraj profil" button linking to `/onboarding/publisher-type` so users can create their groomer profile.

## What Remains

- **Sitter onboarding photo upload (step 1):** The drag-and-drop zone is visual-only — no actual `ImageUpload` component wired up. Requires deciding on storage bucket and linking the uploaded URL to the profile.
- **Sitter onboarding city selection:** The onboarding form doesn't collect city (sends empty string). The user can set city later via the dashboard profile edit dialog. Could be added as a step or merged into step 2.
- **Sitter onboarding availability persistence:** The day-of-week selection in step 4 is not sent to the `/api/availability` endpoint (which expects specific dates, not weekdays). This is a design mismatch — the onboarding collects weekday preferences but the availability system works with specific calendar dates.
- **Groomer-specific onboarding flow:** No dedicated groomer onboarding exists (unlike sitter). Groomers must be created via the generic publisher-type flow + manual DB setup. A groomer-specific onboarding similar to the sitter one would improve the experience.
- **Testing with real provider accounts:** All fixes are verifiable in code and build passes, but end-to-end testing requires seeded provider data and authenticated sessions.

## Blockers

- None for the implemented fixes.
- Full onboarding photo upload and availability-date integration require product decisions on UX flow.

## Build

Build passes cleanly (`npx next build` — no errors).
