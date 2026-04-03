# PetPark F10 — Launch Readiness Polish

**Date:** 2026-04-03
**Goal:** Last-mile product sharpness pass before soft launch. Copy alignment, UI consistency, obvious micro-friction, SEO fixes.

---

## What was done

### 1. Blog routing fix (CRITICAL)
**Files:** `blog/page.tsx`, `blog/blog-content.tsx`, `blog/[slug]/page.tsx`, `blog/[slug]/article-content.tsx`, `navbar/config.tsx`, `footer.tsx`

All blog pages had their metadata URLs, canonical links, breadcrumbs, internal links, and navigation pointing to `/zajednica` instead of `/blog`. This meant:
- OG URLs were wrong (social shares would resolve to wrong page)
- Canonical tags pointed to wrong route (SEO confusion)
- Breadcrumbs navigated users to community page instead of blog
- Category filter buttons, article links, and "all articles" CTAs all routed wrong
- Navbar and footer "Blog" links went to `/zajednica`

Fixed all references across 6 files. `/zajednica` remains its own community route untouched.

### 2. Blog SEO unblock (HIGH)
**Files:** `blog/page.tsx`, `blog/[slug]/page.tsx`

Both the blog listing and individual article pages had `robots: { index: false, follow: false }` — completely blocking all blog content from search engines. Removed the robots directive so blog content can be indexed.

### 3. Duplicate "Zadnje objave" section removed
**File:** `blog/[slug]/article-content.tsx`

Article detail pages showed two sections with the same data: "Povezani clanci" (related articles grid) followed immediately by "Zadnje objave" (latest posts list) — both rendering from `relatedArticles`. Removed the duplicate list section, keeping the visually richer card grid.

### 4. Error page dark mode
**File:** `app/error.tsx`

Heading and body text used hardcoded `text-gray-900` / `text-gray-500` with no dark mode variants — text was invisible on dark backgrounds. Added `dark:text-gray-100`, `dark:text-gray-400`, and dark mode styles on the secondary button.

### 5. Footer visible on mobile
**File:** `components/shared/footer.tsx`

Footer had `hidden md:block` — completely hidden on mobile. Mobile users had no access to footer links (services, contact, legal, social). Removed the mobile-hiding class. Newsletter signup remains desktop-only (intentional).

### 6. Typo fix — Rijeka landing page
**File:** `app/cuvanje-pasa-rijeka/page.tsx`

"gusty sumu" -> "gustu sumu" (dense forest). Visible typo on a public SEO landing page.

### 7. Auth form copy alignment
**Files:** `registracija/register-form.tsx`, `nova-lozinka/reset-password-form.tsx`

- **OAuth buttons:** Registration page said "Registriraj se s Apple/Google/Facebook" while login said "Nastavi s Apple/Google/Facebook". Unified to "Nastavi s..." on both pages — less friction, matches industry standard (Continue with...).
- **Password confirmation label:** Registration used "Ponovite lozinku", reset password used "Potvrdite lozinku". Unified to "Ponovite lozinku" everywhere.

### 8. Sitter availability legend consistency
**File:** `app/sitter/[id]/sitter-profile-content.tsx`

Sitter profile calendar legend said "Slobodno" / "Nije dostupno" while groomer and trainer profiles used "Dostupan" / "Nedostupan". Aligned sitter to match the other two provider types.

---

## What was NOT done (and why)

| Item | Reason |
|------|--------|
| Consolidate `/blog` and `/zajednica` into single system | Architectural change, not launch-safe. Both routes work correctly now. |
| Booking dialog flow standardization (sitter vs groomer vs trainer) | Different services legitimately need different flows. Would require UX research. |
| Provider profile button color unification (orange/pink/indigo) | Intentional per-service-type branding. Not a bug. |
| FAQ data source deduplication (page.tsx vs faq-content.tsx) | Works correctly, just maintenance debt. Not user-facing. |
| Dynamic Tailwind delay classes (`delay-${n}`) | These work because the values used (100-700) are in Tailwind's default config. Not a real issue. |
| InternalLinkSection copy standardization across city pages | Copy is city-specific by design; some descriptions read like internal notes but are functional. |
| Mobile view toggle adding List option | Feature addition, not polish. |

---

## Follow-ups / Risks

1. **`/zajednica` route still exists** — users may have bookmarked or linked to `/zajednica/[slug]` articles. Consider adding redirects from `/zajednica/[slug]` to `/blog/[slug]` before removing the zajednica article route.
2. **Footer on mobile** — now visible but the 4-column grid collapses to single column. Looks fine but worth a visual QA pass on small screens.
3. **Blog `?category=` param** — changed from `?kategorija=` to `?category=` in blog-content filter links for consistency with the URL param used in page.tsx's `searchParams`. Verify this matches the server-side param name.
4. **Newsletter signup still hidden on mobile** — intentional for now, but consider a simpler mobile variant post-launch.

---

## Build status

`next build` passes cleanly. No type errors, no warnings related to these changes.
