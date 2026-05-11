# PetPark Page Blueprint Pack v2.0

**Status:** official planning blueprint for future PetPark v2 page redesign work  
**Direction:** Smart Assistant + Service Circle  
**Product model:** service-first + community-first  
**Logo rule:** official PetPark logo only  
**Visual system:** warm cream surfaces, deep green typography, orange CTA accents, rounded cards, consistent spacing  
**Implementation rule:** documentation only until approved; do not implement from this file without an explicit phase approval.

This blueprint was created after reading the PetPark v2 Design Book files and inspecting the current Next.js App Router codebase. It converts the Design Book into route-group level implementation guidance so later phases can redesign pages safely without touching product logic.

## Global redesign rules

- Keep homepage service-first and community-first; do not turn it into a provider-directory homepage.
- Use the official `public/brand/petpark-logo.svg` only.
- Use shared PetPark v2 primitives before one-off route styling.
- Preserve auth, booking, payments, messages, API contracts, Supabase RLS/schema, middleware, and deployment configuration.
- Public pages can be more expressive; dashboards and transactional pages must stay practical, clear, and low-risk.
- Mobile-first: stack complex desktop layouts, avoid the full desktop service orbit on mobile, keep touch targets at least 44px.
- Loading, empty, and error states are part of the page design, not afterthoughts.

## Current route inventory summary

Inspected `app/**/page.tsx`, `app/**/layout.tsx`, `components/shared/**`, `components/shared/petpark/**`, and `components/shared/navbar/**`.

Major route families found:

- Homepage: `/`
- Discovery/search: `/pretraga`, `/pretraga/en`
- Services: `/njega`, `/grooming`, `/dresura`, `/veterinari`, city SEO service routes, service detail/profile routes
- Provider profiles: `/sitter/[id]`, `/groomer/[id]`, `/trener/[id]`, `/dresura/[id]`, `/veterinari/[slug]`
- Dashboards: owner, sitter, groomer, trainer, breeder, rescue, adoption, settings/profile
- Pet profile/passport: `/ljubimac/[id]/kartica`, `/karton`, `/passport`, `/passport/share`
- Bookings/updates: `/dashboard/vlasnik/rezervacije`, `/azuriranja/[bookingId]`
- Checkout: `/checkout/[bookingId]`, `/success`, `/cancel`
- Messages: `/poruke`
- Community: `/zajednica`, feed, challenges, best, detail slug
- Forum: `/forum`, `/forum/[id]`
- Lost/found: `/izgubljeni`, detail, report, flyer, EN variants
- Adoption/rescue: `/udomljavanje`, detail, organization profile, dashboard adoption/rescue routes, `/apelacije`
- Blog/content: `/blog`, `/blog/[slug]`, static content pages
- Auth/onboarding: `/prijava`, `/registracija`, password reset, provider onboarding, publisher type
- Global shell: navbar, footer, bottom nav, mobile sheet

---

## 1. Homepage

### Route(s)

- `/`

### Current likely files/components

- `app/page.tsx`
- `components/shared/petpark/homepage-redesign.tsx`
- `components/shared/petpark/service-hub-overview.tsx`
- `components/shared/petpark/service-card.tsx`
- `components/shared/petpark/community-card.tsx`
- `components/shared/petpark/blog-card.tsx`

### Target page template

Homepage template.

### Purpose of the page

Answer “Što treba tvom ljubimcu danas?” and route users into services, community, urgent flows, adoption, and advice without making providers the first concept.

### Visual direction

Warm cream full-page background, expressive green hero typography, orange primary CTA, smart assistant/wizard on the left and circular service hub on the right. Use rounded cards and soft shadows; below hero, continue with quick action rail, live community, advice, and trust cards.

### Desktop layout

- Header/global nav.
- Two-column hero: smart assistant left, service circle right.
- Quick actions as horizontal rail/bento row.
- Content sections: Live zajednica, Najnoviji savjeti, Zašto PetPark.
- Benefits/trust strip and footer.
- Loading/empty/error states only for dynamic below-fold sections.

### Mobile layout

- Header compact.
- Hero stacks: headline, assistant, then service grid; no full desktop orbit.
- Quick actions become 2-column cards.
- Community/advice/trust stack vertically.
- Optional sticky CTA only if it does not cover navigation.

### Shared components to use

`SiteHeader`, `SiteFooter`, `HomeHeroSmartAssistant`, `PetNeedWizard`, `ServiceOrbit`, `QuickActionRail`, `ServiceCard`, `CommunityActivityCard`, `AdviceCard`, `WhyPetParkCard`, `PPButton`, `PPCard`, `PPBadge`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Featured services, recent community activity, recent advice/blog posts, urgent lost pet/adoption highlights if available.

### Supabase mapping if applicable

`providers`, `provider_services`, `reviews`, `pets`, `bookings`, community/blog/lost/adoption tables where implemented.

### Future schema / CMS notes

Community, blog, lost/found, adoption content may require future schema or CMS unless already implemented.

### Static Croatian copy examples

- H1: `Što treba tvom ljubimcu danas?`
- Subtitle: `PetPark povezuje ljubimce s pouzdanim ljudima i uslugama koje im olakšavaju svaki dan.`
- CTA: `Nastavi`, `Pronađi uslugu`, `Hitno: izgubljen ljubimac?`
- Empty: `Još nema novih objava, ali zajednica se puni svaki dan.`
- Error: `Ne možemo trenutno učitati novosti. Pokušaj ponovno za par trenutaka.`

### Loading state

Skeleton cards for assistant, quick actions, community cards, and advice cards.

### Empty state

Friendly card with pet illustration/icon, one clear CTA to services or community.

### Error state

Soft warning card, no technical details, retry button.

### Accessibility notes

Single H1, semantic sections with H2s, descriptive button labels, keyboard-focusable chips, no label clipping in orbit, alt text for pet imagery.

### SEO notes

- Title: `PetPark — sve za tvog ljubimca na jednom mjestu`
- Meta: `Pronađi čuvanje, šetnju, grooming, trening, savjete i zajednicu za svog ljubimca.`
- H1: `Što treba tvom ljubimcu danas?`
- OG should show official brand/homepage visual, not fake stats.

### Risk level

Medium — homepage is high-visibility and must preserve service-first strategy while avoiding provider-directory drift.

### What must not be changed

Do not change auth/session, payments, bookings, messages, APIs, Supabase schema/RLS, middleware, or deployment.

### Acceptance criteria

- Smart Assistant + Service Circle direction is visible on desktop.
- Mobile uses wizard/grid instead of full orbit.
- No fake counts or generated logos.
- Public CTAs route correctly.
- Lint/type-check/build pass in implementation phase.

---

## 2. Usluge overview

### Route(s)

- Candidate future `/usluge` if added
- Current service discovery routes: `/pretraga`, `/njega`, `/grooming`, `/dresura`, `/veterinari`, `/hitno`

### Current likely files/components

- `app/pretraga/page.tsx`
- `app/njega/page.tsx`
- `app/grooming/page.tsx`
- `app/dresura/page.tsx`
- `app/veterinari/page.tsx`
- `components/shared/petpark/listing-page-template.tsx`
- `components/shared/petpark/service-card.tsx`
- `components/shared/petpark/service-listing-card.tsx`
- `components/shared/petpark/search-filter-bar.tsx`

