'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Shield, Star, Heart, MapPin,
  ArrowRight, Scissors, GraduationCap, BookOpen,
  PawPrint, ShieldCheck, BadgeCheck,
  Home, Dog, House, Eye, Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';

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

/* ────────────────────────────────────────────────────────────────
   Copy — HR / EN
   ──────────────────────────────────────────────────────────────── */

const copy = {
  hr: {
    // Hero
    heroLine1: 'Briga za ljubimce,',
    heroLine2: 'osmišljena s ljubavlju.',
    heroSub: 'PetPark je dom za sittere, groomere, trenere i sve vlasnike koji žele najbolje za svoje ljubimce.',
    heroSearch: 'Pronađi sittera',
    heroCityPlaceholder: 'Vaš grad...',
    heroCityAria: 'Grad',
    heroBadge: 'Verificirani sitteri · Stvarne recenzije · Brza rezervacija',

    // Services showcase
    servicesEyebrow: 'Usluge',
    servicesTitle: 'Sve što vaš ljubimac treba — na jednom mjestu.',
    service1Title: 'Čuvanje i smještaj',
    service1Body: 'Vaš ljubimac boravi kod pouzdanog sittera dok ste vi mirni.',
    service2Title: 'Grooming i njega',
    service2Body: 'Profesionalno kupanje, šišanje i njega dlake u salonu ili kod kuće.',
    service3Title: 'Školovanje i agility',
    service3Body: 'Certificirani treneri pomažu vašem psu da bude najbolja verzija sebe.',
    moreServicesTitle: 'Još usluga',
    moreWalking: 'Šetnja pasa',
    moreDropIn: 'Kratki posjet',
    moreDaycare: 'Dnevna briga',
    moreHouseSitting: 'Čuvanje u kući',
    exploreCta: 'Istraži',

    // Trust + ecosystem
    ecosystemEyebrow: 'Zašto PetPark',
    ecosystemTitle: 'Više od platforme — zajednica koja brine.',
    ecosystemBody: 'Svaki profil je provjeren. Svaka recenzija je stvarna. Svaki korak osmišljen da vaš ljubimac bude siguran, a vi mirni.',
    trustVerified: 'Verificirani profili',
    trustVerifiedBody: 'Osnovna provjera identiteta prije objave na PetParku.',
    trustReviews: 'Recenzije bez filtera',
    trustReviewsBody: 'Stvarna iskustva drugih vlasnika — bez cenzure.',
    trustSupport: 'Podrška kad zapne',
    trustSupportBody: 'Pon–sub 8–20h. Svaki slučaj gledamo zasebno.',
    communityTitle: 'Forum, udomljavanje i veterinari',
    communityBody: 'PetPark povezuje cijeli ekosustav oko ljubimaca — od savjeta zajednice do pronalaska novog doma.',
    communityForumCta: 'Forum',
    communityAdoptCta: 'Udomljavanje',

    // Discover — sitters + cities
    discoverEyebrow: 'Otkrijte',
    discoverTitle: 'Pouzdani sitteri u vašem gradu.',
    discoverBody: 'Istražite profile s dobrim recenzijama, jasnim opisima usluge i provjerenim podacima.',
    viewProfile: 'Pogledaj profil',
    viewAll: 'Pregledaj sve sittere',
    verifiedLabel: 'Verificiran',
    topChoice: 'Top izbor',
    fallbackBio: 'Pouzdan sitter za pse i mačke u vašem gradu.',
    citiesTitle: 'Dostupni gradovi',
    cityExplore: 'Istraži',

    // Closing
    closingTitle: 'Vaš ljubimac zaslužuje pouzdanu brigu.',
    closingBody: 'Pronađite uslugu u nekoliko klikova — ili se pridružite kao partner i gradite posao koji volite.',
    closingPrimary: 'Pronađi sittera',
    closingSecondary: 'Postani partner',
  },
  en: {
    heroLine1: 'Pet care,',
    heroLine2: 'designed with love.',
    heroSub: 'PetPark is home to sitters, groomers, trainers, and every owner who wants the best for their pet.',
    heroSearch: 'Find a sitter',
    heroCityPlaceholder: 'Your city...',
    heroCityAria: 'City',
    heroBadge: 'Verified sitters · Real reviews · Fast booking',

    servicesEyebrow: 'Services',
    servicesTitle: 'Everything your pet needs — in one place.',
    service1Title: 'Boarding & sitting',
    service1Body: 'Your pet stays with a trusted sitter while you relax.',
    service2Title: 'Grooming & care',
    service2Body: 'Professional bathing, trimming, and coat care — at a salon or at home.',
    service3Title: 'Training & agility',
    service3Body: 'Certified trainers help your dog become their best self.',
    moreServicesTitle: 'More services',
    moreWalking: 'Dog walking',
    moreDropIn: 'Drop-in visit',
    moreDaycare: 'Day care',
    moreHouseSitting: 'House sitting',
    exploreCta: 'Explore',

    ecosystemEyebrow: 'Why PetPark',
    ecosystemTitle: 'More than a platform — a community that cares.',
    ecosystemBody: 'Every profile is verified. Every review is real. Every step is designed to keep your pet safe and give you peace of mind.',
    trustVerified: 'Verified profiles',
    trustVerifiedBody: 'Basic identity check before publishing on PetPark.',
    trustReviews: 'Unfiltered reviews',
    trustReviewsBody: 'Real experiences from other owners — no censorship.',
    trustSupport: 'Support when it matters',
    trustSupportBody: 'Mon–Sat 8am–8pm. Every case reviewed individually.',
    communityTitle: 'Forum, adoption, and veterinarians',
    communityBody: 'PetPark connects the entire pet ecosystem — from community advice to finding a forever home.',
    communityForumCta: 'Forum',
    communityAdoptCta: 'Adoption',

    discoverEyebrow: 'Discover',
    discoverTitle: 'Trusted sitters in your city.',
    discoverBody: 'Browse profiles with strong reviews, clear service descriptions, and verified details.',
    viewProfile: 'View profile',
    viewAll: 'View all sitters',
    verifiedLabel: 'Verified',
    topChoice: 'Top choice',
    fallbackBio: 'A trusted sitter for dogs and cats in your city.',
    citiesTitle: 'Available cities',
    cityExplore: 'Explore',

    closingTitle: 'Your pet deserves reliable care.',
    closingBody: 'Find a service in just a few clicks — or join as a partner and build work you love.',
    closingPrimary: 'Find a sitter',
    closingSecondary: 'Become a partner',
  },
} as const;

