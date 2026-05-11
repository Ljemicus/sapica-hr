# PetPark Official Design Book v2.0

**Direction:** Smart Assistant + Service Circle  
**Product model:** service-first + community-first  
**Primary question:** “Što treba tvom ljubimcu danas?”  
**Status:** Official working specification for PetPark.hr redesign  
**Generated for:** PetPark.hr Next.js App Router codebase

---

## 1. Matrix assumptions

Based on codebase audit dated 2026-05-06. Some route files may have nested directories not enumerated here. This matrix maps current routes to target redesign templates and implementation priority.

Priority meaning:

```txt
P0 = documentation/brand foundation
P1 = homepage/navigation/public shell
P2 = high-traffic public pages
P3 = product app pages
P4 = complex/high-risk flows and final polish
```

Risk meaning:

```txt
Low = mostly presentational/static
Medium = dynamic data but visual-safe
High = auth/payment/booking/messages/admin/API risk
```

## 2. Route redesign matrix

| Route                            | Likely files / area                                                                           | Target template                  | Priority | Data                        | Risk        | Notes                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- | -------: | --------------------------- | ----------- | -------------------------------------------------------------- |
| `/`                              | `app/page.tsx`, `components/shared/petpark/homepage-redesign.tsx`, `service-hub-overview.tsx` | Homepage v2                      |       P1 | mixed/static + public data  | Medium      | Check existing WIP diff before modifying service-hub-overview. |
| `/pretraga`                      | `app/pretraga/*`, search components                                                           | Public service overview/search   |       P2 | providers/services          | Medium      | Preserve filters/data boundaries.                              |
| `/njega`                         | `app/njega/*`                                                                                 | Service detail/category          |       P2 | groomers/grooming           | Medium      | Map to Grooming service language.                              |
| `/dresura`                       | `app/dresura/*`                                                                               | Service detail/category          |       P2 | trainers/programs           | Medium      | Map to Trening.                                                |
| `/veterinari`                    | `app/veterinari/*`                                                                            | Service detail/category          |       P2 | veterinarians/static/map    | Medium      | Audit notes map warnings; avoid logic changes.                 |
| `/dog-friendly`                  | `app/dog-friendly/*`                                                                          | Service/content hybrid           |       P3 | static/listing/map          | Medium      | Keep as lifestyle/content template.                            |
| `/sitter/[id]`                   | `app/sitter/[id]/*`, public provider APIs                                                     | Provider/service profile         |       P2 | sitters/providers/reviews   | High        | Booking CTA risk; visual only.                                 |
| `/groomer/[id]`                  | `app/groomer/[id]/*`                                                                          | Provider/service profile         |       P2 | groomers/reviews            | High        | Preserve API usage.                                            |
| `/trener/[id]`                   | `app/trener/[id]/*`                                                                           | Provider/service profile         |       P2 | trainers/programs/reviews   | High        | Preserve trainer booking logic.                                |
| `/veterinari/[slug]`             | `app/veterinari/[slug]/*`                                                                     | Provider/service profile         |       P3 | veterinarian listing/detail | Medium      | If static, lower risk; if map, check.                          |
| `/blog`                          | `app/blog/*`                                                                                  | Blog homepage                    |       P2 | blog/content/comments       | Medium      | Keep comment APIs untouched.                                   |
| `/blog/[slug]`                   | `app/blog/[slug]/*`                                                                           | Blog article                     |       P2 | blog post/comments          | Medium      | SEO important.                                                 |
| `/forum`                         | `app/forum/*`                                                                                 | Forum list                       |       P3 | forum topics                | Medium/High | Moderation APIs untouched.                                     |
| `/forum/[id]`                    | `app/forum/[id]/*`                                                                            | Forum thread                     |       P3 | topics/comments/likes       | High        | Preserve actions/like logic.                                   |
| `/zajednica`                     | `app/zajednica/*`                                                                             | Community hub                    |       P2 | social/community            | Medium      | Good candidate after homepage.                                 |
| `/zajednica/feed`                | `app/zajednica/feed/*`                                                                        | Community feed                   |       P3 | social posts                | Medium/High | Preserve reactions/comments.                                   |
| `/zajednica/izazovi`             | `app/zajednica/izazovi/*`                                                                     | Community challenge              |       P4 | challenge entries           | Medium      | Later phase.                                                   |
| `/zajednica/najbolji`            | `app/zajednica/najbolji/*`                                                                    | Community leaderboard/highlights |       P4 | social/pet-of-week          | Medium      | Later phase.                                                   |
| `/zajednica/[slug]`              | `app/zajednica/[slug]/*`                                                                      | Community detail                 |       P3 | social posts/comments       | High        | Preserve moderation/reporting.                                 |
| `/izgubljeni`                    | `app/izgubljeni/*`                                                                            | Lost/found listing               |       P2 | lost pets                   | Medium/High | Urgent status UI.                                              |
| `/izgubljeni/[id]`               | `app/izgubljeni/[id]/*`                                                                       | Lost/found detail                |       P2 | lost pet detail             | Medium/High | Contact/report safety.                                         |
| `/izgubljeni/prijavi`            | `app/izgubljeni/prijavi/*`                                                                    | Create alert flow                |       P3 | lost pets insert/upload     | High        | Form/API risk.                                                 |
| `/udomljavanje`                  | `app/udomljavanje/*`                                                                          | Adoption listing                 |       P2 | adoption listings           | Medium      | Needs warm visual.                                             |
| `/udomljavanje/[id]`             | `app/udomljavanje/[id]/*`                                                                     | Adoption detail                  |       P2 | adoption listing detail     | Medium/High | Contact flow.                                                  |
| `/udomljavanje/udruga/[id]`      | `app/udomljavanje/udruga/[id]/*`                                                              | Rescue/org profile               |       P3 | rescue orgs                 | Medium      | Align with adoption template.                                  |
| `/udruge`                        | `app/udruge/*`                                                                                | Organization listing             |       P3 | rescue orgs                 | Medium      | Community/rescue style.                                        |
| `/udruge/[slug]`                 | `app/udruge/[slug]/*`                                                                         | Organization profile             |       P3 | rescue org profile          | Medium      | Align with profile template.                                   |
| `/uzgajivacnice`                 | `app/uzgajivacnice/*`                                                                         | Breeder listing                  |       P4 | breeders                    | Medium/High | Needs separate trust/safety.                                   |
| `/uzgajivacnice/[id]`            | `app/uzgajivacnice/[id]/*`                                                                    | Breeder profile                  |       P4 | breeder detail              | High        | Later after core pages.                                        |
| `/postani-sitter`                | `app/postani-sitter/*`                                                                        | Provider onboarding landing      |       P2 | mostly static/form          | Medium      | Use provider CTA style.                                        |
| `/prijava`                       | `app/prijava/*`                                                                               | Auth page                        |    P1/P3 | auth                        | High        | Logo visual only; do not change auth.                          |
| `/registracija`                  | `app/registracija/*`                                                                          | Auth page                        |    P1/P3 | auth                        | High        | Logo visual only initially.                                    |
| `/nova-lozinka`                  | `app/nova-lozinka/*`                                                                          | Auth utility                     |       P4 | auth                        | High        | Later.                                                         |
| `/zaboravljena-lozinka`          | `app/zaboravljena-lozinka/*`                                                                  | Auth utility                     |       P4 | auth                        | High        | Later.                                                         |
| `/poruke`                        | `app/poruke/*`, `components/chat/*`                                                           | Messages                         |    P3/P4 | messages/conversations      | High        | Presentation only; preserve APIs.                              |
| `/checkout/[bookingId]`          | `app/checkout/[bookingId]/*`                                                                  | Checkout                         |       P4 | booking/payment             | Highest     | Visual only after review.                                      |
| `/checkout/[bookingId]/success`  | checkout success                                                                              | Checkout success                 |       P4 | booking/payment             | Highest     | Later.                                                         |
| `/checkout/[bookingId]/cancel`   | checkout cancel                                                                               | Checkout cancel                  |       P4 | booking/payment             | Highest     | Later.                                                         |
| `/dashboard/vlasnik`             | dashboard owner                                                                               | User dashboard                   |       P3 | auth/pets/bookings          | High        | Preserve guards.                                               |
| `/dashboard/vlasnik/rezervacije` | owner reservations                                                                            | Booking list                     |       P3 | bookings                    | High        | Preserve logic.                                                |
| `/dashboard/sitter`              | sitter dashboard                                                                              | Provider dashboard               |    P3/P4 | bookings/provider           | High        | Later after public.                                            |
| `/dashboard/sitter/onboarding`   | onboarding                                                                                    | Provider onboarding              |       P4 | auth/provider               | High        | Preserve.                                                      |
| `/dashboard/sitter/setnja`       | sitter walk                                                                                   | Provider service module          |       P4 | walks/bookings              | High        | Later.                                                         |
| `/dashboard/groomer`             | groomer dashboard                                                                             | Provider dashboard               |       P4 | groomer bookings            | High        | Later.                                                         |
| `/dashboard/groomer/onboarding`  | onboarding                                                                                    | Provider onboarding              |       P4 | auth/provider               | High        | Preserve.                                                      |
| `/dashboard/trainer`             | trainer dashboard                                                                             | Provider dashboard               |       P4 | trainer bookings/programs   | High        | Later.                                                         |
| `/dashboard/breeder`             | breeder dashboard                                                                             | Provider dashboard               |       P4 | breeder                     | High        | Later.                                                         |
| `/dashboard/rescue`              | rescue dashboard                                                                              | Rescue dashboard                 |       P4 | adoption/rescue             | High        | Later.                                                         |
| `/dashboard/adoption`            | adoption dashboard                                                                            | Adoption dashboard               |       P4 | adoption                    | High        | Later.                                                         |
| `/admin`                         | admin                                                                                         | Admin shell                      |       P4 | admin APIs                  | Highest     | Do not touch in redesign phases.                               |
| `/admin/founder-dashboard`       | admin                                                                                         | Admin dashboard                  |       P4 | admin                       | Highest     | Avoid.                                                         |
| `/admin/marketing`               | admin/marketing                                                                               | Admin marketing                  |       P4 | admin/content               | High        | Avoid initially.                                               |

## 3. English routes

Audit found English variants for some pages. V2 initial redesign should focus Croatian routes first. English variants can adopt templates after HR visual system stabilizes.

## 4. Phase grouping

```txt
P0: docs/design, logo asset, tokens
P1: homepage + public shell + logo unification
P2: service discovery + community/blog/lost/adoption public routes
P3: profile pages + owner dashboard + messages visual refresh
P4: provider dashboards, checkout, admin, complex flows
```