### Target page template

Public service overview template.

### Purpose of the page

Let owners understand all PetPark services and choose the right path by need, not by internal provider category.

### Visual direction

Cream page shell, large green page hero, orange primary action, service category cards with soft mint/orange states, clear “next step” CTAs.

### Desktop layout

- Header.
- PageHero explaining service ecosystem.
- Category grid for Čuvanje, Šetnja, Grooming, Trening, Veterinari, Hitno, Izgubljeni, Udomljavanje.
- Optional filters/need picker.
- Trust/FAQ section.
- Footer.

### Mobile layout

- Hero condensed.
- Category cards stack or 2-column grid depending content length.
- Filters collapse into drawer/sheet.
- Sticky bottom CTA optional for “Pronađi uslugu”.

### Shared components to use

`PageHero`, `PetNeedWizard`, `ServiceCard`, `QuickActionRail`, `PPCard`, `PPButton`, `PPBadge`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Available service categories, featured providers/counts only if real, localized service availability, filters.

### Supabase mapping if applicable

`providers`, `provider_services`, `provider_sitter_settings`, `provider_groomer_settings`, `provider_trainer_settings`, `availability_slots`, `reviews`.

### Future schema / CMS notes

A dedicated `/usluge` route may require future routing/content decision unless already planned.

### Static Croatian copy examples

- H1: `Sve usluge za tvog ljubimca`
- Subtitle: `Od šetnje i čuvanja do groominga, treninga i hitnih situacija.`
- CTA: `Odaberi što trebaš`
- Empty: `Trenutno nema dostupnih usluga za ove filtere.`
- Error: `Usluge se nisu uspjele učitati.`

### Loading state

Service grid skeleton with filter bar skeleton.

### Empty state

Explain filters can be changed; show CTA `Pogledaj sve usluge`.

### Error state

Retry card and fallback links to major routes.

### Accessibility notes

Use H1 once, each category card has accessible label, filters are keyboard usable, contrast meets minimums.

### SEO notes

- Title: `Usluge za ljubimce | PetPark`
- Meta: `Pronađi čuvanje, šetnju, grooming, trening, veterinare i pomoć za ljubimce.`
- H1: `Sve usluge za tvog ljubimca`

### Risk level

Low — mostly presentation and navigation, but avoid fake service availability.

### What must not be changed

Do not change provider fetching contracts, booking logic, auth/session, Supabase schema, or API contracts.

### Acceptance criteria

- Service categories are need-led.
- Existing service routes remain reachable.
- Filters do not change business logic.
- Empty/error states are present.

---

## 3. Service detail pages

### Route(s)

- `/njega`, `/grooming`, `/dresura`, `/dresura/[id]`, `/setnja/[id]`, `/veterinari`, `/veterinari/[slug]`
- SEO service routes: `/cuvanje-pasa-zagreb`, `/cuvanje-pasa-rijeka`, `/cuvanje-pasa-split`, `/grooming-zagreb`, EN variants

### Current likely files/components

- `app/njega/page.tsx`
- `app/grooming/page.tsx`
- `app/dresura/page.tsx`
- `app/dresura/[id]/page.tsx`
- `app/setnja/[id]/page.tsx`
- `app/veterinari/page.tsx`
- `app/veterinari/[slug]/page.tsx`
- `components/shared/petpark/page-hero.tsx`
- `components/shared/petpark/listing-page-template.tsx`
- `components/shared/petpark/listing-provider-card.tsx`

### Target page template

Service detail/category template.

### Purpose of the page

Explain one service category, help users compare options, and route into provider selection or booking.

### Visual direction

Editorial service hero, benefits cards, provider/result cards, FAQ/trust block, orange CTA. Use green headings and cream/mint cards.

### Desktop layout

- Header.
- Service PageHero with problem/solution copy.
- Main content grid: service explanation and provider/results area.
- Sidebar for filters, price/rating/availability if needed.
- FAQ and related services.
- Footer.

### Mobile layout

- Hero stacks.
- Filters become drawer.
- Provider cards stack.
- Sticky CTA for search/booking only when page intent is transactional.

### Shared components to use

`PageHero`, `ServiceCard`, `ProviderProfileHero`, `BookingSummaryCard`, `PPCard`, `PPButton`, `PPBadge`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Service copy, provider listings, availability, ratings/reviews, pricing ranges, location filters.

### Supabase mapping if applicable

`providers`, `provider_services`, `provider_sitter_settings`, `provider_groomer_settings`, `provider_trainer_settings`, `availability_slots`, `reviews`, `trainers`, `training_programs`.

### Future schema / CMS notes

SEO city content may require CMS if it should become editorial and maintainable.

### Static Croatian copy examples

- H1: `Pouzdano čuvanje pasa`
- CTA: `Pronađi termin`
- Empty: `Nema dostupnih pružatelja za odabrane filtere.`
- Error: `Ne možemo učitati ovu uslugu.`

### Loading state

Hero remains stable; cards show skeleton rows.

### Empty state

Suggest changing location/date and show related services.

### Error state

Retry plus link back to `/pretraga`.

### Accessibility notes

Service filter controls must have labels, cards should expose provider/service name, images need alt text.

### SEO notes

Each public service route needs unique title/meta/H1 and OG image. Do not duplicate city SEO copy blindly.

### Risk level

Medium — service pages are close to bookings and provider data; preserve data contracts.

### What must not be changed

Do not change booking creation, availability logic, provider ranking logic, API contracts, or Supabase schema.

### Acceptance criteria

- Existing data still renders.
- No fake provider counts.
- Mobile filters are usable.
- SEO basics preserved.

---

## 4. Search/results pages

### Route(s)

- `/pretraga`, `/pretraga/en`

### Current likely files/components

- `app/pretraga/page.tsx`
- `components/shared/petpark/search-filter-bar.tsx`
- `components/shared/petpark/listing-provider-card.tsx`
- `components/shared/petpark/service-listing-card.tsx`
- `components/shared/discovery-page-shell.tsx`

### Target page template

Public service overview template plus search/results pattern.

### Purpose of the page

Let users filter and compare available services/providers by need, location, availability, and trust signals.

### Visual direction

Functional but warm: cream background, sticky/contained filter surface, clean results cards, green headings, orange primary filter/search action.

### Desktop layout

- Header.
- Compact search hero/page header.
- Left filters sidebar or top filter panel.
- Results grid/list.
- Sorting, map optional only if already present.
- Empty/error panels and footer.

### Mobile layout

- Search input at top.
- Filters in drawer/sheet.
- Results one-column cards.
- Sticky `Filtriraj`/`Traži` CTA if useful.

### Shared components to use

`PageHeader`, `SearchFilterBar`, `ServiceCard`, `ProviderProfileHero`, `PPCard`, `PPButton`, `StatusBadge`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Query params, location, service type, providers, availability, ratings, price, tags.

### Supabase mapping if applicable

`providers`, `provider_services`, `availability_slots`, `reviews`, settings tables per provider type.

### Future schema / CMS notes

None unless search facets require new indexed fields.

### Static Croatian copy examples

- H1: `Pronađi pravu pomoć za svog ljubimca`
- CTA: `Prikaži rezultate`
- Empty: `Nema rezultata za ove filtere.`
- Error: `Pretraga trenutno nije dostupna.`

