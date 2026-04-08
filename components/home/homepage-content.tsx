'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, MapPin, ChevronRight, Shield, Heart, Search, Scissors, GraduationCap, Stethoscope, Sparkles, Siren } from 'lucide-react';
// Animation components temporarily removed for build stability
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { HeroSection } from './hero-section';
import { AnimatedServiceCard } from './animated-service-card';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

type FeaturedSitter = {
  id: string;
  name: string;
  city: string;
  rating: number | null;
  reviews: number | null;
  bio: string;
  verified: boolean;
  superhost: boolean;
  initial: string;
  gradient: string;
};

type City = {
  name: string;
  image: string;
  landing: string | null;
};

/* ─────────────────────────────────────────────
   Copy — bilingual
   ───────────────────────────────────────────── */

const copy = {
  hr: {
    // Hero
    heroKicker: 'PetPark Hrvatska',
    heroHeadline: 'Gdje ljubav\nprema životinjama\npostaje način života.',
    heroSub: 'Platforma za vlasnike koji traže više od usluge — traže povjerenje, kvalitetu i zajednicu koja dijeli njihove vrijednosti.',
    heroCta: 'Istražite PetPark',
    heroSecondaryCta: 'Postanite partner',

    // Philosophy
    philoKicker: 'Naša filozofija',
    philoHeadline: 'Svaki ljubimac zaslužuje\nizvanrednu brigu.',
    philoBody: 'PetPark nije samo platforma za rezervacije. To je ekosustav izgrađen oko jedne jednostavne ideje: da briga o životinjama treba biti jednako promišljena, pouzdana i lijepa kao i ljubav koju im dajemo.',
    philoStat1: '4.9',
    philoStat1Label: 'Prosječna ocjena',
    philoStat2: '500+',
    philoStat2Label: 'Verificiranih partnera',
    philoStat3: '6',
    philoStat3Label: 'Gradova u Hrvatskoj',

    // Services
    svcKicker: 'Usluge',
    svc1Title: 'Čuvanje i smještaj',
    svc1Body: 'Pouzdani sitteri koji se brinu za vašeg ljubimca kao za svog — u svom domu ili vašem.',
    svc2Title: 'Njega i grooming',
    svc2Body: 'Profesionalna njega dlake, kupanje i styling. Jer vaš ljubimac zaslužuje osjećaj svježine.',
    svc3Title: 'Školovanje i trening',
    svc3Body: 'Certificirani treneri za poslušnost, socijalizaciju i agility. Svaki pas može biti najbolja verzija sebe.',
    svcCta: 'Saznajte više',

    // Trust
    trustKicker: 'Zašto PetPark',
    trustItems: [
      { title: 'Verificirani profili', body: 'Svaki partner prolazi provjeru identiteta i profila prije objave.' },
      { title: 'Stvarne recenzije', body: 'Iskustva vlasnika bez filtera — jer transparentnost gradi povjerenje.' },
      { title: 'Sigurno plaćanje', body: 'Plaćanje kroz platformu s podrškom za sve probleme i nejasnoće.' },
      { title: 'Podrška kad treba', body: 'Posvećen tim pon–sub 8–20h. Svaki slučaj gledamo zasebno.' },
    ],

    // Sitters
    sittersKicker: 'Istaknuti partneri',
    sittersHeadline: 'Ljudi kojima vlasnici vjeruju.',
    sittersSub: 'Profili s odličnim recenzijama, jasnim opisima i provjerenim podacima.',
    sittersViewAll: 'Pregledaj sve',
    sittersViewProfile: 'Pogledaj profil',
    sittersFallbackBio: 'Pouzdan sitter za pse i mačke u vašem gradu.',
    sittersVerified: 'Verificiran',

    // Cities
    citiesKicker: 'Gradovi',
    citiesHeadline: 'PetPark u vašem gradu.',
    citiesCta: 'Istraži',

    // CTA
    ctaHeadline: 'Spremni za\nbolju brigu?',
    ctaBody: 'Pronađite pouzdanog sittera, groomera ili trenera u svom gradu — ili se pridružite rastućoj mreži partnera.',
    ctaPrimary: 'Pronađi uslugu',
    ctaSecondary: 'Postani partner',

    // Newsletter label
    newsletterKicker: 'Budite u toku',
  },
  en: {
    heroKicker: 'PetPark Croatia',
    heroHeadline: 'Where love\nfor animals\nbecomes a way of life.',
    heroSub: 'A platform for owners who want more than a service — they want trust, quality, and a community that shares their values.',
    heroCta: 'Explore PetPark',
    heroSecondaryCta: 'Become a partner',

    philoKicker: 'Our philosophy',
    philoHeadline: 'Every pet deserves\nextraordinary care.',
    philoBody: 'PetPark is not just a booking platform. It\'s an ecosystem built around one simple idea: that caring for animals should be as thoughtful, reliable, and beautiful as the love we give them.',
    philoStat1: '4.9',
    philoStat1Label: 'Average rating',
    philoStat2: '500+',
    philoStat2Label: 'Verified partners',
    philoStat3: '6',
    philoStat3Label: 'Cities in Croatia',

    svcKicker: 'Services',
    svc1Title: 'Boarding & sitting',
    svc1Body: 'Trusted sitters who care for your pet like their own — at their home or yours.',
    svc2Title: 'Grooming & care',
    svc2Body: 'Professional coat care, bathing, and styling. Because your pet deserves to feel fresh.',
    svc3Title: 'Training & agility',
    svc3Body: 'Certified trainers for obedience, socialisation, and agility. Every dog can be the best version of themselves.',
    svcCta: 'Learn more',

    trustKicker: 'Why PetPark',
    trustItems: [
      { title: 'Verified profiles', body: 'Every partner passes identity and profile checks before publishing.' },
      { title: 'Real reviews', body: 'Unfiltered owner experiences — because transparency builds trust.' },
      { title: 'Secure payments', body: 'Pay through the platform with support for any issues.' },
      { title: 'Support when needed', body: 'Dedicated team Mon–Sat 8am–8pm. Every case reviewed individually.' },
    ],

    sittersKicker: 'Featured partners',
    sittersHeadline: 'People owners trust.',
    sittersSub: 'Profiles with outstanding reviews, clear descriptions, and verified details.',
    sittersViewAll: 'View all',
    sittersViewProfile: 'View profile',
    sittersFallbackBio: 'A trusted sitter for dogs and cats in your city.',
    sittersVerified: 'Verified',

    citiesKicker: 'Cities',
    citiesHeadline: 'PetPark in your city.',
    citiesCta: 'Explore',

    ctaHeadline: 'Ready for\nbetter care?',
    ctaBody: 'Find a trusted sitter, groomer, or trainer in your city — or join a growing network of partners.',
    ctaPrimary: 'Find a service',
    ctaSecondary: 'Become a partner',

    newsletterKicker: 'Stay in the loop',
  },
} as const;

