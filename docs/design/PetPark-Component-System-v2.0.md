# PetPark Official Design Book v2.0

**Direction:** Smart Assistant + Service Circle  
**Product model:** service-first + community-first  
**Primary question:** “Što treba tvom ljubimcu danas?”  
**Status:** Official working specification for PetPark.hr redesign  
**Generated for:** PetPark.hr Next.js App Router codebase

---

## 1. Component architecture

The PetPark v2 UI system should live close to the existing public redesign folder:

```txt
components/shared/petpark/
```

Recommended future substructure:

```txt
components/shared/petpark/brand/
components/shared/petpark/primitives/
components/shared/petpark/home-v2/
components/shared/petpark/service/
components/shared/petpark/community/
components/shared/petpark/profile/
components/shared/petpark/dashboard/
```

Do not move data-fetching logic while building visual components. Keep components mostly presentational unless they already own data.

## 2. Core primitives

### PPButton

Purpose: unified button system.

Props:

```ts
type PPButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
type PPButtonSize = "sm" | "md" | "lg" | "icon";

type PPButtonProps = {
  variant?: PPButtonVariant;
  size?: PPButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  href?: string;
  children: React.ReactNode;
};
```

Rules:

- Primary CTA is orange.
- Secondary CTA is green.
- Outline is green border on warm/white surface.
- Use focus-visible rings.

### PPCard

```ts
type PPCardProps = {
  variant?: "surface" | "warm" | "mint" | "orange-soft" | "transparent";
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  children: React.ReactNode;
};
```

Rules:

- Cards use `--pp-radius-lg` by default.
- Interactive cards have hover lift but no aggressive movement.
- Use real grid/flex layout, never hard absolute text placement.

### PPBadge / PPStatusBadge

```ts
type PPStatus =
  | "default"
  | "lost"
  | "found"
  | "adoption"
  | "forum"
  | "blog"
  | "urgent"
  | "available"
  | "unavailable";
```

Use status badges consistently:

```txt
Nestao / Izgubljen = lost
Pronađen = found
Udomljavanje = adoption
Forum = forum
Blog = blog
```

## 3. Brand components

### PetParkLogo

Canonical component.

```ts
type PetParkLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};
```

Rules:

- Source: `/brand/petpark-logo.svg`.
- Do not inline new SVG variants.
- Do not recolor.

## 4. Homepage v2 components

### HomeV2Page

Composes homepage sections.

```txt
HomeV2Page
  SiteHeader
  HomeHeroSmartAssistant
    PetNeedWizard
    ServiceOrbit
  QuickActionRail
  LiveCommunityCard
  AdviceCard
  WhyPetParkCard
  AppPromoStrip / CommunityStrip
```

### HomeHeroSmartAssistant

Purpose: main homepage hero.

Props:

```ts
type HomeHeroSmartAssistantProps = {
  headline: string;
  subtitle: string;
  services: ServiceOrbitItem[];
  defaultCity?: string;
  defaultPetType?: PetType;
};
```

Rules:

- Desktop: two-column layout, wizard left and orbit right.
- Mobile: orbit collapses into service grid; wizard appears first.
- Hero should not include provider cards.

### PetNeedWizard

Purpose: interactive-looking or actual first-step assistant.

Props:

```ts
type PetType = "dog" | "cat" | "small" | "bird" | "reptile" | "other";
type ServiceCode =
  | "boarding"
  | "walking"
  | "grooming"
  | "training"
  | "lost_found"
  | "adoption";

type PetNeedWizardProps = {
  selectedPetType?: PetType;
  selectedService?: ServiceCode;
  city?: string;
  onPetTypeChange?: (petType: PetType) => void;
  onServiceChange?: (service: ServiceCode) => void;
  onCityChange?: (city: string) => void;
  onSubmit?: () => void;
  mode?: "static" | "interactive";
};
```

States:

```txt
idle
selected
loading
error
```

