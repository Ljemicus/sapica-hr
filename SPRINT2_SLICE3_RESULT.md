# Sprint 2 — Slice 3: Public Click Audit Cleanup

**Status: DONE**

## Files Changed

| File | What changed |
|---|---|
| `app/sitemap.ts` | Fixed dead blog URLs: `/blog/${slug}` → `/zajednica/${slug}` |
| `app/kontakt/page.tsx` | Fixed dark mode breakage: hardcoded `text-gray-*` → `text-foreground` / `text-muted-foreground`, added dark variants to badge, info cards, working hours box |
| `app/izgubljeni/lost-pets-content.tsx` | Replaced weak inline empty state with shared `EmptyState` component + "Prijavi nestanak" CTA; fixed dark mode on filter section |
| `app/udomljavanje/adoption-browse-content.tsx` | Made "Saznaj više" CTA always visible (was hover-only, invisible on mobile/touch) |
| `app/zajednica/page.tsx` | Made featured article "Čitaj dalje" CTA always visible (was hover-only) |
| `components/shared/footer.tsx` | Fixed "Postani sitter" link: `/registracija?role=sitter` → `/postani-sitter` (landing page first, not raw registration) |

## What Changed

1. **Sitemap dead links** — Blog article entries in sitemap pointed to `/blog/${slug}` but no `blog/[slug]/page.tsx` exists. Articles live at `/zajednica/${slug}`. Fixed to emit correct URLs.

2. **Contact page dark mode** — The entire `/kontakt` page used hardcoded light-only colors (`text-gray-900`, `bg-orange-50`, `text-gray-500`). Replaced with theme-aware tokens (`text-foreground`, `text-muted-foreground`, dark variants on backgrounds).

3. **Lost pets empty state** — The zero-results state was a bare icon + text with no action. Replaced with the shared `EmptyState` component and added a "Prijavi nestanak" button so users have a clear next step. Also fixed dark mode on the filter bar.

4. **Hover-only CTAs on touch devices** — Adoption cards' "Saznaj više" and Zajednica featured article's "Čitaj dalje" were `opacity-0 group-hover:opacity-100`, making them invisible on mobile. Made them always visible with a subtle arrow animation on hover instead.

5. **Footer sitter link** — Footer linked directly to `/registracija?role=sitter`, skipping the `/postani-sitter` landing page that explains benefits. Fixed to route through the landing page first.

## What Remains

- `/blog/[slug]` dynamic route does not exist — the `/blog` index page works but clicking on articles from there would need to link to `/zajednica/${slug}`. The blog page itself may need an audit.
- Both `/njega` and `/grooming` serve grooming content — potential duplicate pages to consolidate.
- Footer + newsletter are `hidden md:block` — mobile users rely entirely on bottom nav and hamburger menu for navigation. Footer links (FAQ, Privacy, Terms) are only reachable via hamburger.
- Lost pet cards use some hardcoded `text-gray-*` colors in card bodies that could get a dark mode pass.

## Build

Build passes cleanly.