### Loading state

Filter controls disabled; result cards as skeletons.

### Empty state

Show clear filter reset CTA.

### Error state

Retry and fallback links to main service routes.

### Accessibility notes

Filter drawer must trap focus; checkboxes/selects labelled; result count announced if possible.

### SEO notes

Search pages can have indexable base metadata; filtered states should avoid thin duplicate SEO if query-driven.

### Risk level

Medium — search UX touches data and filtering behavior.

### What must not be changed

Do not alter API contracts, query semantics, provider ranking, auth/session, bookings, or Supabase schema.

### Acceptance criteria

- Existing query params continue to work.
- Results remain accurate.
- Filter drawer accessible on mobile.
- Empty/error states included.

---

## 5. Provider/service profiles

### Route(s)

- `/sitter/[id]`
- `/groomer/[id]`
- `/trener/[id]`
- `/dresura/[id]`
- `/setnja/[id]`
- `/veterinari/[slug]`
- `/uzgajivacnice/[id]`

### Current likely files/components

- `app/sitter/[id]/page.tsx`
- `app/groomer/[id]/page.tsx`
- `app/trener/[id]/page.tsx`
- `app/dresura/[id]/page.tsx`
- `app/setnja/[id]/page.tsx`
- `app/veterinari/[slug]/page.tsx`
- `components/shared/petpark/provider-card.tsx`
- `components/shared/petpark/rating-summary.tsx`
- `components/shared/petpark/price-range.tsx`
- `components/shared/availability-calendar.tsx`

### Target page template

Provider/service profile template.

### Purpose of the page

Build trust and let users understand a provider/service before contacting or booking.

### Visual direction

Profile hero with avatar/photo, verified badges, service chips, rating summary, warm rounded sections, booking/contact card as a clear but non-aggressive CTA.

### Desktop layout

- Header.
- Provider hero with identity/trust signals.
- Main column: about, services, gallery, reviews, FAQ.
- Sticky side card: price, availability, booking/contact CTA.
- Footer.

### Mobile layout

- Hero stacks.
- Sticky bottom booking/contact CTA if transactional.
- Side card becomes inline summary.
- Gallery swipeable if already supported.

### Shared components to use

`ProviderProfileHero`, `PetAvatar`, `UserAvatar`, `BookingSummaryCard`, `PPCard`, `PPBadge`, `PPStatusBadge`, `RatingSummary`, `PriceRange`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Provider profile, services, settings, gallery, reviews, availability, pricing, verification status.

### Supabase mapping if applicable

`profiles`, `providers`, `provider_services`, `provider_sitter_settings`, `provider_groomer_settings`, `provider_trainer_settings`, `availability_slots`, `reviews`, `trainers`, `training_programs`.

### Future schema / CMS notes

Provider FAQ/service details may require structured fields if not present.

### Static Croatian copy examples

- H1: `Upoznaj pružatelja usluge`
- CTA: `Pošalji upit`, `Rezerviraj termin`
- Empty reviews: `Još nema recenzija.`
- Error: `Profil trenutno nije moguće učitati.`

### Loading state

Profile hero skeleton plus section skeletons.

### Empty state

For missing reviews/gallery/services, show small contextual empty cards without implying failure.

### Error state

Retry and link back to search.

### Accessibility notes

Provider photos need alt text, badge meaning should not rely on color only, CTA labels explicit.

### SEO notes

Public profiles need provider/service title, useful meta, canonical URL, and OG image if safe.

### Risk level

High — profiles connect to booking/contact and trust; preserve logic and factual data.

### What must not be changed

Do not change booking status logic, contact/message APIs, payment flow, verification rules, RLS/schema, or auth/session.

### Acceptance criteria

- Existing provider data remains factual.
- Booking/contact CTAs preserve existing behavior.
- Reviews/verification displayed accurately.
- Mobile CTA does not block content.

---

## 6. User dashboard

### Route(s)

- `/dashboard/vlasnik`
- `/dashboard/vlasnik/onboarding`
- `/dashboard/vlasnik/rezervacije`
- `/dashboard/profile`
- `/dashboard/postavke`
- `/omiljeni`

### Current likely files/components

- `app/dashboard/vlasnik/page.tsx`
- `app/dashboard/vlasnik/onboarding/page.tsx`
- `app/dashboard/vlasnik/rezervacije/page.tsx`
- `app/dashboard/profile/page.tsx`
- `app/dashboard/postavke/page.tsx`
- `app/omiljeni/page.tsx`

### Target page template

User dashboard template.

### Purpose of the page

Help owners manage pets, reservations, favorites, profile settings, and next actions.

### Visual direction

Calm app shell: less decoration than public pages, cream background, white cards, green section headings, orange for primary next actions.

### Desktop layout

- Authenticated dashboard shell.
- Overview cards: pets, upcoming bookings, messages, reminders.
- Main grid with next actions and recent activity.
- Sidebar for profile/status if useful.

### Mobile layout

- Dashboard cards stack.
- Priority actions first.
- Bottom/mobile nav stays clear.
- Avoid complex multi-column widgets.

### Shared components to use

`DashboardShell`, `PPCard`, `PPButton`, `StatusBadge`, `PetAvatar`, `BookingSummaryCard`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Current user, pets, bookings, messages/unread count, favorites, profile completion.

### Supabase mapping if applicable

`profiles`, `pets`, `pet_passports`, `bookings`, `booking_items`, `conversations`, `messages`, `reviews`.

### Future schema / CMS notes

Reminders/tasks may require future schema unless already implemented.

### Static Croatian copy examples

- H1: `Dobrodošao natrag`
- CTA: `Dodaj ljubimca`, `Pogledaj rezervacije`
- Empty: `Još nemaš dodanih ljubimaca.`
- Error: `Ne možemo učitati tvoj dashboard.`

### Loading state

Dashboard card skeletons with stable shell.

### Empty state

Action-focused: explain next step and provide one CTA.

### Error state

Retry and support/contact option if account-related.

### Accessibility notes

Dashboard landmarks, labelled cards, focus-visible actions, touch targets at least 44px.

### SEO notes

Private/auth pages usually noindex; focus metadata on app clarity, not public SEO.

### Risk level

High — authenticated area with user data and bookings.

### What must not be changed

Do not change auth/session, role guards, booking logic, messaging APIs, RLS/schema, or settings persistence.

### Acceptance criteria

- Auth flow and role guards unchanged.
- User data is not faked.
- Empty states guide next actions.
- Mobile dashboard remains usable.

---

## 7. Provider dashboard

### Route(s)

- `/dashboard/sitter`, `/dashboard/sitter/onboarding`, `/dashboard/sitter/setnja`
- `/dashboard/groomer`, `/dashboard/groomer/onboarding`
- `/dashboard/trainer`
- `/dashboard/breeder`, `/dashboard/breeder/onboarding`, `/dashboard/breeder/legla`, `/dashboard/breeder/leglo/novo`, `/dashboard/breeder/upiti`
- `/dashboard/adoption`, `/dashboard/adoption/new`, `/dashboard/adoption/[id]/edit`
- `/dashboard/rescue`, `/dashboard/rescue/apelacije/[appealId]`

### Current likely files/components

