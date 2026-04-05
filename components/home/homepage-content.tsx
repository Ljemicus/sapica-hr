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
          SCENE 1 — Immersive cinematic hero
          Full-bleed image, editorial typography overlay, floating search
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden" aria-label="Hero">
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
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          {/* Warm color wash */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-950/20 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 pb-16 pt-40 md:pb-24 md:pt-48 lg:pb-32">
          <div className="max-w-3xl">
            {/* Editorial headline — oversized, art-directed */}
            <h1 className="animate-fade-in-up font-[var(--font-heading)]">
              <span className="block text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-extrabold text-white leading-[0.95] tracking-[-0.04em]">
                {t.heroLine1}
              </span>
              <span className="block text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-teal-300">
                {t.heroLine2}
              </span>
            </h1>

            <p className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-white/70 max-w-lg leading-relaxed animate-fade-in-up delay-100">
              {t.heroSub}
            </p>

            {/* Floating search bar */}
            <div className="mt-8 md:mt-10 animate-fade-in-up delay-200">
              <form action="/pretraga" className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    name="city"
                    placeholder={t.heroCityPlaceholder}
                    className="pl-11 h-14 bg-white/10 backdrop-blur-xl border-white/15 text-white placeholder:text-white/40 rounded-2xl focus:ring-orange-400/50 focus:border-white/30 text-[15px]"
                    aria-label={t.heroCityAria}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-400 h-14 px-8 rounded-2xl shadow-2xl shadow-orange-600/30 text-[15px] font-semibold transition-all duration-200"
                  aria-label={t.heroSearch}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t.heroSearch}
                </Button>
              </form>
            </div>

            {/* Subtle trust line */}
            <p className="mt-6 text-[13px] text-white/40 tracking-wide animate-fade-in-up delay-300">
              {t.heroBadge}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 2 — Services showcase
          3 editorial split panels + minimal secondary list
          No card grid — each service is a full-width scene
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36" aria-label={locale === 'en' ? 'Services' : 'Usluge'}>
        <div className="container mx-auto px-4">
          {/* Section intro */}
          <div className="max-w-2xl mb-20 md:mb-28">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400 mb-4">{t.servicesEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-extrabold font-[var(--font-heading)] leading-[1.08] tracking-tight">
              {t.servicesTitle}
            </h2>
          </div>

          {/* Service 1 — Image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-24">
            <Link href="/pretraga?service=boarding" className="group">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.05] dark:ring-white/[0.08]">
                <Image
                  src="/images/services/01-pet-sitting.jpg"
                  alt={t.service1Title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
            <div className="lg:pl-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mb-6">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-4 tracking-tight">{t.service1Title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-md">{t.service1Body}</p>
              <Link href="/pretraga?service=boarding" className="inline-flex items-center gap-2 text-[15px] font-semibold text-orange-600 dark:text-orange-400 hover:gap-3 transition-all duration-200">
                {t.exploreCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Service 2 — Text left, image right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-24">
            <div className="lg:pr-4 order-2 lg:order-1">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center mb-6">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-4 tracking-tight">{t.service2Title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-md">{t.service2Body}</p>
              <Link href="/njega" className="inline-flex items-center gap-2 text-[15px] font-semibold text-pink-600 dark:text-pink-400 hover:gap-3 transition-all duration-200">
                {t.exploreCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Link href="/njega" className="group order-1 lg:order-2">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.05] dark:ring-white/[0.08]">
                <Image
                  src="/images/services/02-grooming.jpg"
                  alt={t.service2Title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </div>

          {/* Service 3 — Image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-24">
            <Link href="/dresura" className="group">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.05] dark:ring-white/[0.08]">
                <Image
                  src="/images/services/03-dresura-agility.jpg"
                  alt={t.service3Title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
            <div className="lg:pl-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-6">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-4 tracking-tight">{t.service3Title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-md">{t.service3Body}</p>
              <Link href="/dresura" className="inline-flex items-center gap-2 text-[15px] font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all duration-200">
                {t.exploreCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Secondary services — minimal horizontal strip */}
          <div className="border-t border-border/50 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-6">{t.moreServicesTitle}</p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/pretraga?service=walking', icon: Dog, label: t.moreWalking },
                { href: '/pretraga?service=drop-in', icon: Eye, label: t.moreDropIn },
                { href: '/pretraga?service=daycare', icon: Sun, label: t.moreDaycare },
                { href: '/pretraga?service=house-sitting', icon: House, label: t.moreHouseSitting },
              ].map((s) => (
                <Link key={s.href} href={s.href}>
                  <div className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-white dark:bg-card ring-1 ring-black/[0.06] dark:ring-white/[0.08] hover:ring-orange-300 dark:hover:ring-orange-700 hover:shadow-md transition-all duration-200">
                    <s.icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-orange-500 transition-colors" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 3 — Trust + Ecosystem
          Dark editorial section, narrative layout
          Merges how-it-works, trust, and community into one scene
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-slate-950 text-white relative overflow-hidden" aria-label={locale === 'en' ? 'Why PetPark' : 'Zašto PetPark'}>
        {/* Ambient lighting */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/[0.06] rounded-full blur-[150px]" />

        <div className="container mx-auto px-4 relative">
          {/* Lead statement — large editorial type */}
          <div className="max-w-3xl mb-20 md:mb-28">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-orange-400/80 mb-5">{t.ecosystemEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-extrabold font-[var(--font-heading)] leading-[1.08] tracking-tight text-white mb-6">
              {t.ecosystemTitle}
            </h2>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl">
              {t.ecosystemBody}
            </p>
          </div>

          {/* Trust pillars — 3 column, minimal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-20 md:mb-28">
            {[
              { icon: BadgeCheck, title: t.trustVerified, body: t.trustVerifiedBody, accent: 'text-teal-400' },
              { icon: Star, title: t.trustReviews, body: t.trustReviewsBody, accent: 'text-amber-400' },
              { icon: Shield, title: t.trustSupport, body: t.trustSupportBody, accent: 'text-rose-400' },
            ].map((pillar, idx) => (
              <div key={pillar.title} className={`py-8 md:py-0 md:px-10 ${idx > 0 ? 'border-t md:border-t-0 md:border-l border-white/[0.08]' : ''}`}>
                <pillar.icon className={`h-6 w-6 ${pillar.accent} mb-5`} />
                <h3 className="text-lg font-bold font-[var(--font-heading)] text-white mb-3">{pillar.title}</h3>
                <p className="text-white/45 leading-relaxed text-[15px]">{pillar.body}</p>
              </div>
            ))}
          </div>

          {/* Community block — wide image + text overlay */}
          <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/[0.08]">
            <div className="relative h-72 md:h-96 overflow-hidden">
              <Image
                src="/images/services/06-community.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/30" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 md:px-14 max-w-lg">
                <h3 className="text-xl md:text-2xl font-extrabold font-[var(--font-heading)] text-white mb-3">{t.communityTitle}</h3>
                <p className="text-white/60 leading-relaxed mb-6 text-[15px]">{t.communityBody}</p>
                <div className="flex gap-3">
                  <Link href={locale === 'en' ? '/forum/en' : '/forum'}>
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-5">
                      <BookOpen className="h-3.5 w-3.5 mr-2" />
                      {t.communityForumCta}
                    </Button>
                  </Link>
                  <Link href="/udomljavanje">
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-5">
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
          Editorial sitter spotlight, horizontal city strip
      ═══════════════════════════════════════════════════════════ */}
      {featuredSitters.length > 0 && (
        <section className="py-24 md:py-36 bg-warm-section" aria-label={locale === 'en' ? 'Discover' : 'Otkrijte'}>
          <div className="container mx-auto px-4">
            {/* Intro */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16 md:mb-20">
              <div className="max-w-xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400 mb-4">{t.discoverEyebrow}</p>
                <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-extrabold font-[var(--font-heading)] leading-[1.08] tracking-tight">{t.discoverTitle}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mt-4">{t.discoverBody}</p>
              </div>
              <Link href="/pretraga" className="hidden md:inline-flex shrink-0">
                <Button variant="outline" className="rounded-full ring-1 ring-black/[0.08] dark:ring-white/[0.12] border-0 shadow-none hover:bg-accent px-6">
                  {t.viewAll} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Sitter spotlight — lead editorial card */}
            {(() => {
              const hero = featuredSitters[0];
              return (
                <Link href={`/sitter/${hero.id}`} className="block mb-6">
                  <div className="group relative rounded-[2rem] overflow-hidden ring-1 ring-black/[0.05] dark:ring-white/[0.08] shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-5 min-h-[280px] md:min-h-[360px]">
                      {/* Gradient initial — large, dramatic */}
                      <div className={`md:col-span-2 bg-gradient-to-br ${hero.gradient} flex items-center justify-center p-12 md:p-16 relative overflow-hidden`}>
                        <span className="text-white text-8xl md:text-9xl font-extrabold font-[var(--font-heading)] opacity-80 select-none">{hero.initial}</span>
                        <div className="absolute inset-0 bg-black/5" />
                      </div>
                      {/* Details */}
                      <div className="md:col-span-3 bg-white dark:bg-card p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
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
                        <h3 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-3">{hero.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{hero.city}</span>
                          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{hero.rating?.toFixed(1) || '—'} ({hero.reviews || 0})</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6 max-w-md">{hero.bio || t.fallbackBio}</p>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          {t.viewProfile} <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Remaining sitters — compact horizontal scroll on mobile, 4-col grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20 md:mb-28">
              {featuredSitters.slice(1, 5).map((sitter) => (
                <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                  <div className="group bg-white dark:bg-card rounded-2xl p-6 ring-1 ring-black/[0.04] dark:ring-white/[0.08] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${sitter.gradient} text-white font-bold flex items-center justify-center text-base shadow-md shrink-0`}>
                        {sitter.initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] leading-tight font-[var(--font-heading)] truncate">{sitter.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {sitter.city}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-sm">{sitter.rating?.toFixed(1) || '—'}</span>
                      <span className="text-muted-foreground/50 text-xs">({sitter.reviews || 0})</span>
                      {sitter.verified && (
                        <Badge className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-0 text-[10px] font-medium px-2 py-0.5 rounded ml-auto">
                          {t.verifiedLabel}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{sitter.bio || t.fallbackBio}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Cities — cinematic horizontal strip */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-6">{t.citiesTitle}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {cities.map((city) => (
                  <Link key={city.name} href={city.landing ?? `/pretraga?city=${encodeURIComponent(city.name)}`}>
                    <div className="group relative rounded-2xl overflow-hidden ring-1 ring-black/[0.05] dark:ring-white/[0.08] hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                      <div className="h-32 md:h-40 relative flex items-end p-4 overflow-hidden">
                        <Image
                          src={city.image}
                          alt={city.name}
                          fill
                          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="relative">
                          <h3 className="text-white font-bold text-base leading-none drop-shadow-sm font-[var(--font-heading)]">{city.name}</h3>
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
          Merges final CTA + sitter recruitment into one premium moment
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" aria-label={locale === 'en' ? 'Get started' : 'Započnite'}>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-950/30 to-teal-950/20" />
        </div>

        <div className="relative container mx-auto px-4 py-28 md:py-40">
          <div className="max-w-2xl mx-auto text-center">
            <PawPrint className="h-8 w-8 text-orange-400/60 mx-auto mb-8" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold font-[var(--font-heading)] text-white leading-[1.08] tracking-[-0.02em] mb-6">
              {t.closingTitle}
            </h2>
            <p className="text-base md:text-lg text-white/60 max-w-md mx-auto mb-10 leading-relaxed">
              {t.closingBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pretraga">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-400 text-white px-10 h-14 rounded-2xl shadow-2xl shadow-orange-600/30 text-base font-semibold transition-all duration-200">
                  {t.closingPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/registracija?role=sitter">
                <Button size="lg" variant="outline" className="border-2 border-white/25 text-white hover:bg-white/10 px-10 h-14 rounded-2xl text-base transition-all duration-200">
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
