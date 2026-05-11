# PetPark QA Visual Checklist v2.0

## 1. Required automated checks

Run before every redesign PR is considered ready:

```bash
npm run type-check
npm run lint
npm run build
```

Run tests when changes touch app behavior:

```bash
npm run test
```

Do not run deploy or DB migration scripts as part of visual QA unless explicitly instructed.

## 2. Required screen widths

Manual or automated screenshots must be checked at:

```txt
1440px desktop
1280px laptop
1024px tablet landscape
768px tablet portrait
430px large mobile
390px common mobile
375px small mobile
```

## 3. Global visual checklist

- [ ] Official PetPark logo only.
- [ ] No generated or fake logos.
- [ ] Header is aligned and not cramped.
- [ ] Navigation items are readable.
- [ ] CTA buttons are visually distinct.
- [ ] Page uses PetPark tokens.
- [ ] No random one-off colors.
- [ ] No text overlap.
- [ ] No clipped card content.
- [ ] No horizontal scroll on mobile.
- [ ] Touch targets at least 44px high on mobile.
- [ ] Focus-visible states exist.
- [ ] Hover states exist on desktop interactive elements.
- [ ] Loading states do not shift layout excessively.
- [ ] Empty states are useful and in Croatian.
- [ ] Error states are readable and calm.

## 4. Homepage v2 checklist

- [ ] Hero question is visible: “Što treba tvom ljubimcu danas?” or approved alternative.
- [ ] PetNeedWizard is visible above fold.
- [ ] ServiceOrbit appears on desktop right side.
- [ ] ServiceOrbit has six items only:
  - [ ] Čuvanje
  - [ ] Šetnja
  - [ ] Grooming
  - [ ] Trening
  - [ ] Izgubljeni
  - [ ] Udomljavanje
- [ ] ServiceOrbit labels are readable at 1280px.
- [ ] Desktop orbit does not appear tiny on mobile.
- [ ] Mobile uses service grid or wizard.
- [ ] QuickActionRail is usable and not cramped.
- [ ] LiveCommunityCard is clear and not fake-count heavy.
- [ ] Advice/blog card has readable thumbnails/titles.
- [ ] WhyPetParkCard uses platform-level trust wording.

## 5. Mobile homepage checklist

- [ ] Header fits 375px.
- [ ] No nav text overflow.
- [ ] Wizard uses stacked layout.
- [ ] CTA is full width or very easy to tap.
- [ ] Service options appear as grid/chips.
- [ ] Cards stack vertically.
- [ ] AppPromoStrip does not overflow.

## 6. Public service pages checklist

- [ ] Filters are usable on mobile.
- [ ] Filter drawer or stacked filters work.
- [ ] Results cards are readable.
- [ ] Empty state shown when no results.
- [ ] Loading skeleton shown during fetch.
- [ ] Map/list layout does not break tablet.

## 7. Profiles checklist

- [ ] Primary CTA visible.
- [ ] Service/pricing cards readable.
- [ ] Reviews section does not overflow.
- [ ] Mobile sticky CTA does not cover content.
- [ ] Platform trust note is accurate.

## 8. Pet passport checklist

- [ ] Pet photo/name prominent.
- [ ] Sensitive details not accidentally public in share view.
- [ ] Edit/share controls are clear.
- [ ] Mobile layout is document-like but readable.

## 9. Community/forum checklist

- [ ] Topic cards readable.
- [ ] Create post CTA visible.
- [ ] Report/moderation actions preserved.
- [ ] Lost/found status colors are clear.
- [ ] Urgent copy is calm and helpful.

## 10. Blog checklist

- [ ] Article titles readable.
- [ ] Category/read-time metadata visible.
- [ ] Article body has good line length.
- [ ] Related articles use consistent cards.
- [ ] SEO metadata preserved.

## 11. Dashboard/app checklist

- [ ] App shell does not feel like marketing homepage.
- [ ] Critical actions are easy to find.
- [ ] Protected state preserved.
- [ ] Role-specific navigation preserved.
- [ ] Messages and bookings remain functional.

## 12. Accessibility checklist

- [ ] Color contrast meets WCAG AA where possible.
- [ ] Buttons have accessible names.
- [ ] Images have alt text.
- [ ] Form fields have labels.
- [ ] Keyboard navigation works.
- [ ] Focus order is logical.
- [ ] Motion is not essential to understand content.

## 13. Release checklist

- [ ] Type-check passes.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] Screenshots reviewed.
- [ ] Vercel preview reviewed.
- [ ] No protected logic touched unexpectedly.
- [ ] No env values exposed.
- [ ] No DB migrations included unless separately approved.