- `app/dashboard/sitter/page.tsx`
- `app/dashboard/sitter/onboarding/page.tsx`
- `app/dashboard/sitter/setnja/page.tsx`
- `app/dashboard/groomer/page.tsx`
- `app/dashboard/groomer/onboarding/page.tsx`
- `app/dashboard/trainer/page.tsx`
- `app/dashboard/breeder/page.tsx`
- `app/dashboard/adoption/page.tsx`
- `app/dashboard/rescue/page.tsx`

### Target page template

Provider dashboards template.

### Purpose of the page

Let providers manage profile, availability, bookings, inquiries, onboarding, and service readiness.

### Visual direction

Functional app layout, white/cream cards, status badges, clear completion checklists, low decoration. Orange only for the highest-priority action.

### Desktop layout

- Authenticated shell with provider navigation.
- Status/verification/onboarding summary.
- Cards for bookings, availability, inquiries, earnings if present.
- Management tables/lists with clear empty states.

### Mobile layout

- Navigation collapses.
- Status cards stack.
- Tables become cards.
- Critical actions remain reachable without crowding.

### Shared components to use

`DashboardShell`, `PPCard`, `PPButton`, `PPStatusBadge`, `BookingSummaryCard`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Provider account, verification, services, availability, bookings, inquiries, onboarding progress, messages.

### Supabase mapping if applicable

`profiles`, `providers`, `provider_services`, provider settings tables, `availability_slots`, `bookings`, `booking_requests`, `conversations`, `messages`, `payments` if earnings are shown.

### Future schema / CMS notes

Provider education/help modules may need CMS if expanded.

### Static Croatian copy examples

- H1: `Tvoj pružateljski dashboard`
- CTA: `Uredi dostupnost`, `Dovrši profil`
- Empty: `Još nema novih upita.`
- Error: `Ne možemo učitati tvoje podatke pružatelja.`

### Loading state

Shell visible; cards/tables skeleton.

### Empty state

Provider-specific next action, not generic blank slate.

### Error state

Retry, support path, no stack traces.

### Accessibility notes

Tables/cards readable by screen readers, status not color-only, forms have labels.

### SEO notes

Noindex/private app area.

### Risk level

High — provider dashboards contain business-critical logic.

### What must not be changed

Do not change provider onboarding logic, role guards, availability, booking, messages, payments, RLS/schema, or API contracts.

### Acceptance criteria

- Existing provider workflows still work.
- Visual changes do not hide required onboarding/status fields.
- Mobile management is usable.
- Validation passes.

---

## 8. Pet profile / pet passport

### Route(s)

- `/ljubimac/[id]/kartica`
- `/ljubimac/[id]/karton`
- `/ljubimac/[id]/passport`
- `/ljubimac/[id]/passport/share`

### Current likely files/components

- `app/ljubimac/[id]/kartica/page.tsx`
- `app/ljubimac/[id]/karton/page.tsx`
- `app/ljubimac/[id]/passport/page.tsx`
- `app/ljubimac/[id]/passport/share/page.tsx`

### Target page template

Pet passport template.

### Purpose of the page

Show a polished, trustworthy pet identity/health/profile card that owners can manage or share.

### Visual direction

Passport-card feel: warm cream, green header, soft chips, pet avatar/photo, structured sections, share-safe presentation.

### Desktop layout

- Header/app shell.
- Pet hero/passport card.
- Details grid: health, owner, notes, documents/updates if present.
- Share/export actions.

### Mobile layout

- Passport card first.
- Details accordion/stack.
- Sticky share/edit CTA only if safe.

### Shared components to use

`PetPassportCard`, `PetAvatar`, `PPCard`, `PPStatusBadge`, `PPButton`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Pet profile, passport info, owner profile, health records/updates if implemented, share permissions.

### Supabase mapping if applicable

`pets`, `pet_passports`, `profiles`, `pet_updates` if implemented.

### Future schema / CMS notes

Advanced medical records/documents may require future schema unless already implemented.

### Static Croatian copy examples

- H1: `Pet putovnica`
- CTA: `Podijeli putovnicu`, `Uredi podatke`
- Empty: `Dodaj osnovne podatke kako bi putovnica bila korisna.`
- Error: `Ne možemo učitati podatke ljubimca.`

### Loading state

Passport skeleton with avatar placeholder.

### Empty state

Guide owner to complete pet info.

### Error state

Retry, back to dashboard.

### Accessibility notes

Pet photo alt text, structured headings, visible focus for share/copy controls.

### SEO notes

Private/share pages need careful indexing rules depending share model; do not expose private data through public SEO.

### Risk level

High — pet and owner data privacy.

### What must not be changed

Do not change access control, share permissions, auth/session, RLS/schema, or data visibility rules.

### Acceptance criteria

- Privacy and permissions unchanged.
- Passport is readable on mobile.
- Share state is explicit.
- No private data added to SEO metadata.

---

## 9. Bookings

### Route(s)

- `/dashboard/vlasnik/rezervacije`
- `/azuriranja/[bookingId]`
- Booking-related dashboard/provider routes

### Current likely files/components

- `app/dashboard/vlasnik/rezervacije/page.tsx`
- `app/azuriranja/[bookingId]/page.tsx`
- `components/calendar/booking-modal.tsx`
- `components/calendar/availability-manager.tsx`
- `components/calendar/professional-calendar.tsx`

### Target page template

Booking / checkout template for booking views; dashboard template for booking lists.

### Purpose of the page

Show booking status, history, next steps, updates, and safe actions.

### Visual direction

Clear transactional cards, status badges, timeline/update rhythm, restrained visual style.

### Desktop layout

- Dashboard/app shell.
- Booking list/table or cards.
- Detail/update panel.
- Clear status and allowed actions.

### Mobile layout

- Booking cards stack.
- Status and next action visible at top.
- Complex calendars/lists collapse.

### Shared components to use

`BookingSummaryCard`, `PPCard`, `PPStatusBadge`, `PPButton`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Bookings, booking items, provider/user info, pet info, status, updates, calendar availability.

### Supabase mapping if applicable

`bookings`, `booking_items`, `profiles`, `pets`, `providers`, `availability_slots`, `booking_requests`.

### Future schema / CMS notes

Rich booking timeline/events may require future schema unless updates already exist.

### Static Croatian copy examples

- H1: `Moje rezervacije`
- CTA: `Pogledaj detalje`, `Pošalji poruku`
- Empty: `Još nemaš rezervacija.`
- Error: `Ne možemo učitati rezervacije.`

### Loading state

Booking list skeleton cards.

### Empty state

Encourage discovery: `Pronađi uslugu za svog ljubimca`.

### Error state

Retry and support link.

### Accessibility notes

Statuses must include text, timeline order semantic, action labels specific.

### SEO notes

Private/noindex.

### Risk level

High — booking state and user trust.

### What must not be changed

Do not alter booking status transitions, availability, cancellation/refund rules, APIs, RLS/schema, or auth.

### Acceptance criteria

- Booking state remains correct.
- No unauthorized actions appear.
- Empty/error/loading states work.
- Mobile view is clear.

---

## 10. Checkout

### Route(s)

- `/checkout/[bookingId]`
- `/checkout/[bookingId]/success`
- `/checkout/[bookingId]/cancel`

### Current likely files/components

