# Block C — Performance + Mobile Polish Result

**Status:** DONE  
**Date:** 2026-07-14  
**Commit:** f54c4b72

## Files changed

| File | Change |
|------|--------|
| `next.config.ts` | Add `formats: ['image/avif', 'image/webp']` — CDN + next/image auto-serves modern formats |
| `app/layout.tsx` | Trim Nunito from 5 weights → 3 (600/700/800); add `Viewport` export; font preconnect hints; defer ChatWidget |
| `app/page.tsx` | `fetchPriority="high"` on hero image; `decoding="async"` on 3 below-fold image groups; search button `aria-label` |
| `components/shared/deferred-ui.tsx` | ChatWidget moved here via `dynamic()` — lazy-loaded after hydration |
| `app/globals.css` | Paw-pattern SVG inlined as data URI; `prefers-reduced-motion` block; `pointer: coarse` touch target enforcement |

## Performance wins

### Font payload reduction
- Nunito trimmed from 5 weights (400, 600, 700, 800, 900) to 3 (600, 700, 800)
- Saves ~2 font files (~40–80 KB) on first load
- Font preconnect hints added so DNS + TLS handshake starts earlier

### Modern image formats
- `formats: ['image/avif', 'image/webp']` in `next.config.ts`
- Next.js image optimizer now serves AVIF/WebP to supported browsers automatically
- AVIF typically 40–60% smaller than JPEG; WebP ~25–35% smaller

### Hero LCP image
- `fetchPriority="high"` added — browser gives it maximum network priority
- Already had `priority` (preload) — `fetchPriority` reinforces this at HTTP level

### Below-fold image decoding
- `decoding="async"` on service cards, city cards, and explore section images
- Offloads image decode to worker thread, unblocking main thread during scroll

### ChatWidget deferred
- Was synchronously imported in `layout.tsx` — included in every page's JS bundle parse
- Now lazy-loaded via `dynamic()` in DeferredUI after hydration completes
- Reduces initial JS parse work on mobile

### Network request saved
- `paw-pattern.svg` (background image used 6+ times) converted to inline data URI in CSS
- Eliminates an extra HTTP request; the SVG is only 9 lines so overhead is negligible

## Mobile UX wins

### Viewport meta
- Added proper `Viewport` export: `width=device-width`, `initialScale=1`, `minimumScale=1`
- Was missing from Next.js metadata — ensures correct mobile scaling

### Touch target enforcement
- `@media (pointer: coarse)` block enforces 44×44px minimum on `a`, `button`, `[role=button]`
- Meets WCAG 2.5.5 guideline for touch inputs

### Accessibility
- Search submit button now has `aria-label="Pretraži sittere"` — helps screen readers and voice control on mobile

### Reduced motion
- `@media (prefers-reduced-motion: reduce)` disables all CSS animations (fade-in-up, float, gradient-shift, card-hover lifts, hero gradient animation)
- Critical for users with vestibular disorders; also improves battery life on mobile

## Build verification
- `npx tsc --noEmit` → 0 errors
- `npx next build` → clean, 0 errors, 0 warnings
- `npx eslint` on touched files → 0 issues

## What remains (follow-up)

1. **Image CDN compression**: Run `cwebp` or sharp on `/public/images/services/` — the JPEGs are 68–336 KB. Even with AVIF serving, smaller source files help when next/image cache misses or direct URL access
2. **Inter font audit**: `Inter` is loaded with `latin + latin-ext` subsets — could drop `latin-ext` if Croatian-specific chars (č, š, ž) are in the base latin range (they are in ISO-8859-2 but Unicode ranges vary)
3. **Plausible analytics**: Currently `strategy="afterInteractive"` — already non-blocking, no change needed
4. **CSS critical path**: `globals.css` is now ~500 lines; could extract critical above-fold CSS but Next.js handles this well via the App Router
5. **Intersection Observer animations**: Currently all `.animate-fade-in-up` run on mount via CSS animation-delay. Consider a JS IntersectionObserver approach to only animate elements when actually visible (saves work for elements far below fold)
