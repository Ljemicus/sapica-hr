# Sprint 2 — Slice 4: Performance & SEO Cleanup

**Status: DONE**

## Files Changed

### Hero image CLS fix
- `app/page.tsx` — corrected hero image `height` from 240 to 375 to match actual aspect ratio (1344x750 = 1.79:1), preventing cumulative layout shift

### Canonical URLs added (16 pages)
- `app/shop/page.tsx`
- `app/forum/page.tsx`
- `app/zajednica/page.tsx`
- `app/o-nama/page.tsx`
- `app/faq/page.tsx`
- `app/veterinari/page.tsx`
- `app/hitno/page.tsx`
- `app/dog-friendly/page.tsx`
- `app/izgubljeni/page.tsx`
- `app/postani-sitter/page.tsx`
- `app/grooming/page.tsx`
- `app/blog/page.tsx`
- `app/privatnost/page.tsx`
- `app/uvjeti/page.tsx`
- `app/kontakt/layout.tsx`

## What Changed

1. **Hero image aspect ratio (CLS)** — The homepage hero `<Image>` declared `height={240}` but the actual file is 1344x750 (ratio ~1.79:1). At width 672, the correct height is 375. This was causing the browser to reserve 240px of vertical space then reflow when the image loaded with `object-cover`. Fixed to 375 to eliminate the layout shift.

2. **Canonical URLs on 16 public pages** — Added `alternates: { canonical }` to every indexable public route that was missing one. Pages that already had canonicals (pretraga, njega, dresura, udomljavanje, uzgajivacnice, city pages, and all dynamic `[id]/[slug]` routes) were left unchanged. This prevents duplicate-content signals from trailing slashes, query params, or alternate URLs.

## Already in Good Shape (no changes needed)

- **`next/image` usage** — All images use `next/image` with `fill`+`sizes` or explicit dimensions. No raw `<img>` tags anywhere.
- **`unoptimized` prop** — Only used in `image-upload.tsx` for blob URL previews (correct, can't optimize blob URLs).
- **`sharp`** — Installed as a transitive dependency of Next.js 16.2.1. Image optimization works in production.
- **`robots.ts`** — Present with correct disallow rules for private routes.
- **`sitemap.ts`** — Comprehensive coverage of all public + dynamic routes with proper priorities/frequencies.
- **Metadata** — Every public page has `title`, `description`, and `openGraph`.
- **Fonts** — Using `display: 'swap'` on both Inter and Nunito.
- **Preconnect/DNS-prefetch** — Configured for Supabase and Plausible.
- **Security headers** — Full CSP, HSTS, X-Frame-Options, etc.
- **JSON-LD** — WebsiteJsonLd, SiteNavigationJsonLd, FAQJsonLd, ServiceJsonLd, ItemListJsonLd all present.
- **Hero image `priority`** — Already set on the above-fold hero image.
- **Service images `loading="lazy"`** — Correctly lazy-loaded for below-fold content.

## What Remains

- **Image compression** — Service images total ~1 MB (largest: `03-dresura-agility.jpg` at 342 KB). Could be re-exported as WebP/AVIF for ~50-70% savings, but Next.js image optimizer handles runtime conversion already.
- **Blur placeholders** — Adding `placeholder="blur"` + `blurDataURL` to static images would improve perceived load, but requires generating base64 thumbnails.
- **Cache headers for static assets** — Currently relying on Next.js/Vercel defaults. Could add explicit `Cache-Control` for `/images/*` and `/icons/*` in `next.config.ts`.

## Build

Successful — all routes compiled without errors.