- `app/checkout/[bookingId]/page.tsx`
- `app/checkout/[bookingId]/success/page.tsx`
- `app/checkout/[bookingId]/cancel/page.tsx`
- `components/shared/payment-button.tsx`
- `components/shared/connect-stripe-button.tsx`

### Target page template

Booking / checkout template.

### Purpose of the page

Complete or confirm payment safely with maximum clarity and minimum distraction.

### Visual direction

Trustworthy checkout card, clear booking summary, price breakdown, orange payment CTA, green confirmation states.

### Desktop layout

- Minimal header.
- Centered checkout summary and payment action.
- Side/support/trust note if needed.
- Success/cancel states as focused cards.

### Mobile layout

- Single column.
- Payment CTA visible after summary.
- Avoid sticky CTA if Stripe/payment component conflicts.

### Shared components to use

`BookingSummaryCard`, `PPCard`, `PPStatusBadge`, `PPButton`, `ErrorState`, `LoadingSkeleton`.

### Dynamic data needed

Booking, payment status, provider/user/pet summary, amount, currency, Stripe session/payment state.

### Supabase mapping if applicable

`bookings`, `booking_items`, `payments`, `profiles`, `pets`, `providers`.

### Future schema / CMS notes

None for visual polish; do not invent payment schema.

### Static Croatian copy examples

- H1: `Potvrdi rezervaciju`
- CTA: `Nastavi na plaćanje`
- Success: `Rezervacija je potvrđena.`
- Cancel: `Plaćanje nije dovršeno.`
- Error: `Ne možemo pripremiti plaćanje.`

### Loading state

Checkout summary skeleton and disabled payment CTA.

### Empty state

If booking missing: explain and link back to reservations.

### Error state

Show retry/support; never expose Stripe internals.

### Accessibility notes

Payment buttons labelled, price breakdown readable, focus states clear, errors announced.

### SEO notes

Noindex/private transactional pages.

### Risk level

High — payment flow.

### What must not be changed

Do not change Stripe logic, payment intent/session creation, webhooks, booking status transitions, refunds, APIs, env vars, or RLS/schema.

### Acceptance criteria

- Payment flow behavior unchanged.
- Price/status data accurate.
- Success/cancel states clear.
- No sensitive info exposed.

---

## 11. Messages

### Route(s)

- `/poruke`

### Current likely files/components

- `app/poruke/page.tsx`
- `components/shared/chat-widget.tsx`
- `components/shared/floating-chat.tsx`
- message API files exist under `app/api/messages/*` but must not be changed for visual redesign.

### Target page template

Messages template.

### Purpose of the page

Let users and providers communicate clearly around services/bookings.

### Visual direction

App-like layout: conversation list, active thread, rounded message bubbles, clear composer, green/orange accent states only where useful.

### Desktop layout

- Dashboard/app shell.
- Left conversation list.
- Right active thread.
- Header with participant/context.
- Composer fixed within panel.

### Mobile layout

- Conversation list first.
- Thread opens as full screen/page state.
- Composer sticky above mobile safe area.

### Shared components to use

`MessageThreadLayout`, `UserAvatar`, `PetAvatar`, `PPCard`, `PPStatusBadge`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Conversations, participants, messages, unread counts, booking/service context.

### Supabase mapping if applicable

`conversations`, `conversation_participants`, `messages`, `profiles`, `bookings`, `providers`.

### Future schema / CMS notes

Moderation/reporting may require future schema unless already implemented.

### Static Croatian copy examples

- H1: `Poruke`
- Empty: `Još nemaš razgovora.`
- Composer placeholder: `Napiši poruku...`
- Error: `Poruke se trenutno ne mogu učitati.`

### Loading state

Conversation list skeleton and thread skeleton.

### Empty state

Prompt to start from a provider/profile or booking.

### Error state

Retry, preserve typed message if possible.

### Accessibility notes

Composer labelled, messages have readable order, keyboard navigation supports list/thread, focus moves predictably.

### SEO notes

Private/noindex.

### Risk level

High — messaging privacy and real-time behavior.

### What must not be changed

Do not change message APIs, conversation permissions, auth/session, realtime subscriptions, RLS/schema, or notification logic.

### Acceptance criteria

- Existing conversations render.
- Sending/reading behavior unchanged.
- Mobile thread navigation works.
- Empty/error/loading states present.

---

## 12. Community hub

### Route(s)

- `/zajednica`
- `/zajednica/feed`
- `/zajednica/izazovi`
- `/zajednica/najbolji`
- `/zajednica/[slug]`

### Current likely files/components

- `app/zajednica/page.tsx`
- `app/zajednica/feed/page.tsx`
- `app/zajednica/izazovi/page.tsx`
- `app/zajednica/najbolji/page.tsx`
- `app/zajednica/[slug]/page.tsx`
- `components/shared/petpark/community-card.tsx`
- `components/social/post-card.tsx`

### Target page template

Community hub template.

### Purpose of the page

Make PetPark feel alive: posts, challenges, helpful community activity, and safe discovery.

### Visual direction

Warm community bento: hero, activity cards, challenge cards, pet-of-week/highlights, clear moderation/trust states.

### Desktop layout

- Header.
- Community hero.
- Main feed/highlights grid.
- Sidebar for challenges, popular topics, safety rules.
- Footer.

### Mobile layout

- Hero compact.
- Tabs/chips for feed/challenges/best.
- Cards stack.
- Composer CTA clear but not intrusive.

### Shared components to use

`CommunityActivityCard`, `PetAvatar`, `UserAvatar`, `PPCard`, `PPBadge`, `PPButton`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Posts, authors, pets, reactions, comments, challenges, moderation status.

### Supabase mapping if applicable

Community/social tables if implemented; likely `profiles`, `pets`, social posts/comments/reactions/challenges structures.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for community comments, moderation reports, challenges, pet-of-week.

### Static Croatian copy examples

- H1: `PetPark zajednica`
- CTA: `Podijeli trenutak`
- Empty: `Budi prvi koji će podijeliti priču.`
- Error: `Zajednica se trenutno ne može učitati.`

### Loading state

Feed/card skeletons.

### Empty state

Friendly community-start prompt.

### Error state

Retry and link to forum/services.

### Accessibility notes

Post actions labelled, images have alt text, reaction buttons keyboard accessible.

### SEO notes

Public hub can be indexable; user-generated details need moderation and safe metadata.

### Risk level

Medium — UGC/moderation and community state.

### What must not be changed

Do not change social APIs, moderation rules, auth/session, RLS/schema, or notification behavior.

### Acceptance criteria

- Community feels part of PetPark v2.
- UGC displayed safely.
- No fake activity counts.
- Empty/moderation states included.

---

## 13. Forum list

### Route(s)

- `/forum`
- `/forum/en`

### Current likely files/components

- `app/forum/page.tsx`
- `app/forum/en/page.tsx`
- Forum APIs under `app/api/forum/*` must not be changed for visual-only implementation.

### Target page template

Forum template.

### Purpose of the page

Help users browse topics, ask questions, and find community advice.

### Visual direction

Structured forum board with warm cards, category chips, clear “Nova tema” CTA, green headings.

### Desktop layout

- Header.
- Forum page header.
- Category/filter rail.
- Topic list/cards.
- Sidebar with guidelines/popular topics.
- Footer.

### Mobile layout

- Category chips scroll horizontally.
- Topic cards stack.
- New topic CTA prominent.

