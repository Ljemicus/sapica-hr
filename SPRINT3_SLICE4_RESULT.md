# Sprint 3 — Slice 4: Provider Dashboards Audit

**Status: DONE**

## Files Changed

| File | Change |
|------|--------|
| `app/dashboard/profile/page.tsx` | Back-link now routes to correct dashboard per profile type (was hardcoded to `/dashboard/vlasnik`) |
| `app/dashboard/sitter/components/sitter-calendar-tab.tsx` | Calendar now uses Monday-first week layout (Croatian standard) instead of Sunday-first |
| `app/dashboard/groomer/components/groomer-dashboard-types.ts` | Removed unused `pendingBookingsCount` from `GroomerBookingsTabProps` |
| `app/dashboard/groomer/groomer-dashboard-content.tsx` | Removed unused `pendingBookingsCount` prop from `GroomerBookingsTab` call |
| `app/dashboard/groomer/components/groomer-availability-tab.tsx` | Added "show more/less" toggle — availability was hard-capped at 14 days with no way to see the rest of 28 generated days |

## What Changed

1. **Profile page back-link (bug fix)**: `/dashboard/profile` had a hardcoded `href="/dashboard/vlasnik"` back-link. If a sitter (`čuvar`) or groomer visited the profile page, the back button would send them to the owner dashboard. Now maps `PublisherProfileType` → correct dashboard route.

2. **Sitter calendar Monday-first (bug fix)**: The availability calendar used `getDay()` (Sunday=0) and placed "Ned" (Sunday) first. Croatian calendars universally start on Monday. Fixed the offset formula `(getDay() + 6) % 7` and reordered day headers to `['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']`.

3. **Groomer bookings unused prop (cleanup)**: `GroomerBookingsTab` accepted `pendingBookingsCount` but never used it. Removed from interface and call site.

4. **Groomer availability show-more (UX fix)**: The availability tab grouped slots by date but `.slice(0, 14)` hid everything beyond 14 days. Since the "Apply work hours" button generates 28 days of slots, half the schedule was invisible. Added a client-side "show all / show less" toggle with a count of hidden days.

## What Remains

- **Provider profile edit via shared `/dashboard/profile`**: This page is a client component with no server-side auth guard. If unauthenticated, the API fetch silently fails and shows a "no profile" state instead of redirecting to login. Low risk (dashboard layout likely already gates access), but could be tightened.
- **Walk tracking mid-session GPS failure**: `walk-session.tsx` handles initial geolocation errors but has no visual feedback if GPS fails mid-walk (the watch callback silently ignores errors after the first position fix).
- **No pagination on booking lists**: All dashboards load full booking/review sets without pagination. Fine for current scale, but will slow down with 100+ bookings per provider.
- **Groomer dashboard lacks earnings/analytics/reviews tabs**: The sitter dashboard has 6 tabs; groomer has only 2 (bookings + availability). Feature parity would require new data fetching and UI.
- **Full end-to-end verification**: Changes were verified via successful `next build` (TypeScript + static generation). Full interactive testing of provider flows requires auth credentials and a seeded database.

## Known Blockers

None for the changes made. The remaining items are enhancements, not blockers.

## Build

```
✓ Compiled successfully in 5.1s
✓ TypeScript OK
✓ Static pages generated (86/86)
```
