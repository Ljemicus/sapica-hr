# PetPark Official Design Book v2.0

**Direction:** Smart Assistant + Service Circle  
**Product model:** service-first + community-first  
**Primary question:** “Što treba tvom ljubimcu danas?”  
**Status:** Official working specification for PetPark.hr redesign  
**Generated for:** PetPark.hr Next.js App Router codebase

---

## 1. Template system overview

Every route should map to a template. Do not design each page from scratch.

```txt
A. Public service overview
B. Service detail / category
C. Search/results
D. Provider/service profile
E. User dashboard
F. Pet profile / pet passport
G. Booking / checkout
H. Messages
I. Community hub
J. Forum list/thread
K. Lost/found pets
L. Adoption/rescue
M. Blog home/article
N. Provider dashboards
O. Auth/onboarding
```

## 2. Homepage template

Route:

```txt
/
```

Current audited entry:

```txt
app/page.tsx → components/shared/petpark/homepage-redesign.tsx
```

Target sections:

```txt
SiteHeader
HomeHeroSmartAssistant
  PetNeedWizard
  ServiceOrbit
QuickActionRail
LiveCommunityCard
AdviceCard
WhyPetParkCard
AppPromoStrip or CommunityStrip
SiteFooter
```

Do not include a provider listing block as the main homepage section.

## 3. Public service overview template

Routes:

```txt
/pretraga
/njega
/dresura
/veterinari
/dog-friendly
```

Target layout:

```txt
PageHero
Service/filter bar
Results/listing cards
Optional map/list switch
FAQ or trust block
Community/help teaser
```

Visual direction:

- More functional than homepage.
- Use service-first language: “Dostupne opcije”, “Pronađi uslugu”, “Odaberi što trebaš”.
- Keep filters readable and sticky on desktop/tablet where useful.

## 4. Service detail/category template

Suggested routes:

```txt
/usluge/cuvanje
/usluge/setnja
/usluge/grooming
/usluge/trening
/izgubljeni
/udomljavanje
```

Current equivalents may be `/njega`, `/dresura`, `/izgubljeni`, `/udomljavanje`.

Target layout:

```txt
ServiceHero
HowItWorks
WhatIsIncluded
OptionsNearYou / CTA to search
Community proof
FAQ
CTASection
```

## 5. Provider/service profile template

Routes:

```txt
/sitter/[id]
/groomer/[id]
/trener/[id]
/veterinari/[slug]
```

Target layout:

```txt
ProfileHeroCard
ServiceAndPriceCards
AvailabilityPreview
AboutExperience
PetPreferences
Reviews
TrustNote
StickyMobileCTA
```

Rules:

- Do not over-emphasize “verified” if all public profiles pass platform checks.
- Use platform-level trust note.
- Preserve data fetching and booking CTAs.

## 6. User dashboard template

Routes:

```txt
/dashboard/vlasnik
/dashboard/vlasnik/rezervacije
```

Target layout:

```txt
DashboardShell
WelcomeCard
UpcomingBookingCard
MyPetsCard
MessagesShortcut
RecommendedNextActions
NearbyCommunityAlerts
```

Dashboard is app-like: less decoration, more clarity.

## 7. Pet passport template

Routes:

```txt
/ljubimac/[id]/kartica
/ljubimac/[id]/karton
/ljubimac/[id]/passport
/ljubimac/[id]/passport/share
```

Target layout:

```txt
PetPassportHero
BasicInfoGrid
HealthAndVetCard
EmergencyContactCard
SpecialNeedsCard
BehaviorNotesCard
DocumentsCard
ShareModeBanner
```

Visual feeling: digital pet document, warm but structured.

## 8. Booking / checkout template

Routes:

```txt
/checkout/[bookingId]
/checkout/[bookingId]/success
/checkout/[bookingId]/cancel
```

Target layout:

```txt
CheckoutShell
StepProgress
BookingSummaryCard
PetSummaryCard
ProviderSummaryCard
PriceSummary
PaymentState
Success/Cancel/Error panels
```

Hard rule: Stripe and booking logic are high risk. Visual-only changes unless explicitly approved.

## 9. Messages template

Route:

```txt
/poruke
```

Target layout:

```txt
MessagesShell
ConversationList
ActiveThread
BookingContextCard
ParticipantMiniCard
MessageBubble
MessageInput
MobileThreadSwitcher
```

## 10. Community hub template

Routes:

```txt
/zajednica
/zajednica/feed
/zajednica/izazovi
/zajednica/najbolji
/zajednica/[slug]
```

Target layout:

```txt
CommunityHero
QuickAccessCards
ActivityFeed
FeaturedStories
ModerationSafetyNote
CTASection
```

Quick access:

```txt
Forum
Izgubljeni/pronađeni
Udomljavanje
Savjeti
```

## 11. Forum template

Routes:

```txt
/forum
/forum/[id]
```

Forum list:

```txt
ForumHero
CategoryChips
TopicList
PinnedTopics
CreateTopicCTA
```

Thread:

```txt
ThreadHeader
AuthorCard
PostContent
ReplyList
HelpfulAnswerState
ReplyInput
ModerationActions
```

## 12. Lost/found template

Routes:

```txt
/izgubljeni
/izgubljeni/[id]
/izgubljeni/prijavi
```

Target layout:

```txt
LostFoundHero
LostFoundToggle
LocationFilter
PetAlertCards
MapPlaceholder / optional map
CreateAlertCTA
SafetyNote
```

Status colors:

```txt
Nestao = danger/warm red
Pronađen = success green
Hitno = controlled warning
```

## 13. Adoption/rescue template

Routes:

```txt
/udomljavanje
/udomljavanje/[id]
/udomljavanje/udruga/[id]
/udruge
/udruge/[slug]
/dashboard/rescue
/dashboard/adoption
```

Target layout:

```txt
AdoptionHero
AnimalFilters
AdoptionPetCards
OrganizationBadge
AdoptionDetail
ContactCTA
RescueDashboardShell
```

## 14. Blog template

Routes:

```txt
/blog
/blog/[slug]
```

Blog home:

```txt
BlogHero
FeaturedArticle
CategoryFilters
ArticleGrid
CommunityCTA
```

Article:

```txt
ArticleHeader
HeroImage
ContentBody
TableOfContents optional
RelatedArticles
CTA to services/community
```

## 15. Provider dashboards template

Routes:

```txt
/dashboard/sitter
/dashboard/sitter/onboarding
/dashboard/sitter/setnja
/dashboard/groomer
/dashboard/groomer/onboarding
/dashboard/trainer
/dashboard/breeder
```

Target layout:

```txt
ProviderDashboardShell
OverviewStats
UpcomingBookings
ServicesCard
AvailabilityCard
ReviewsCard
MessagesCard
PayoutStatus optional
QuickActions
```

## 16. Auth/onboarding template

Routes:

```txt
/prijava
/registracija
/nova-lozinka
/zaboravljena-lozinka
/postani-sitter
```

Rules:

- Use official logo only.
- Keep forms simple and accessible.
- Do not duplicate inline logos.
- Do not change auth logic.