### Shared components to use

`PageHeader`, `CommunityActivityCard`, `PPCard`, `PPBadge`, `PPButton`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Forum topics, authors, categories, comment counts, last activity, likes.

### Supabase mapping if applicable

Forum topics/comments tables if implemented; `profiles` for authors.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for forum topics, replies, moderation reports.

### Static Croatian copy examples

- H1: `Forum za ljubimce`
- CTA: `Otvori novu temu`
- Empty: `Još nema tema u ovoj kategoriji.`
- Error: `Forum se trenutno ne može učitati.`

### Loading state

Topic list skeleton.

### Empty state

Encourage first question.

### Error state

Retry and community fallback.

### Accessibility notes

Topic cards as links with clear labels, category filters keyboard accessible.

### SEO notes

Forum list can be indexable; avoid indexing low-quality filtered duplicates.

### Risk level

Medium — UGC and moderation.

### What must not be changed

Do not change forum APIs, moderation behavior, auth/session, RLS/schema, or comment logic.

### Acceptance criteria

- Topic list remains data-driven.
- Category navigation works.
- Empty/error/loading states exist.
- No fake discussion counts.

---

## 14. Forum thread

### Route(s)

- `/forum/[id]`

### Current likely files/components

- `app/forum/[id]/page.tsx`
- Forum comment/like APIs under `app/api/forum/topics/[id]/*` must not be changed.

### Target page template

Forum template, thread detail variant.

### Purpose of the page

Read one discussion, replies, and safe participation actions.

### Visual direction

Thread header card, reply cards, author avatars, helpful status badges, composer area.

### Desktop layout

- Header.
- Thread title/meta.
- Main replies column.
- Sidebar with related topics/community rules.
- Reply composer if authenticated.

### Mobile layout

- Thread and replies stack.
- Composer inline or sticky only if safe.
- Related topics move below replies.

### Shared components to use

`CommunityActivityCard`, `UserAvatar`, `PPCard`, `PPBadge`, `PPButton`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Topic, author, replies/comments, likes, auth status, moderation flags.

### Supabase mapping if applicable

Forum topics/comments/likes tables if implemented; `profiles`.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for replies and moderation reports.

### Static Croatian copy examples

- CTA: `Odgovori`
- Empty replies: `Još nema odgovora. Budi prvi koji će pomoći.`
- Error: `Tema se trenutno ne može učitati.`

### Loading state

Thread header skeleton and reply skeletons.

### Empty state

Invite helpful reply.

### Error state

Retry and back to forum.

### Accessibility notes

H1 is topic title, reply actions labelled, composer has label, focus returns after submit.

### SEO notes

Thread pages can be indexable if moderated; title/meta from topic, safe OG fallback.

### Risk level

Medium — UGC and moderation.

### What must not be changed

Do not change reply APIs, like logic, moderation, auth/session, RLS/schema, or notification behavior.

### Acceptance criteria

- Existing replies render accurately.
- Composer behavior unchanged.
- Moderation states visible if present.
- Mobile reading is comfortable.

---

## 15. Lost/found pets

### Route(s)

- `/izgubljeni`
- `/izgubljeni/[id]`
- `/izgubljeni/[id]/letak`
- `/izgubljeni/prijavi`
- EN variants

### Current likely files/components

- `app/izgubljeni/page.tsx`
- `app/izgubljeni/[id]/page.tsx`
- `app/izgubljeni/[id]/letak/page.tsx`
- `app/izgubljeni/prijavi/page.tsx`
- `components/shared/petpark/lost-pet-card.tsx`
- `components/shared/lost-pets-map.tsx`

### Target page template

Lost/found template.

### Purpose of the page

Help people report, search, share, and resolve lost/found pet cases quickly and responsibly.

### Visual direction

Urgent but not panicky: cream base, red/orange lost accents, green found/success states, map/list cards, clear report CTA.

### Desktop layout

- Header.
- Urgent page hero with report CTA.
- Map/list split or grid.
- Filters for location/status/species.
- Safety guidance and flyer/share section.

### Mobile layout

- Report CTA near top.
- Map/list toggle if map exists.
- Cards stack.
- Share/report actions accessible.

### Shared components to use

`PageHero`, `LostPetCard`, `PetAvatar`, `PPStatusBadge`, `PPButton`, `PPCard`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Lost/found pet listings, location, status, photos, contact/relay info, sightings, updates, alerts.

### Supabase mapping if applicable

Lost pets tables if implemented; `pets`, `profiles`, alert/update/sighting tables, possibly `waitlist_requests` only if used.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for lost/found alerts, sightings, updates, moderation reports.

### Static Croatian copy examples

- H1: `Izgubljeni i pronađeni ljubimci`
- CTA: `Prijavi izgubljenog ljubimca`
- Empty: `Trenutno nema prijava za ovu lokaciju.`
- Error: `Ne možemo učitati prijave.`

### Loading state

Map/list skeleton with card placeholders.

### Empty state

Encourage widening location or reporting a pet.

### Error state

Retry and emergency guidance where appropriate.

### Accessibility notes

Map must have list alternative, pet photos alt text, urgent colors paired with text labels.

### SEO notes

List and detail pages can be indexable if privacy-safe; detail metadata should avoid exposing private contact data.

### Risk level

High — urgency, privacy, contact safety.

### What must not be changed

Do not change contact relay, alert logic, status transitions, APIs, auth/session, RLS/schema, or privacy behavior.

### Acceptance criteria

- Lost/found statuses accurate.
- Map has list fallback.
- Contact/share behavior unchanged.
- No fake urgency/counts.

---

## 16. Adoption

### Route(s)

- `/udomljavanje`
- `/udomljavanje/[id]`
- `/udomljavanje/udruga/[id]`
- `/udruge`, `/udruge/[slug]`
- `/apelacije`, `/apelacije/[slug]`
- EN variants

### Current likely files/components

- `app/udomljavanje/page.tsx`
- `app/udomljavanje/[id]/page.tsx`
- `app/udomljavanje/udruga/[id]/page.tsx`
- `app/udruge/page.tsx`
- `app/udruge/[slug]/page.tsx`
- `app/apelacije/page.tsx`
- `app/apelacije/[slug]/page.tsx`
- adoption/rescue dashboard routes

### Target page template

Adoption/rescue template.

### Purpose of the page

Help users discover adoptable pets, learn about organizations, and make safe inquiries/support actions.

### Visual direction

Warm, hopeful cards; pet-first visual hierarchy; orange adoption CTA; organization trust cards; no fake urgency.

### Desktop layout

- Header.
- Adoption hero.
- Filterable pet grid.
- Organization/rescue highlights.
- Detail pages with pet story, facts, inquiry CTA.
- Footer.

### Mobile layout

- Cards stack or 2-column small pet grid.
- Filters in drawer.
- Inquiry CTA clear near pet details.

### Shared components to use

`PageHero`, `PetAvatar`, `ServiceCard`, `PPCard`, `PPBadge`, `PPButton`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Adoption listings, pet details, rescue organization, inquiry status, photos, location, adoption status.

### Supabase mapping if applicable

Adoption/rescue listing tables if implemented, `profiles`, `pets`, inquiry tables.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for adoption listings, rescue organizations, appeals, inquiries, moderation.

### Static Croatian copy examples