Microcopy:

```txt
Reci nam što trebaš
1. Odaberi ljubimca
2. Što trebaš?
3. Gdje?
Nastavi
```

### ServiceOrbit

Signature visual.

Props:

```ts
type ServiceOrbitItem = {
  code: ServiceCode;
  label: string;
  icon: React.ReactNode;
  tone?: "green" | "orange" | "mint" | "danger";
  href?: string;
};

type ServiceOrbitProps = {
  items: ServiceOrbitItem[];
  centerImage?: {
    src: string;
    alt: string;
  };
  variant?: "photo" | "illustrated" | "segmented";
};
```

Rules:

- Exactly 6 primary items on desktop.
- Do not put long text around the orbit.
- Mobile uses `MobileServiceGrid`.
- Labels must be readable at 1280 desktop.

### QuickActionRail

Purpose: immediate action shortcuts under hero.

Items:

```txt
Rezerviraj šetnju
Pronađi čuvanje
Naruči grooming
Trening & savjeti
Hitno: izgubljen?
Udomi ljubav
```

Props:

```ts
type QuickAction = {
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
};
```

### LiveCommunityCard

Purpose: show recent activity across community, lost/found, adoption, forum.

Props:

```ts
type CommunityActivity = {
  id: string;
  title: string;
  meta: string;
  status?: "lost" | "found" | "adoption" | "forum" | "tip";
  avatarUrl?: string;
  href: string;
  timeLabel?: string;
};
```

### AdviceCard

Purpose: blog/advice teaser.

```ts
type AdviceItem = {
  title: string;
  category: string;
  readTime?: string;
  imageUrl?: string;
  href: string;
};
```

### WhyPetParkCard

Purpose: platform trust and benefit points.

Default items:

```txt
Provjereno i sigurno
Zajednica koja brine
Uštedi vrijeme
Dobro za sve
```

Use platform-level trust language. Avoid turning “provjereni pružatelji” into the main homepage section.

## 5. Public page components

### PageHero

```ts
type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryAction?: CTA;
  secondaryAction?: CTA;
  visual?: React.ReactNode;
};
```

### ServiceCard

```ts
type ServiceCardProps = {
  service: ServiceCode;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  imageUrl?: string;
  ctaLabel?: string;
};
```

### CommunityActivityCard

For lost/found/forum/adoption feed.

### BlogArticleCard

For blog cards and article teasers.

## 6. Profile/page components

### ProviderProfileHero

```ts
type ProviderProfileHeroProps = {
  name: string;
  city?: string;
  profileImageUrl?: string;
  serviceSummary: string;
  ratingAvg?: number;
  reviewCount?: number;
  responseTimeLabel?: string;
  primaryAction: CTA;
};
```

### PetPassportCard

```ts
type PetPassportCardProps = {
  petName: string;
  species: string;
  breed?: string;
  ageLabel?: string;
  weightKg?: number;
  sex?: string;
  photoUrl?: string;
  microchipNumber?: string;
  vetName?: string;
  emergencyContact?: string;
};
```

### BookingSummaryCard

For checkout/booking flows. Must not change booking logic.

### MessageThreadLayout

For `/poruke`; presentation only unless assigned.

## 7. Empty/loading/error states

Every dynamic route needs:

```txt
LoadingSkeleton
EmptyState
ErrorState
```

Default empty state copy examples:

```txt
Još nema aktivnosti.
Kad se pojave nove objave, vidjet ćeš ih ovdje.
```

```txt
Nismo pronašli opcije za odabrane kriterije.
Pokušaj promijeniti grad, datum ili uslugu.
```

## 8. Accessibility rules

- All icon-only buttons require `aria-label`.
- Service orbit items need visible text and accessible names.
- Focus states must be visible.
- Color contrast must pass normal text minimums.
- Images require useful `alt` text.
- Wizard step state must not be communicated by color only.