/* ────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────── */

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

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          SCENE 1 — Cinematic hero with art-directed layering
          Full-bleed image, film grain, editorial typography, luxury search
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden film-grain" aria-label="Hero">
        {/* Full-bleed hero image */}
        <div className="absolute inset-0">
          <Image
            src="/images/services/07-hero-puppy.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
            fetchPriority="high"
          />
          {/* Deep cinematic gradient — richer bottom, softer vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
          {/* Warm color wash — deeper, more intentional */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-orange-950/25 via-amber-950/10 to-transparent" />
          {/* Corner vignette for photographic depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,black/30_100%)]" />
        </div>

        <div className="relative z-[2] container mx-auto px-4 pb-20 pt-40 md:pb-28 md:pt-48 lg:pb-36">
          <div className="max-w-3xl">
            {/* Editorial headline — bold but not extrabold for luxury restraint */}
            <h1 className="animate-fade-in-up font-[var(--font-heading)]">
              <span className="block text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold text-white leading-[0.92] tracking-[-0.04em]">
                {t.heroLine1}
              </span>
              <span className="block text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold leading-[0.92] tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-100 to-teal-200">
                {t.heroLine2}
              </span>
            </h1>

            {/* Decorative separator — luxury editorial detail */}
            <div className="luxury-separator w-24 mt-8 md:mt-10 animate-fade-in-up delay-100" />

            <p className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-white/60 max-w-lg leading-relaxed font-light animate-fade-in-up delay-100">
              {t.heroSub}
            </p>

            {/* Luxury search bar — frosted glass, refined borders */}
            <div className="mt-10 md:mt-12 animate-fade-in-up delay-200">
              <form action="/pretraga" className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    name="city"
                    placeholder={t.heroCityPlaceholder}
                    className="pl-11 h-14 bg-white/[0.07] backdrop-blur-2xl border-white/[0.12] text-white placeholder:text-white/30 rounded-2xl focus:ring-orange-400/40 focus:border-white/25 text-[15px]"
                    aria-label={t.heroCityAria}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-orange-500/90 hover:bg-orange-400 h-14 px-8 rounded-2xl shadow-2xl shadow-orange-900/40 text-[15px] font-medium tracking-wide transition-all duration-300"
                  aria-label={t.heroSearch}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t.heroSearch}
                </Button>
              </form>
            </div>

            {/* Trust line — quiet confidence */}
            <p className="mt-8 text-[12px] text-white/30 tracking-[0.15em] uppercase font-medium animate-fade-in-up delay-300">
              {t.heroBadge}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 2 — Services showcase
          3 editorial split panels, wider imagery, refined type, no icon boxes
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40" aria-label={locale === 'en' ? 'Services' : 'Usluge'}>
        <div className="container mx-auto px-4">
          {/* Section intro — more generous spacing */}
          <div className="max-w-2xl mb-24 md:mb-32">
            <p className="text-[12px] font-medium uppercase tracking-[0.25em] text-orange-500/80 dark:text-orange-400/70 mb-5">{t.servicesEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-bold font-[var(--font-heading)] leading-[1.08] tracking-tight">
              {t.servicesTitle}
            </h2>
          </div>

          {/* Service 1 — Image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-32">
            <Link href="/pretraga?service=boarding" className="group">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[3/2] shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                <Image
                  src="/images/services/01-pet-sitting.jpg"
                  alt={t.service1Title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
            <div className="lg:pl-6">
              <span className="text-orange-500 dark:text-orange-400 text-[13px] font-medium uppercase tracking-[0.2em] mb-6 block">01</span>
              <h3 className="text-2xl md:text-[2rem] font-bold font-[var(--font-heading)] mb-4 tracking-tight leading-tight">{t.service1Title}</h3>
              <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8 max-w-md font-light">{t.service1Body}</p>
              <Link href="/pretraga?service=boarding" className="inline-flex items-center gap-2 text-[14px] font-medium text-orange-600 dark:text-orange-400 hover:gap-3 transition-all duration-200 tracking-wide">
                {t.exploreCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Service 2 — Text left, image right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-32">
            <div className="lg:pr-6 order-2 lg:order-1">
              <span className="text-pink-500 dark:text-pink-400 text-[13px] font-medium uppercase tracking-[0.2em] mb-6 block">02</span>
              <h3 className="text-2xl md:text-[2rem] font-bold font-[var(--font-heading)] mb-4 tracking-tight leading-tight">{t.service2Title}</h3>
              <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8 max-w-md font-light">{t.service2Body}</p>
              <Link href="/njega" className="inline-flex items-center gap-2 text-[14px] font-medium text-pink-600 dark:text-pink-400 hover:gap-3 transition-all duration-200 tracking-wide">
                {t.exploreCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Link href="/njega" className="group order-1 lg:order-2">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[3/2] shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                <Image
                  src="/images/services/02-grooming.jpg"
                  alt={t.service2Title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </div>

          {/* Service 3 — Image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 md:mb-28">
            <Link href="/dresura" className="group">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[3/2] shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                <Image
                  src="/images/services/03-dresura-agility.jpg"
                  alt={t.service3Title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
            <div className="lg:pl-6">
              <span className="text-indigo-500 dark:text-indigo-400 text-[13px] font-medium uppercase tracking-[0.2em] mb-6 block">03</span>
              <h3 className="text-2xl md:text-[2rem] font-bold font-[var(--font-heading)] mb-4 tracking-tight leading-tight">{t.service3Title}</h3>
              <p className="text-lg text-muted-foreground/80 leading-relaxed mb-8 max-w-md font-light">{t.service3Body}</p>
              <Link href="/dresura" className="inline-flex items-center gap-2 text-[14px] font-medium text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all duration-200 tracking-wide">
                {t.exploreCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Secondary services — refined horizontal strip */}
          <div className="pt-10">
            <div className="luxury-separator mb-10" />
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40 mb-6">{t.moreServicesTitle}</p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/pretraga?service=walking', icon: Dog, label: t.moreWalking },
                { href: '/pretraga?service=drop-in', icon: Eye, label: t.moreDropIn },
                { href: '/pretraga?service=daycare', icon: Sun, label: t.moreDaycare },
                { href: '/pretraga?service=house-sitting', icon: House, label: t.moreHouseSitting },
              ].map((s) => (
                <Link key={s.href} href={s.href}>
                  <div className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-white dark:bg-card ring-1 ring-black/[0.04] dark:ring-white/[0.06] hover:ring-orange-300/60 dark:hover:ring-orange-700/60 hover:shadow-md transition-all duration-300">
                    <s.icon className="h-4 w-4 text-muted-foreground/40 group-hover:text-orange-500 transition-colors duration-300" />
                    <span className="text-sm font-medium tracking-wide">{s.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 3 — Trust + Ecosystem
          Dark editorial section, richer ambient lighting, numbered pillars
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 md:py-44 bg-slate-950 text-white relative overflow-hidden" aria-label={locale === 'en' ? 'Why PetPark' : 'Zašto PetPark'}>
        {/* Richer ambient lighting — larger, warmer glows */}
        <div className="absolute -top-20 left-1/4 w-[800px] h-[800px] bg-orange-500/[0.05] rounded-full blur-[200px]" />
        <div className="absolute -bottom-20 right-1/5 w-[700px] h-[700px] bg-teal-500/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[150px]" />

        <div className="container mx-auto px-4 relative">
          {/* Lead statement */}
          <div className="max-w-3xl mb-24 md:mb-32">
            <p className="text-[12px] font-medium uppercase tracking-[0.25em] text-orange-400/60 mb-6">{t.ecosystemEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-bold font-[var(--font-heading)] leading-[1.08] tracking-tight text-white mb-8">
              {t.ecosystemTitle}
            </h2>
            <p className="text-lg md:text-xl text-white/40 leading-relaxed max-w-2xl font-light">
              {t.ecosystemBody}
            </p>
          </div>

          {/* Trust pillars — numbered, no icons, pure editorial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-24 md:mb-32">
            {[
              { num: '01', title: t.trustVerified, body: t.trustVerifiedBody, accent: 'text-teal-400' },
              { num: '02', title: t.trustReviews, body: t.trustReviewsBody, accent: 'text-amber-400' },
              { num: '03', title: t.trustSupport, body: t.trustSupportBody, accent: 'text-rose-400' },
            ].map((pillar, idx) => (
              <div key={pillar.title} className={`py-10 md:py-0 md:px-12 ${idx > 0 ? 'border-t md:border-t-0 md:border-l border-white/[0.06]' : ''}`}>
                <span className={`text-[13px] font-medium tracking-[0.2em] ${pillar.accent} opacity-60 block mb-5`}>{pillar.num}</span>
                <h3 className="text-lg font-bold font-[var(--font-heading)] text-white mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-white/35 leading-relaxed text-[15px] font-light">{pillar.body}</p>
              </div>
            ))}
          </div>

          {/* Community block — cinematic image with gradient text overlay */}
          <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/[0.06]">
            <div className="relative h-72 md:h-[420px] overflow-hidden">
              <Image
                src="/images/services/06-community.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20" />
              {/* Subtle warm wash on the image */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-transparent to-teal-950/10" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="px-10 md:px-16 max-w-lg">
                <h3 className="text-xl md:text-2xl font-bold font-[var(--font-heading)] text-white mb-4 tracking-tight">{t.communityTitle}</h3>
                <p className="text-white/50 leading-relaxed mb-8 text-[15px] font-light">{t.communityBody}</p>
                <div className="flex gap-3">
                  <Link href={locale === 'en' ? '/forum/en' : '/forum'}>
                    <Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/[0.07] rounded-full px-6 font-medium tracking-wide transition-all duration-300">
                      <BookOpen className="h-3.5 w-3.5 mr-2" />
                      {t.communityForumCta}
                    </Button>
                  </Link>
                  <Link href="/udomljavanje">
                    <Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/[0.07] rounded-full px-6 font-medium tracking-wide transition-all duration-300">
                      <Heart className="h-3.5 w-3.5 mr-2" />
                      {t.communityAdoptCta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 4 — Discover: Sitters + Cities
          Editorial sitter spotlight, taller city imagery
      ═══════════════════════════════════════════════════════════ */}
      {featuredSitters.length > 0 && (
        <section className="py-28 md:py-40 bg-warm-section" aria-label={locale === 'en' ? 'Discover' : 'Otkrijte'}>
          <div className="container mx-auto px-4">
            {/* Intro */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-20 md:mb-24">
              <div className="max-w-xl">
                <p className="text-[12px] font-medium uppercase tracking-[0.25em] text-orange-500/80 dark:text-orange-400/70 mb-5">{t.discoverEyebrow}</p>
                <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-bold font-[var(--font-heading)] leading-[1.08] tracking-tight">{t.discoverTitle}</h2>
                <p className="text-muted-foreground/80 text-lg leading-relaxed mt-5 font-light">{t.discoverBody}</p>
              </div>
              <Link href="/pretraga" className="hidden md:inline-flex shrink-0">
                <Button variant="outline" className="rounded-full ring-1 ring-black/[0.06] dark:ring-white/[0.08] border-0 shadow-none hover:bg-accent px-6 tracking-wide">
                  {t.viewAll} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Sitter spotlight — lead editorial card */}
            {(() => {
              const hero = featuredSitters[0];
              return (
                <Link href={`/sitter/${hero.id}`} className="block mb-6">
                  <div className="group relative rounded-[2rem] overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-5 min-h-[280px] md:min-h-[380px]">
                      {/* Gradient initial — large, dramatic */}
                      <div className={`md:col-span-2 bg-gradient-to-br ${hero.gradient} flex items-center justify-center p-12 md:p-16 relative overflow-hidden`}>
                        <span className="text-white text-8xl md:text-9xl font-bold font-[var(--font-heading)] opacity-70 select-none">{hero.initial}</span>
                        <div className="absolute inset-0 bg-black/5" />
                      </div>
                      {/* Details */}
                      <div className="md:col-span-3 bg-white dark:bg-card p-8 md:p-14 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-5">
                          {hero.verified && (
                            <Badge className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-0 text-xs font-medium px-3 py-1 rounded-lg">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              {t.verifiedLabel}
                            </Badge>
                          )}
                          {hero.superhost && (
                            <Badge variant="secondary" className="rounded-full text-xs font-medium">{t.topChoice}</Badge>
                          )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] mb-3 tracking-tight">{hero.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground/70 mb-5">
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{hero.city}</span>
                          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{hero.rating?.toFixed(1) || '—'} ({hero.reviews || 0})</span>
                        </div>
                        <p className="text-muted-foreground/70 leading-relaxed line-clamp-3 mb-8 max-w-md font-light">{hero.bio || t.fallbackBio}</p>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity tracking-wide">
                          {t.viewProfile} <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Remaining sitters — compact grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24 md:mb-32">
              {featuredSitters.slice(1, 5).map((sitter) => (
                <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                  <div className="group bg-white dark:bg-card rounded-2xl p-6 ring-1 ring-black/[0.03] dark:ring-white/[0.06] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${sitter.gradient} text-white font-semibold flex items-center justify-center text-base shadow-md shrink-0`}>
                        {sitter.initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] leading-tight font-[var(--font-heading)] truncate">{sitter.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {sitter.city}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-sm">{sitter.rating?.toFixed(1) || '—'}</span>
                      <span className="text-muted-foreground/40 text-xs">({sitter.reviews || 0})</span>
                      {sitter.verified && (
                        <Badge className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-0 text-[10px] font-medium px-2 py-0.5 rounded ml-auto">
                          {t.verifiedLabel}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 font-light">{sitter.bio || t.fallbackBio}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Cities — cinematic, taller imagery */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40 mb-6">{t.citiesTitle}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {cities.map((city) => (
                  <Link key={city.name} href={city.landing ?? `/pretraga?city=${encodeURIComponent(city.name)}`}>
                    <div className="group relative rounded-2xl overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.06] hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                      <div className="h-36 md:h-44 relative flex items-end p-4 overflow-hidden">
                        <Image
                          src={city.image}
                          alt={city.name}
                          fill
                          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="relative">
                          <h3 className="text-white font-bold text-base leading-none drop-shadow-sm font-[var(--font-heading)] tracking-wide">{city.name}</h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      {newsletterSlot}

      {/* ═══════════════════════════════════════════════════════════
          SCENE 5 — Closing: unified CTA
          Clean, generous, luxurious — no icon, just confident type + action
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden film-grain" aria-label={locale === 'en' ? 'Get started' : 'Započnite'}>
        {/* Full-bleed image background */}
        <div className="absolute inset-0">
          <Image
            src="/images/services/08-macka.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-950/25 to-teal-950/15" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,black/25_100%)]" />
        </div>

        <div className="relative z-[2] container mx-auto px-4 py-32 md:py-44">
          <div className="max-w-2xl mx-auto text-center">
            <div className="luxury-separator w-16 mx-auto mb-10" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold font-[var(--font-heading)] text-white leading-[1.08] tracking-[-0.02em] mb-6">
              {t.closingTitle}
            </h2>
            <p className="text-base md:text-lg text-white/50 max-w-md mx-auto mb-12 leading-relaxed font-light">
              {t.closingBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pretraga">
                <Button size="lg" className="bg-orange-500/90 hover:bg-orange-400 text-white px-10 h-14 rounded-2xl shadow-2xl shadow-orange-900/40 text-base font-medium tracking-wide transition-all duration-300">
                  {t.closingPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/registracija?role=sitter">
                <Button size="lg" variant="outline" className="border border-white/20 text-white hover:bg-white/[0.07] px-10 h-14 rounded-2xl text-base font-medium tracking-wide transition-all duration-300">
                  {t.closingSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