- H1: `Udomi ljubav`
- CTA: `Pošalji upit za udomljavanje`
- Empty: `Trenutno nema ljubimaca za ove filtere.`
- Error: `Ne možemo učitati udomljavanje.`

### Loading state

Pet grid skeleton.

### Empty state

Suggest changing filters or following rescue organizations.

### Error state

Retry and link to community.

### Accessibility notes

Pet photos alt text, filters labelled, status text visible, inquiry forms labelled.

### SEO notes

Adoption public pages can be strong SEO; detail pages need safe, factual metadata and OG pet photo if allowed.

### Risk level

High — animal welfare, inquiries, rescue data.

### What must not be changed

Do not change inquiry APIs, rescue verification, auth/session, RLS/schema, moderation, or contact privacy.

### Acceptance criteria

- Listings are real and status accurate.
- Inquiry path unchanged.
- Empty/error/loading states included.
- Mobile filter/details usable.

---

## 17. Blog homepage

### Route(s)

- `/blog`

### Current likely files/components

- `app/blog/page.tsx`
- `components/shared/petpark/blog-card.tsx`

### Target page template

Blog template.

### Purpose of the page

Position blog as “PetPark vodič” with practical advice connected to services and community.

### Visual direction

Editorial cream page with featured article, category chips, rounded article cards, green headings, orange read/CTA accents.

### Desktop layout

- Header.
- Editorial hero.
- Featured article.
- Category chips.
- Article grid/list.
- Related CTA back to services/community.
- Footer.

### Mobile layout

- Featured article first.
- Chips horizontal scroll.
- Article cards stack.

### Shared components to use

`PageHero`, `AdviceCard`, `BlogArticleCard`, `PPCard`, `PPBadge`, `PPButton`, `LoadingSkeleton`, `EmptyState`, `ErrorState`.

### Dynamic data needed

Posts, categories, authors, dates, read time, featured flag.

### Supabase mapping if applicable

Blog tables if implemented; otherwise current static/source content.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for blog posts/categories/authors/comments.

### Static Croatian copy examples

- H1: `PetPark vodič`
- CTA: `Pročitaj vodič`
- Empty: `Uskoro stižu novi savjeti.`
- Error: `Ne možemo učitati članke.`

### Loading state

Featured/card skeletons.

### Empty state

Point to services/community.

### Error state

Retry and fallback featured static links if available.

### Accessibility notes

Article cards as semantic links, image alt text, clear category chip labels.

### SEO notes

- Title: `PetPark vodič — savjeti za ljubimce`
- Meta: practical advice for care, training, grooming, safety, adoption.
- OG for featured article or brand fallback.

### Risk level

Low — mostly content presentation.

### What must not be changed

Do not change comment moderation, CMS/data source, APIs, or schema.

### Acceptance criteria

- Blog feels editorial, not generic SEO dump.
- Article metadata present.
- Category navigation usable.
- No invented articles.

---

## 18. Blog article

### Route(s)

- `/blog/[slug]`

### Current likely files/components

- `app/blog/[slug]/page.tsx`
- `components/shared/petpark/blog-card.tsx`

### Target page template

Blog template, article detail variant.

### Purpose of the page

Deliver useful pet-care content and route readers to relevant services/community.

### Visual direction

Readable editorial layout, cream background, green title, warm callout cards, related article/service CTAs.

### Desktop layout

- Header.
- Article hero with category/date/read time.
- Content column with optional sidebar/related articles.
- CTA blocks.
- Footer.

### Mobile layout

- Single readable column.
- Related content below article.
- Keep line length comfortable.

### Shared components to use

`PageHero`, `AdviceCard`, `BlogArticleCard`, `PPCard`, `PPBadge`, `PPButton`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Article, author, category, date, related posts, comments if implemented.

### Supabase mapping if applicable

Blog/comment tables if implemented; `profiles` if authors are users.

### Future schema / CMS notes

Requires future schema or CMS unless already implemented for blog posts, comments, related content.

### Static Croatian copy examples

- CTA: `Pronađi povezanu uslugu`
- Empty: `Članak nije pronađen.`
- Error: `Članak se trenutno ne može učitati.`

### Loading state

Article title and paragraph skeleton.

### Empty state

Not-found style with link back to blog.

### Error state

Retry and back to blog.

### Accessibility notes

One H1, semantic article, alt text for images, headings in order, readable contrast.

### SEO notes

Unique title/meta/H1, article OG image, structured article metadata if supported.

### Risk level

Low — content page, but comments/UGC can increase risk.

### What must not be changed

Do not change comments APIs, moderation, CMS/data source, schema, or routing contracts.

### Acceptance criteria

- Article remains readable and factual.
- Related links useful.
- SEO metadata preserved/improved.
- No content invented.

---

## 19. Login/register/onboarding

### Route(s)

- `/prijava`
- `/registracija`
- `/zaboravljena-lozinka`
- `/nova-lozinka`
- `/onboarding/provider`
- `/onboarding/publisher-type`
- provider onboarding dashboard routes

### Current likely files/components

- `app/prijava/page.tsx`
- `app/registracija/page.tsx`
- `app/zaboravljena-lozinka/page.tsx`
- `app/nova-lozinka/page.tsx`
- `app/onboarding/provider/page.tsx`
- `app/onboarding/publisher-type/page.tsx`

### Target page template

Auth/onboarding template.

### Purpose of the page

Authenticate users and guide owners/providers through account setup without friction.

### Visual direction

Split or centered auth card, official logo, cream background, green headings, orange primary submit, clear errors.

### Desktop layout

- Minimal header/logo.
- Auth card and optional supportive side panel.
- Form fields, social login if existing, help links.

### Mobile layout

- Single column full-width card.
- Large touch fields/buttons.
- Avoid decorative side panels.

### Shared components to use

`PetParkLogo`, `PPCard`, `PPButton`, `PPStatusBadge`, `EmptyState`, `LoadingSkeleton`, `ErrorState`.

### Dynamic data needed

Auth state, form state, onboarding progress, provider type choices.

### Supabase mapping if applicable

`profiles`, `providers`, provider settings tables, auth-managed users.

### Future schema / CMS notes

Onboarding education/help copy may become CMS later; current auth data should remain unchanged.

### Static Croatian copy examples

- H1: `Prijavi se u PetPark`
- CTA: `Prijava`, `Stvori račun`
- Empty/onboarding: `Odaberi kako želiš koristiti PetPark.`
- Error: `Provjeri podatke i pokušaj ponovno.`

### Loading state

Submit button loading state, form remains stable.

### Empty state

For onboarding choice missing, explain choices clearly.

### Error state

Inline form errors, no clearing entered data.

### Accessibility notes

Labels for every input, error messages associated with fields, focus first invalid field, touch targets 44px.

### SEO notes

Auth pages generally noindex or minimal metadata.

### Risk level

High — auth/session and onboarding logic.

### What must not be changed

Do not change auth/session logic, Supabase auth, role assignment, provider onboarding business rules, APIs, env vars, or middleware.

### Acceptance criteria

- Auth behavior unchanged.
- Forms preserve values on error.
- Errors are clear and accessible.
- Official logo only.

---

## 20. Footer / global shell

### Route(s)

- Applies globally to public routes and selected app routes.

### Current likely files/components