/* Service image & link map */
const servicesMeta = [
  { image: '/images/services/01-pet-sitting.jpg', href: '/pretraga' },
  { image: '/images/services/02-grooming.jpg', href: '/njega' },
  { image: '/images/services/03-dresura-agility.jpg', href: '/dresura' },
];

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function HomePageContent({
  featuredSitters,
  cities,
  newsletterSlot,
}: {
  featuredSitters: FeaturedSitter[];
  cities: City[];
  newsletterSlot?: React.ReactNode;
}) {
  const { language } = useLanguage();
  const locale = language === 'en' ? 'en' : 'hr';
  const t = copy[locale];

  const services = [
    { title: t.svc1Title, body: t.svc1Body, ...servicesMeta[0] },
    { title: t.svc2Title, body: t.svc2Body, ...servicesMeta[1] },
    { title: t.svc3Title, body: t.svc3Body, ...servicesMeta[2] },
  ];

  return (
    <div className="concept-zero">
      {/* ════════════════════════════════════════════
          1. NEW ANIMATED HERO SECTION
          ════════════════════════════════════════════ */}
      <HeroSection />

      {/* ════════════════════════════════════════════
          2. BRAND PHILOSOPHY
          ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 lg:py-36 relative" aria-label={t.philoKicker}>
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text column */}
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-5 font-semibold">
                {t.philoKicker}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] mb-8 font-[var(--font-heading)] whitespace-pre-line">
                {t.philoHeadline}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12">
                {t.philoBody}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: t.philoStat1, label: t.philoStat1Label },
                  { value: t.philoStat2, label: t.philoStat2Label },
                  { value: t.philoStat3, label: t.philoStat3Label },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <p className="text-3xl md:text-4xl font-extrabold text-warm-orange font-[var(--font-heading)]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image column — editorial asymmetric composition */}
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-orange-200/20 dark:shadow-black/30">
                <Image
                  src="/hero-pets.jpg"
                  alt={locale === 'hr' ? 'Sretni ljubimci' : 'Happy pets'}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 md:-left-10 bg-white dark:bg-card rounded-2xl p-5 shadow-xl border border-border/40 max-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-extrabold font-[var(--font-heading)]">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {locale === 'hr'
                    ? 'Prosječna ocjena naših partnera'
                    : 'Average rating of our partners'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. EDITORIAL SERVICE SHOWCASE
          ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 lg:py-36 bg-warm-section" aria-label={t.svcKicker}>
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-5 font-semibold">
            {t.svcKicker}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((svc, i) => (
              <AnimatedServiceCard
                key={svc.href}
                href={svc.href}
                image={svc.image}
                title={svc.title}
                body={svc.body}
                cta={t.svcCta}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. TRUST STRIP
          ════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 lg:py-28" aria-label={t.trustKicker}>
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-5 font-semibold">
              {t.trustKicker}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-[var(--font-heading)] max-w-xl mx-auto leading-tight">
              {locale === 'hr'
                ? 'Povjerenje se gradi, ne tvrdi.'
                : 'Trust is built, not claimed.'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {t.trustItems.map((item, i) => {
              const icons = [Shield, Star, Heart, Shield];
              const Icon = icons[i % icons.length];
              return (
                <div key={item.title} className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-warm-peach dark:bg-warm-orange/15 mb-5">
                    <Icon className="h-5 w-5 text-warm-orange" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-[var(--font-heading)]">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. FEATURED SITTERS — EDITORIAL
          ════════════════════════════════════════════ */}
      {featuredSitters.length > 0 && (
        <section className="py-16 md:py-24 lg:py-36 bg-warm-section" aria-label={t.sittersKicker}>
          <div className="container mx-auto px-6 md:px-10 lg:px-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-4 font-semibold">
                  {t.sittersKicker}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-[var(--font-heading)] mb-3">
                  {t.sittersHeadline}
                </h2>
                <p className="text-lg text-muted-foreground max-w-lg">{t.sittersSub}</p>
              </div>
              <Link href="/pretraga" className="hidden md:inline-flex shrink-0">
                <Button variant="outline" className="rounded-full h-12 px-8">
                  {t.sittersViewAll}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredSitters.slice(0, 6).map((sitter) => (
                <Link key={sitter.id} href={`/sitter/${sitter.id}`} className="group">
                  <article className="bg-white dark:bg-card rounded-2xl border border-border/40 p-6 md:p-7 cz-sitter-card transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/30 dark:hover:shadow-black/20 hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${sitter.gradient} text-white font-bold flex items-center justify-center text-xl shadow-lg shrink-0`}>
                        {sitter.initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg font-[var(--font-heading)] truncate">
                          {sitter.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{sitter.city}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
                      {sitter.bio || t.sittersFallbackBio}
                    </p>

                    <div className="flex items-center justify-between pt-5 border-t border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-sm">{sitter.rating?.toFixed(1) || '—'}</span>
                          <span className="text-muted-foreground text-xs">({sitter.reviews || 0})</span>
                        </div>
                        {sitter.verified && (
                          <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2.5 py-1 rounded-full">
                            {t.sittersVerified}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-warm-orange inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.sittersViewProfile}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Mobile view-all */}
            <div className="mt-8 text-center md:hidden">
              <Link href="/pretraga">
                <Button variant="outline" className="rounded-full">
                  {t.sittersViewAll}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          6. CITIES — EDITORIAL GRID
          ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 lg:py-36" aria-label={t.citiesKicker}>
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="mb-14">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-4 font-semibold">
              {t.citiesKicker}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-[var(--font-heading)]">
              {t.citiesHeadline}
            </h2>
          </div>

          {/* Asymmetric editorial grid: 2 tall + 4 small */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5 cz-city-grid">
            {cities.map((city, i) => {
              const isFeatured = i < 2;
              return (
                <Link
                  key={city.name}
                  href={city.landing ?? `/pretraga?city=${encodeURIComponent(city.name)}`}
                  className={`group relative rounded-2xl overflow-hidden ${isFeatured ? 'md:row-span-2 aspect-[3/4] md:aspect-auto' : 'aspect-[4/3]'}`}
                >
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes={isFeatured ? '(min-width: 768px) 25vw, 50vw' : '(min-width: 768px) 25vw, 50vw'}
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className={`text-white font-extrabold font-[var(--font-heading)] drop-shadow-sm ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                      {city.name}
                    </h3>
                    <span className="text-white/80 text-sm font-medium inline-flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.citiesCta} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. NEWSLETTER SLOT
          ════════════════════════════════════════════ */}
      {newsletterSlot}

      {/* ════════════════════════════════════════════
          8. BRAND CTA — WARM GRADIENT
          ════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-32 lg:py-44 overflow-hidden" aria-label="Call to action">
        <div className="absolute inset-0 cz-cta-gradient" />
        <div className="absolute inset-0 paw-pattern opacity-[0.04]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-8 font-[var(--font-heading)] whitespace-pre-line">
            {t.ctaHeadline}
          </h2>
          <p className="text-lg md:text-xl text-white/75 max-w-lg mx-auto mb-12 leading-relaxed">
            {t.ctaBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pretraga">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 h-14 px-10 rounded-full text-base font-bold shadow-2xl shadow-black/15"
              >
                {t.ctaPrimary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/registracija?role=sitter">
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:text-white h-14 px-10 rounded-full text-base font-semibold"
              >
                {t.ctaSecondary}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