- `components/shared/navbar.tsx`
- `components/shared/footer.tsx`
- `components/shared/glass-navbar.tsx`
- `components/shared/public-page-shell.tsx`
- `components/shared/brand-logo.tsx`
- `components/shared/brand/petpark-logo.tsx`
- `app/layout.tsx`

### Target page template

Global shell supporting all templates.

### Purpose of the page

Provide consistent navigation, trust, language access, auth actions, and route discovery without overwhelming users.

### Visual direction

Cream/white sticky header, official logo, green nav text, orange primary action, rounded mobile sheet, footer with service/community/content clusters.

### Desktop layout

- Header with logo, service-first nav, community/content links, auth/dashboard action.
- Footer with columns: services, community, company, legal/support.
- Avoid duplicate/competing logos.

### Mobile layout

- Compact header.
- Mobile menu/sheet with grouped links.
- Bottom nav only if useful and not conflicting with header.

### Shared components to use

`SiteHeader`, `SiteFooter`, `PetParkLogo`, `PPButton`, `PPBadge`, `MobileNav`, `ErrorState` where needed.

### Dynamic data needed

Auth state, unread counts if shown, locale/language state.

### Supabase mapping if applicable

`profiles`, `conversations`, `messages` only if shell shows user/unread info.

### Future schema / CMS notes

Footer editorial links may benefit from CMS later; not required.

### Static Croatian copy examples

- Nav: `Usluge`, `Zajednica`, `Izgubljeni`, `Udomljavanje`, `Blog`
- CTA: `Pronađi uslugu`
- Footer: `PetPark — zajednica i usluge za ljubimce.`

### Loading state

Avoid layout shift; user/auth actions can skeleton or fallback.

### Empty state

Not applicable globally; avoid empty nav areas.

### Error state

If auth action fails, fallback to login/dashboard link.

### Accessibility notes

Semantic nav/footer, skip link preserved, mobile menu focus trap, logo alt `PetPark`.

### SEO notes

Footer links should support crawlability; avoid overstuffing.

### Risk level

Medium — global shell affects all pages and auth nav.

### What must not be changed

Do not change auth/session logic, protected route behavior, middleware, locale routing, or global API calls.

### Acceptance criteria

- Official logo used.
- Navigation works desktop/mobile.
- No protected routes exposed incorrectly.
- Footer supports key route discovery.

---

## 21. Mobile navigation

### Route(s)

- Applies globally, especially public mobile routes and dashboards.

### Current likely files/components

- `components/shared/bottom-nav.tsx`
- `components/shared/navbar/mobile-sheet.tsx`
- `components/shared/navbar.tsx`
- `components/shared/navbar/config.tsx`
- `components/shared/navbar/desktop-nav.tsx`
- `components/shared/navbar/desktop-actions.tsx`

### Target page template

Global shell mobile navigation pattern.

### Purpose of the page

Help mobile users reach services, community, urgent flows, dashboard/messages, and account actions quickly.

### Visual direction

Simple warm sheet/bottom pattern with clear icons/labels, green active state, orange urgent/primary action when appropriate.

### Desktop layout

Not applicable except shared route config should align with desktop nav.

### Mobile layout

- Header hamburger/menu sheet.
- Optional bottom nav for core app actions.
- Urgent lost-pet/report path visible but not alarmist.
- Avoid more than 4–5 bottom nav items.

### Shared components to use

`MobileNav`, `PetParkLogo`, `PPButton`, `PPBadge`, `PPStatusBadge`.

### Dynamic data needed

Auth state, unread messages, dashboard role, locale/language.

### Supabase mapping if applicable

`profiles`, `conversations`, `messages` only if unread/profile state shown.

### Future schema / CMS notes

None unless nav becomes CMS-managed.

### Static Croatian copy examples

- Items: `Početna`, `Usluge`, `Zajednica`, `Poruke`, `Profil`
- Urgent: `Izgubljen ljubimac?`

### Loading state

Use stable nav with auth fallback; avoid shifting layout.

### Empty state

Not applicable.

### Error state

If auth state uncertain, show safe public nav and login CTA.

### Accessibility notes

Menu button labelled, focus trap in sheet, touch targets 44px, active state not color-only.

### SEO notes

Mobile nav links should match crawlable primary public routes where possible.

### Risk level

Medium — global UX and auth-aware routing.

### What must not be changed

Do not change auth/session, route guards, middleware, message APIs, or protected navigation rules.

### Acceptance criteria

- Mobile nav is clear and reachable.
- Auth-aware links remain correct.
- No conflicts with page sticky CTAs.
- Keyboard/screen-reader interaction works.

---

# Known route coverage notes / deferred routes

The 21 route groups above cover the major redesign surfaces requested for PetPark v2. The codebase also contains routes that are not primary redesign targets in this blueprint and should be handled later with separate approval:

- Admin/internal routes: `/admin`, `/admin/founder-dashboard`, `/admin/marketing`
- Commerce/shop routes: `/shop`, `/shop/[slug]`, `/shop/kosarica`
- Static/company/legal/support routes: `/o-nama`, `/kontakt`, `/faq`, `/privatnost`, `/uvjeti`, EN variants
- Marketing/provider acquisition routes: `/postani-sitter`, `/postani-sitter/oglas`, `/verifikacija`, EN variants
- Special discovery/content routes: `/dog-friendly`, `/ai-matching`, `/hitna-pomoc`, `/hitno`, `/offline`, `/hard-404`
- Preview routes: `/redizajn-preview`, `/redizajn-preview/listinzi`, `/redizajn-preview/usluge`

Rules for deferred routes:

- Do not redesign these opportunistically while implementing the 21 approved groups.
- Do not touch admin, commerce, legal, verification, auth, payments, bookings, messages, APIs, Supabase, middleware, or deployment logic as part of visual rollout.
- If a deferred public route is visually updated later, it must follow the same PetPark v2 shell, typography, tokens, loading/empty/error states, accessibility rules, and official-logo-only policy.
- Shop/commerce surfaces require a separate checkout/payment risk review before any visual polish.
- Admin/internal surfaces require a separate operational safety review before any redesign.

---

# Future implementation grouping

## Phase 0 — Design Book and documentation placement

Documentation only.

## Phase 1 — Brand foundation

- Official logo
- Design tokens
- Base UI primitives

## Phase 2 — Homepage v2

- Smart Assistant
- Service Circle
- Quick Action Rail
- Live Community
- Advice
- Why PetPark

## Phase 3 — Global shell

- Navbar
- Footer
- Mobile navigation

## Phase 4 — Service discovery

- Usluge overview
- Service detail pages
- Search/results

## Phase 5 — Profiles and pet passport

- Service/provider profiles
- User profile/dashboard
- Pet profile
- Pet passport

## Phase 6 — Community

- Community hub
- Forum list
- Forum thread
- Lost/found
- Adoption

## Phase 7 — Content

- Blog homepage
- Blog article

## Phase 8 — App/dashboard

- Owner dashboard
- Provider dashboards
- Messages
- Bookings

## Phase 9 — Checkout visual polish only

- Checkout
- Success
- Cancel/error

## Phase 10 — Visual QA and consistency pass

Final visual and technical quality pass across desktop, tablet, and mobile.

# Do not start implementation until approved

This blueprint must be reviewed and approved before any non-homepage page redesign starts.
