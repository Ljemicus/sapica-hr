'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Shield, Star, Heart, MapPin, ChevronRight,
  Home, Dog, House, Eye, Sun, Calendar,
  ArrowRight, Scissors, GraduationCap, BookOpen,
  PawPrint, ShieldCheck, CreditCard, PhoneCall, BadgeCheck,
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

type Service = {
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  image: string;
};

type HowItWorksItem = {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

type MainCard = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
};

const mainCards: Record<'hr' | 'en', MainCard[]> = {
  hr: [
    { href: '/pretraga', icon: PawPrint, title: 'Sitteri', description: 'Pouzdani čuvari u vašem gradu', accent: 'group-hover:text-orange-600 dark:group-hover:text-orange-400', iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500' },
    { href: '/njega', icon: Scissors, title: 'Grooming', description: 'Kupanje, šišanje i njega', accent: 'group-hover:text-pink-600 dark:group-hover:text-pink-400', iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-500' },
    { href: '/dresura', icon: GraduationCap, title: 'Školovanje pasa', description: 'Profesionalna obuka i trening', accent: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500' },
    { href: '/veterinari', icon: ShieldCheck, title: 'Veterinari', description: 'Provjerene ordinacije i pomoć', accent: 'group-hover:text-teal-600 dark:group-hover:text-teal-400', iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-500' },
    { href: '/forum', icon: BookOpen, title: 'Forum', description: 'Pitanja, iskustva i savjeti zajednice', accent: 'group-hover:text-violet-600 dark:group-hover:text-violet-400', iconBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-500' },
    { href: '/udomljavanje', icon: Heart, title: 'Udomljavanje', description: 'Psi i mačke koji traže dom', accent: 'group-hover:text-rose-600 dark:group-hover:text-rose-400', iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' },
  ],
  en: [
    { href: '/pretraga', icon: PawPrint, title: 'Sitters', description: 'Trusted pet sitters in your city', accent: 'group-hover:text-orange-600 dark:group-hover:text-orange-400', iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500' },
    { href: '/njega', icon: Scissors, title: 'Grooming', description: 'Bathing, trimming, and care', accent: 'group-hover:text-pink-600 dark:group-hover:text-pink-400', iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-500' },
    { href: '/dresura', icon: GraduationCap, title: 'Dog Training', description: 'Professional training and coaching', accent: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500' },
    { href: '/veterinari', icon: ShieldCheck, title: 'Veterinarians', description: 'Trusted clinics and help nearby', accent: 'group-hover:text-teal-600 dark:group-hover:text-teal-400', iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-500' },
    { href: '/forum/en', icon: BookOpen, title: 'Forum', description: 'Questions, advice, and community stories', accent: 'group-hover:text-violet-600 dark:group-hover:text-violet-400', iconBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-500' },
    { href: '/udomljavanje', icon: Heart, title: 'Adoption', description: 'Dogs and cats looking for a home', accent: 'group-hover:text-rose-600 dark:group-hover:text-rose-400', iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' },
  ],
};

const services: Record<'hr' | 'en', Service[]> = {
  hr: [
    { type: 'boarding', title: 'Smještaj', description: 'Vaš ljubimac boravi kod sittera', icon: Home, color: 'from-orange-500 to-amber-500', image: '/images/services/01-pet-sitting.jpg' },
    { type: 'walking', title: 'Šetnja', description: 'Šetnja vašeg psa u kvartu', icon: Dog, color: 'from-emerald-500 to-teal-500', image: '/images/services/04-setanje-pasa.jpg' },
    { type: 'house-sitting', title: 'Čuvanje u kući', description: 'Sitter dolazi u vašu kuću', icon: House, color: 'from-blue-500 to-cyan-500', image: '/images/services/06-community.jpg' },
    { type: 'drop-in', title: 'Kratki posjet', description: 'Posjet vašem ljubimcu od 30min', icon: Eye, color: 'from-purple-500 to-pink-500', image: '/images/services/08-macka.jpg' },
    { type: 'daycare', title: 'Dnevna briga', description: 'Cjelodnevna briga kod sittera', icon: Sun, color: 'from-rose-500 to-orange-500', image: '/images/services/07-hero-puppy.jpg' },
    { type: 'grooming', title: 'Grooming', description: 'Kupanje, šišanje i njega dlake', icon: Scissors, color: 'from-pink-500 to-fuchsia-500', image: '/images/services/08-macka.jpg' },
    { type: 'agility', title: 'Agility trening', description: 'Sportski trening za aktivne pse', icon: GraduationCap, color: 'from-yellow-500 to-orange-500', image: '/images/services/04-setanje-pasa.jpg' },
    { type: 'training', title: 'Školovanje pasa', description: 'Profesionalna obuka i socijalizacija', icon: BookOpen, color: 'from-teal-500 to-emerald-500', image: '/images/services/06-community.jpg' },
  ],
  en: [
    { type: 'boarding', title: 'Boarding', description: 'Your pet stays with a sitter', icon: Home, color: 'from-orange-500 to-amber-500', image: '/images/services/01-pet-sitting.jpg' },
    { type: 'walking', title: 'Dog Walking', description: 'Walks for your dog in your neighborhood', icon: Dog, color: 'from-emerald-500 to-teal-500', image: '/images/services/04-setanje-pasa.jpg' },
    { type: 'house-sitting', title: 'House Sitting', description: 'A sitter comes to your home', icon: House, color: 'from-blue-500 to-cyan-500', image: '/images/services/06-community.jpg' },
    { type: 'drop-in', title: 'Drop-In Visit', description: 'A 30-minute visit for your pet', icon: Eye, color: 'from-purple-500 to-pink-500', image: '/images/services/08-macka.jpg' },
    { type: 'daycare', title: 'Day Care', description: 'Full-day care with a sitter', icon: Sun, color: 'from-rose-500 to-orange-500', image: '/images/services/07-hero-puppy.jpg' },
    { type: 'grooming', title: 'Grooming', description: 'Bathing, trimming, and coat care', icon: Scissors, color: 'from-pink-500 to-fuchsia-500', image: '/images/services/08-macka.jpg' },
    { type: 'agility', title: 'Agility Training', description: 'Sports training for active dogs', icon: GraduationCap, color: 'from-yellow-500 to-orange-500', image: '/images/services/04-setanje-pasa.jpg' },
    { type: 'training', title: 'Dog Training', description: 'Professional training and socialization', icon: BookOpen, color: 'from-teal-500 to-emerald-500', image: '/images/services/06-community.jpg' },
  ],
};

const howItWorks: Record<'hr' | 'en', HowItWorksItem[]> = {
  hr: [
    { step: 1, title: 'Pretražite sittere', description: 'Unesite svoj grad i datume, pregledajte profile verificiranih sittera i pročitajte recenzije drugih vlasnika.', icon: Search, color: 'from-orange-500 to-amber-400' },
    { step: 2, title: 'Rezervirajte termin', description: 'Kontaktirajte sittera, dogovorite detalje i rezervirajte uslugu online. Plaćanje je sigurno i jednostavno.', icon: Calendar, color: 'from-teal-500 to-emerald-400' },
    { step: 3, title: 'Uživajte bez brige', description: 'Vaš ljubimac je u sigurnim rukama! Primajte ažuriranja i fotke. Nakon usluge, ostavite recenziju.', icon: Shield, color: 'from-purple-500 to-pink-400' },
  ],
  en: [
    { step: 1, title: 'Search sitters', description: 'Enter your city and dates, browse verified sitter profiles, and read real reviews from other pet owners.', icon: Search, color: 'from-orange-500 to-amber-400' },
    { step: 2, title: 'Book your service', description: 'Contact the sitter, agree on the details, and book online. Payment is simple and secure.', icon: Calendar, color: 'from-teal-500 to-emerald-400' },
    { step: 3, title: 'Relax with peace of mind', description: 'Your pet is in safe hands. Get updates and photos, then leave a review after the service.', icon: Shield, color: 'from-purple-500 to-pink-400' },
  ],
};

const copy = {
  hr: {
    heroBadge: 'Verificirani sitteri i usluge za ljubimce',
    heroTitleStart: 'Pronađite',
    heroTitleAccent: 'pouzdanog sittera',
    heroTitleEnd: 'za svog',
    heroTitlePet: 'ljubimca.',
    heroDescription: 'Pronađite provjerene sittere, groomere i trenere u svom gradu. Jasni profili, stvarne recenzije i brza rezervacija — bez natezanja i bez stresa.',
    heroImageAlt: 'Sretni psi i mačke zajedno',
    cityPlaceholder: 'Unesite grad (npr. Rijeka, Zagreb...)',
    cityAria: 'Grad',
    servicePlaceholder: 'Usluga (smještaj, šetnja, grooming...)',
    serviceAria: 'Vrsta usluge',
    searchButton: 'Pronađi sittera',
    trustVerified: 'Verificirani profili',
    trustReviews: 'Stvarne recenzije',
    trustPayments: 'Sigurno plaćanje',
    trustSupport: 'Podrška kad zapne',
    servicesBadge: 'Usluge',
    servicesTitle: 'Sve što vaš ljubimac treba',
    servicesDescription: 'Od čuvanja i šetnji do groominga i školovanja — pronađite uslugu koja odgovara vašem ljubimcu.',
    serviceCta: 'Pregledaj uslugu',
    howItWorksBadge: 'Kako funkcionira',
    howItWorksTitle: 'Tri jednostavna koraka do idealne brige',
    howItWorksDescription: 'PetPark vam olakšava pronalazak provjerene usluge za vašeg ljubimca.',
    stepLabel: 'Korak',
    trustSectionBadge: 'Sigurnost i povjerenje',
    trustSectionTitle: 'Zašto vlasnici biraju PetPark?',
    trustSectionDescription: 'Svaki korak je osmišljen da vaš ljubimac bude siguran, a vi mirni.',
    trustCard1Title: 'Što znači "Verificiran"?',
    trustCard1Body: 'Verificirani profil znači da je prošla osnovna provjera identiteta i profila prije objave na PetParku.',
    trustCard2Title: 'Sigurno plaćanje',
    trustCard2Body: 'Plaćanje se odvija kroz platformu, a za probleme s rezervacijom možete se javiti podršci da zajedno riješimo slučaj.',
    trustCard3Title: 'Podrška pon–sub 8–20h',
    trustCard3Body: 'Ako nešto zapne, javljate se podršci i zajedno tražimo najrazumnije rješenje.',
    trustCard4Title: 'Recenzije bez filtera',
    trustCard4Body: 'Recenzije pomažu da brže procijenite profil, stil komunikacije i iskustva drugih vlasnika.',
    trustBannerTitle: 'Podrška kad zapne',
    trustBannerBody: 'Ako rezervacija ne ide po planu, javite se PetPark podršci. Svaki slučaj gledamo zasebno i pomažemo pronaći rješenje.',
    featuredBadge: 'Popularni sitteri',
    featuredTitle: 'Pouzdani sitteri koje vlasnici rado biraju',
    featuredDescription: 'Istražite profile s dobrim recenzijama, jasnim opisima usluge i provjerenim podacima.',
    featuredViewAll: 'Pregledaj sve',
    verifiedProfile: 'Verificiran',
    topChoice: 'Top izbor',
    featuredFallbackBio: 'Pouzdan sitter za pse i mačke u vašem gradu.',
    viewProfile: 'Pogledaj profil',
    citiesBadge: 'Gradovi',
    citiesTitle: 'Pronađi usluge u svom gradu',
    citiesDescription: 'PetPark povezuje vlasnike ljubimaca s lokalnim sitterima, groomerima i trenerima diljem Hrvatske.',
    cityCardCta: 'Istraži ponudu',
    finalCtaBadge: 'Spremni za rezervaciju?',
    finalCtaTitle: 'Vaš ljubimac zaslužuje pouzdanu brigu.',
    finalCtaBody: 'Pronađite uslugu za svog ljubimca u nekoliko klikova — od čuvanja i šetnji do groominga, školovanja i udomljavanja.',
    finalCtaPrimary: 'Pronađi sittera',
    finalCtaSecondary: 'Postani sitter',
    sitterCtaBadge: 'Pridruži se PetPark zajednici',
    sitterCtaTitleTop: 'Volite životinje?',
    sitterCtaTitleBottom: 'Pretvorite to u posao koji volite.',
    sitterCtaBody: 'Pridružite se rastućoj mreži sittera i partnera diljem Hrvatske. Postavite vlastite cijene, upravljajte rasporedom i gradite posao uz PetPark.',
    sitterCtaPrimary: 'Postani partner',
    sitterCtaSecondary: 'Istraži PetPark',
    sitterStat1: 'Verifikacija',
    sitterStat1Body: 'Istaknite profil i gradite povjerenje',
    sitterStat2: 'Fleksibilnost',
    sitterStat2Body: 'Postavite vlastite cijene i raspored',
    sitterStat3: 'Rast',
    sitterStat3Body: 'Lakše do novih upita i vidljivosti',
  },
  en: {
    heroBadge: 'Verified sitters and pet services',
    heroTitleStart: 'Find a',
    heroTitleAccent: 'trusted sitter',
    heroTitleEnd: 'for your',
    heroTitlePet: 'pet.',
    heroDescription: 'Find trusted sitters, groomers, and trainers in your city. Clear profiles, real reviews, and fast booking — without the hassle or stress.',
    heroImageAlt: 'Happy dogs and cats together',
    cityPlaceholder: 'Enter a city (e.g. Rijeka, Zagreb...)',
    cityAria: 'City',
    servicePlaceholder: 'Service (boarding, walking, grooming...)',
    serviceAria: 'Service type',
    searchButton: 'Find a sitter',
    trustVerified: 'Verified profiles',
    trustReviews: 'Real reviews',
    trustPayments: 'Secure payments',
    trustSupport: 'Support when needed',
    servicesBadge: 'Services',
    servicesTitle: 'Everything your pet needs',
    servicesDescription: 'From boarding and walks to grooming and training — find the service that fits your pet best.',
    serviceCta: 'View service',
    howItWorksBadge: 'How it works',
    howItWorksTitle: 'Three simple steps to the right care',
    howItWorksDescription: 'PetPark makes it easier to find trusted care for your pet.',
    stepLabel: 'Step',
    trustSectionBadge: 'Safety and trust',
    trustSectionTitle: 'Why pet owners choose PetPark',
    trustSectionDescription: 'Every step is designed to keep your pet safe and give you peace of mind.',
    trustCard1Title: 'What does "Verified" mean?',
    trustCard1Body: 'A verified profile means it passed a basic identity and profile check before being published on PetPark.',
    trustCard2Title: 'Secure payment',
    trustCard2Body: 'Payments are handled through the platform, and if there is a booking issue you can contact support so we can help resolve it together.',
    trustCard3Title: 'Support Mon–Sat 8am–8pm',
    trustCard3Body: 'If something goes sideways, contact support and we will work with you to find the most reasonable solution.',
    trustCard4Title: 'Unfiltered reviews',
    trustCard4Body: 'Reviews help you quickly assess a profile, communication style, and other owners\' experiences.',
    trustBannerTitle: 'Support when plans change',
    trustBannerBody: 'If a booking does not go as planned, contact PetPark support. We review each case individually and help find a solution.',
    featuredBadge: 'Popular sitters',
    featuredTitle: 'Trusted sitters owners love to book',
    featuredDescription: 'Browse profiles with strong reviews, clear service descriptions, and verified details.',
    featuredViewAll: 'View all',
    verifiedProfile: 'Verified',
    topChoice: 'Top choice',
    featuredFallbackBio: 'A trusted sitter for dogs and cats in your city.',
    viewProfile: 'View profile',
    citiesBadge: 'Cities',
    citiesTitle: 'Find services in your city',
    citiesDescription: 'PetPark connects pet owners with local sitters, groomers, and trainers across Croatia.',
    cityCardCta: 'Explore options',
    finalCtaBadge: 'Ready to book?',
    finalCtaTitle: 'Your pet deserves reliable care.',
    finalCtaBody: 'Find the right service for your pet in just a few clicks — from boarding and walks to grooming, training, and adoption.',
    finalCtaPrimary: 'Find a sitter',
    finalCtaSecondary: 'Become a sitter',
    sitterCtaBadge: 'Join the PetPark community',
    sitterCtaTitleTop: 'Love animals?',
    sitterCtaTitleBottom: 'Turn it into work you love.',
    sitterCtaBody: 'Join a growing network of sitters and partners across Croatia. Set your own prices, manage your schedule, and build your business with PetPark.',
    sitterCtaPrimary: 'Become a partner',
    sitterCtaSecondary: 'Explore PetPark',
    sitterStat1: 'Verification',
    sitterStat1Body: 'Stand out and build trust with your profile',
    sitterStat2: 'Flexibility',
    sitterStat2Body: 'Set your own prices and schedule',
    sitterStat3: 'Growth',
    sitterStat3Body: 'Get more inquiries and visibility more easily',
  },
} as const;

export function HomePageContent({ featuredSitters, cities, newsletterSlot }: { featuredSitters: FeaturedSitter[]; cities: City[]; newsletterSlot?: React.ReactNode }) {
  const { language } = useLanguage();
  const locale = language === 'en' ? 'en' : 'hr';
  const t = copy[locale];
  const localizedMainCards = mainCards[locale];
  const localizedServices = services[locale];
  const localizedHowItWorks = howItWorks[locale];

  const featuredService1 = localizedServices[0];
  const featuredService2 = localizedServices[1];
  const FeaturedIcon1 = featuredService1.icon;
  const FeaturedIcon2 = featuredService2.icon;

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════
          HERO v2 — Split asymmetric, editorial composition
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden hero-gradient min-h-[90vh] flex items-center" aria-label="Hero">
        {/* Bold ambient shapes — more dramatic, more layered */}
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-orange-300/25 dark:bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-teal-300/20 dark:bg-teal-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200/10 dark:bg-amber-700/5 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text content */}
            <div className="max-w-xl">
              <div className="mb-6 animate-fade-in-up">
                <Badge className="bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100/80 border-0 text-[13px] px-5 py-2 rounded-full font-medium tracking-wide shadow-none">
                  <PawPrint className="h-3.5 w-3.5 mr-2 opacity-70" />
                  {t.heroBadge}
                </Badge>
              </div>

              {/* Headline — much larger, bolder, dramatic line breaks */}
              <h1 className="text-[3rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] xl:text-[5rem] font-extrabold tracking-[-0.03em] mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)] leading-[1.05]">
                {t.heroTitleStart}{' '}
                <span className="text-gradient">{t.heroTitleAccent}</span>
                <br />
                {t.heroTitleEnd}{' '}
                <span className="text-teal-600 dark:text-teal-400">{t.heroTitlePet}</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in-up delay-200 leading-relaxed max-w-md">
                {t.heroDescription}
              </p>

              {/* Search bar — left-aligned, prominent */}
              <div className="bg-white dark:bg-card rounded-2xl shadow-2xl shadow-black/8 dark:shadow-black/40 p-2.5 animate-fade-in-up delay-300 ring-1 ring-black/[0.06] dark:ring-white/10 max-w-lg">
                <form action="/pretraga" className="flex flex-col sm:flex-row gap-1.5">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" />
                    <Input
                      name="city"
                      placeholder={t.cityPlaceholder}
                      className="pl-11 h-12 sm:h-14 border-0 bg-transparent focus:ring-0 text-[15px] placeholder:text-muted-foreground/50 rounded-xl"
                      aria-label={t.cityAria}
                    />
                  </div>
                  <Button type="submit" size="lg" aria-label={t.searchButton} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 h-12 sm:h-14 px-8 rounded-xl shadow-lg shadow-orange-500/25 text-[15px] font-semibold transition-all duration-200">
                    <Search className="h-4 w-4 mr-2" />
                    {t.searchButton}
                  </Button>
                </form>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-6 mt-8 text-[13px] text-muted-foreground/70 animate-fade-in-up delay-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-500/70" />
                  <span>{t.trustVerified}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400/70 fill-amber-400/70" />
                  <span>{t.trustReviews}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500/70" />
                  <span>{t.trustPayments}</span>
                </div>
              </div>
            </div>

            {/* Right — Dramatic layered image composition */}
            <div className="relative animate-fade-in-up delay-200 hidden lg:block">
              {/* Main hero image — large, with premium frame */}
              <div className="relative">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/15 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/10 aspect-[4/5]">
                  <Image
                    src="/images/services/01-pet-sitting.jpg"
                    alt={t.heroImageAlt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                    priority
                    fetchPriority="high"
                  />
                  {/* Soft vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>

                {/* Floating accent card — bottom left */}
                <div className="absolute -bottom-6 -left-8 bg-white dark:bg-card rounded-2xl p-4 pr-6 shadow-xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.06] dark:ring-white/10 flex items-center gap-3 animate-fade-in-up delay-400">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold font-[var(--font-heading)]">{t.trustVerified}</p>
                    <p className="text-xs text-muted-foreground/60">PetPark</p>
                  </div>
                </div>

                {/* Floating accent card — top right */}
                <div className="absolute -top-4 -right-6 bg-white dark:bg-card rounded-2xl p-3.5 shadow-xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/[0.06] dark:ring-white/10 flex items-center gap-2.5 animate-fade-in-up delay-500">
                  <div className="flex -space-x-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold">4.9</span>
                </div>
              </div>

              {/* Secondary accent image — small, offset */}
              <div className="absolute top-12 -left-12 w-28 h-28 rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/30 ring-1 ring-white/20 rotate-[-6deg]">
                <Image
                  src="/images/services/07-hero-puppy.jpg"
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Mobile hero image — simplified but still bold */}
            <div className="lg:hidden animate-fade-in-up delay-200">
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/5 dark:ring-white/10 aspect-[16/9]">
                <Image
                  src="/hero-pets.jpg"
                  alt={t.heroImageAlt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUICK ACCESS — Elevated floating cards
      ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-10 md:-mt-14" aria-label={locale === 'en' ? 'Quick access' : 'Brzi pristup'}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {localizedMainCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <div className={`group relative bg-white dark:bg-card rounded-2xl p-5 md:p-6 text-center flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/[0.08] dark:hover:shadow-black/25 ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-lg shadow-black/[0.04]`}>
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                    <card.icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className={`font-bold text-[15px] font-[var(--font-heading)] transition-colors duration-200 ${card.accent}`}>{card.title}</h3>
                  <p className="text-xs text-muted-foreground/70 leading-snug hidden sm:block">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SERVICES v2 — Editorial bento grid: 2 large + 6 small
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36" aria-label={locale === 'en' ? 'Services' : 'Usluge'}>
        <div className="container mx-auto px-4">
          <div className="mb-16 max-w-2xl">
            <Badge variant="secondary" className="mb-5 border-0 rounded-full font-medium text-[13px] tracking-wide uppercase px-4 py-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30">{t.servicesBadge}</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-[3rem] font-extrabold mb-4 font-[var(--font-heading)] leading-[1.1] tracking-tight">{t.servicesTitle}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t.servicesDescription}</p>
          </div>

          {/* Bento layout — 2 featured tall cards + compact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {/* Featured card 1 — tall */}
            <Link href={`/pretraga?service=${featuredService1.type}`} className="md:row-span-2">
              <div className="group relative bg-white dark:bg-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/[0.08] dark:hover:shadow-black/25 ring-1 ring-black/[0.05] dark:ring-white/[0.08] shadow-md h-full">
                <div className="relative h-72 md:h-full min-h-[320px] overflow-hidden">
                  <Image src={featuredService1.image} alt={featuredService1.title} fill loading="lazy" decoding="async" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${featuredService1.color} text-white shadow-lg shadow-black/15 mb-4`}>
                      <FeaturedIcon1 className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white font-[var(--font-heading)] mb-2 drop-shadow-sm">{featuredService1.title}</h3>
                    <p className="text-white/75 text-[15px] leading-relaxed mb-4">{featuredService1.description}</p>
                    <span className="text-white/90 text-sm font-medium inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {t.serviceCta} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Featured card 2 — tall */}
            <Link href={`/pretraga?service=${featuredService2.type}`} className="md:row-span-2">
              <div className="group relative bg-white dark:bg-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/[0.08] dark:hover:shadow-black/25 ring-1 ring-black/[0.05] dark:ring-white/[0.08] shadow-md h-full">
                <div className="relative h-72 md:h-full min-h-[320px] overflow-hidden">
                  <Image src={featuredService2.image} alt={featuredService2.title} fill loading="lazy" decoding="async" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${featuredService2.color} text-white shadow-lg shadow-black/15 mb-4`}>
                      <FeaturedIcon2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white font-[var(--font-heading)] mb-2 drop-shadow-sm">{featuredService2.title}</h3>
                    <p className="text-white/75 text-[15px] leading-relaxed mb-4">{featuredService2.description}</p>
                    <span className="text-white/90 text-sm font-medium inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {t.serviceCta} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Compact service cards — right column, stacked */}
            {localizedServices.slice(2).map((service) => (
              <Link key={service.type} href={`/pretraga?service=${service.type}`}>
                <div className="group relative bg-white dark:bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.06] dark:hover:shadow-black/20 ring-1 ring-black/[0.04] dark:ring-white/[0.08] shadow-sm flex items-center gap-5 p-5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <Image src={service.image} alt={service.title} fill loading="lazy" decoding="async" sizes="80px" className="object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-80 transition-opacity duration-300`}>
                      <service.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] font-[var(--font-heading)] mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-orange-500 transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS v2 — Bold numbered steps, dark surface
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36 bg-slate-950 dark:bg-slate-950 text-white relative overflow-hidden" aria-label={locale === 'en' ? 'How it works' : 'Kako funkcionira'}>
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-transparent to-teal-950/20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-5 border-0 rounded-full font-medium text-[13px] tracking-wide uppercase px-4 py-1.5 text-orange-300 bg-orange-500/15">{t.howItWorksBadge}</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-[3rem] font-extrabold mb-4 font-[var(--font-heading)] leading-[1.1] tracking-tight text-white">{t.howItWorksTitle}</h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">{t.howItWorksDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-5xl mx-auto">
            {localizedHowItWorks.map((item, idx) => (
              <div key={item.step} className="relative group">
                {/* Connector line between steps */}
                {idx < localizedHowItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-white/20 to-white/5" />
                )}
                <div className="text-center">
                  {/* Large step number */}
                  <div className="relative inline-flex mb-6">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-2xl shadow-black/30 group-hover:scale-105 transition-transform duration-300`}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center text-sm font-extrabold font-[var(--font-heading)] shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-[var(--font-heading)] text-white">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed text-[15px] max-w-xs mx-auto">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST & SAFETY v2 — Editorial split: big statement + cards
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36" aria-label={locale === 'en' ? 'Safety and trust' : 'Sigurnost i povjerenje'}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Left: bold statement */}
            <div className="lg:col-span-2 lg:sticky lg:top-32">
              <Badge variant="secondary" className="mb-5 border-0 rounded-full font-medium text-[13px] tracking-wide uppercase px-4 py-1.5 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30">{t.trustSectionBadge}</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold mb-5 font-[var(--font-heading)] leading-[1.1] tracking-tight">{t.trustSectionTitle}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t.trustSectionDescription}</p>

              {/* Trust banner — inline in the statement column */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-teal-500/15 dark:shadow-teal-900/20">
                <Shield className="h-6 w-6 mb-3 opacity-80" />
                <h3 className="text-lg font-bold mb-2 font-[var(--font-heading)]">{t.trustBannerTitle}</h3>
                <p className="text-white/80 text-[15px] leading-relaxed">
                  {t.trustBannerBody}
                </p>
              </div>
            </div>

            {/* Right: trust cards — stacked, larger */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {[
                { icon: BadgeCheck, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40', title: t.trustCard1Title, body: t.trustCard1Body },
                { icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', title: t.trustCard2Title, body: t.trustCard2Body },
                { icon: PhoneCall, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', title: t.trustCard3Title, body: t.trustCard3Body },
                { icon: Star, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', title: t.trustCard4Title, body: t.trustCard4Body },
              ].map((card) => (
                <div key={card.title} className="bg-white dark:bg-card rounded-2xl p-7 md:p-8 ring-1 ring-black/[0.04] dark:ring-white/[0.08] flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-5.5 w-5.5 ${card.color}`} />
                  </div>
                  <h3 className="font-bold text-base font-[var(--font-heading)]">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED SITTERS v2 — Magazine-style editorial cards
      ═══════════════════════════════════════════════════════ */}
      {featuredSitters.length > 0 && (
        <section className="py-24 md:py-36 bg-warm-section" aria-label={locale === 'en' ? 'Popular sitters' : 'Popularni sitteri'}>
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-14">
              <div className="max-w-xl">
                <Badge variant="secondary" className="mb-5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-medium text-[13px] tracking-wide uppercase px-4 py-1.5">{t.featuredBadge}</Badge>
                <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold mb-3 font-[var(--font-heading)] leading-[1.1] tracking-tight">{t.featuredTitle}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">{t.featuredDescription}</p>
              </div>
              <Link href="/pretraga" className="hidden md:inline-flex">
                <Button variant="outline" className="rounded-full ring-1 ring-black/[0.08] dark:ring-white/[0.12] border-0 shadow-none hover:bg-accent px-6">
                  {t.featuredViewAll}
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Featured sitter — large editorial card */}
            {(() => {
              const hero = featuredSitters[0];
              return (
                <Link href={`/sitter/${hero.id}`} className="block mb-5">
                  <div className="group bg-white dark:bg-card rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/[0.08] dark:hover:shadow-black/25 ring-1 ring-black/[0.05] dark:ring-white/[0.08] shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                      <div className={`md:col-span-2 bg-gradient-to-br ${hero.gradient} flex items-center justify-center p-12 md:p-16`}>
                        <span className="text-white text-7xl md:text-8xl font-extrabold font-[var(--font-heading)] opacity-90">{hero.initial}</span>
                      </div>
                      <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          {hero.verified && (
                            <Badge className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-0 text-xs font-medium px-3 py-1 rounded-lg">
                              {t.verifiedProfile}
                            </Badge>
                          )}
                          {hero.superhost && (
                            <Badge variant="secondary" className="rounded-full text-xs font-medium">{t.topChoice}</Badge>
                          )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-2">{hero.name}</h3>
                        <div className="flex items-center gap-4 text-sm mb-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground/70">
                            <MapPin className="h-4 w-4" />
                            {hero.city}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{hero.rating?.toFixed(1) || '—'}</span>
                            <span className="text-muted-foreground/60">({hero.reviews || 0})</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3 text-base">{hero.bio || t.featuredFallbackBio}</p>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          {t.viewProfile} <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Rest of sitters — grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {featuredSitters.slice(1).map((sitter) => (
                <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                  <div className="group bg-white dark:bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.06] dark:hover:shadow-black/20 ring-1 ring-black/[0.04] dark:ring-white/[0.08] shadow-sm">
                    <div className="p-6 md:p-7">
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3.5">
                          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${sitter.gradient} text-white font-bold flex items-center justify-center text-lg shadow-md`}>
                            {sitter.initial}
                          </div>
                          <div>
                            <h3 className="font-bold text-[17px] leading-tight font-[var(--font-heading)]">{sitter.name}</h3>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground/70 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {sitter.city}
                            </div>
                          </div>
                        </div>
                        {sitter.verified && (
                          <Badge className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-0 text-xs font-medium px-2.5 py-1 rounded-lg">
                            {t.verifiedProfile}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm mb-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{sitter.rating?.toFixed(1) || '—'}</span>
                          <span className="text-muted-foreground/60">({sitter.reviews || 0})</span>
                        </div>
                        {sitter.superhost && (
                          <Badge variant="secondary" className="rounded-full text-xs font-medium">{t.topChoice}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6">{sitter.bio || t.featuredFallbackBio}</p>
                      <div className="flex items-center justify-end pt-5 border-t border-border/40">
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400 inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {t.viewProfile} <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          CITIES v2 — Cinematic panoramic cards, 2-row editorial
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36" aria-label={locale === 'en' ? 'Cities' : 'Gradovi'}>
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-5 border-0 rounded-full font-medium text-[13px] tracking-wide uppercase px-4 py-1.5 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30">{t.citiesBadge}</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-[3rem] font-extrabold mb-4 font-[var(--font-heading)] leading-[1.1] tracking-tight">{t.citiesTitle}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">{t.citiesDescription}</p>
          </div>

          {/* Row 1: 3 large cinematic cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {cities.slice(0, 3).map((city) => (
              <Link key={city.name} href={city.landing ?? `/pretraga?city=${encodeURIComponent(city.name)}`}>
                <div className="group relative rounded-3xl overflow-hidden ring-1 ring-black/[0.05] dark:ring-white/[0.08] shadow-md hover:shadow-2xl hover:shadow-black/[0.08] dark:hover:shadow-black/25 transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 md:h-72 relative flex items-end p-6 md:p-8 overflow-hidden">
                    <Image src={city.image} alt={city.name} fill loading="lazy" decoding="async" sizes="(min-width: 640px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                    <div className="relative">
                      <h3 className="text-white font-extrabold text-2xl md:text-3xl leading-none drop-shadow-md font-[var(--font-heading)] mb-2">{city.name}</h3>
                      <p className="text-white/60 text-sm font-medium inline-flex items-center gap-1.5 group-hover:text-white/80 transition-colors">
                        {t.cityCardCta} <ArrowRight className="h-3.5 w-3.5" />
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2: 3 smaller cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
            {cities.slice(3).map((city) => (
              <Link key={city.name} href={city.landing ?? `/pretraga?city=${encodeURIComponent(city.name)}`}>
                <div className="group relative rounded-2xl overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.08] shadow-sm hover:shadow-lg hover:shadow-black/[0.06] dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="h-40 md:h-48 relative flex items-end p-5 md:p-6 overflow-hidden">
                    <Image src={city.image} alt={city.name} fill loading="lazy" decoding="async" sizes="(min-width: 640px) 33vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="relative">
                      <h3 className="text-white font-bold text-lg leading-none drop-shadow-sm font-[var(--font-heading)]">{city.name}</h3>
                      <p className="text-white/60 text-xs mt-1.5 font-medium">{t.cityCardCta}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter slot */}
      {newsletterSlot}

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA v2 — Full-bleed warm gradient, more dramatic
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 relative overflow-hidden" aria-label={locale === 'en' ? 'Final call to action' : 'Završni poziv na akciju'}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/80 to-teal-50/60 dark:from-orange-950/20 dark:via-background dark:to-teal-950/15" />
        {/* Decorative shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-orange-200/30 dark:bg-orange-800/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-teal-200/25 dark:bg-teal-800/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-8 bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100/80 border-0 rounded-full font-medium text-[13px] tracking-wide uppercase px-4 py-1.5 shadow-none">
              {t.finalCtaBadge}
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold mb-6 font-[var(--font-heading)] tracking-[-0.02em] leading-[1.08]">
              {t.finalCtaTitle}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
              {t.finalCtaBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pretraga">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white px-10 h-14 rounded-2xl shadow-xl shadow-orange-500/25 text-base font-semibold transition-all duration-200">
                  {t.finalCtaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/postani-sitter">
                <Button size="lg" variant="outline" className="px-10 h-14 rounded-2xl ring-1 ring-black/[0.08] dark:ring-white/[0.12] border-0 shadow-none text-base">
                  {t.finalCtaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SITTER RECRUITMENT v2 — Cinematic dark gradient
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 relative overflow-hidden" aria-label={locale === 'en' ? 'Call for sitters' : 'Poziv za sittere'}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-teal-500" />
        {/* Ambient depth shapes */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white/[0.04] rounded-full -translate-y-1/2 -translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/[0.04] rounded-full translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-black/[0.06] rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto">
            <Badge className="mb-8 bg-white/15 text-white hover:bg-white/15 border-0 text-[13px] px-5 py-2 rounded-full font-medium tracking-wide shadow-none">
              <Heart className="h-3.5 w-3.5 mr-2 fill-white opacity-80" />
              {t.sitterCtaBadge}
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold mb-8 text-white leading-[1.05] tracking-[-0.02em] font-[var(--font-heading)]">
              {t.sitterCtaTitleTop}<br />{t.sitterCtaTitleBottom}
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-12 max-w-lg mx-auto leading-relaxed">
              {t.sitterCtaBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registracija?role=sitter">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-2xl shadow-black/15 text-base px-10 h-14 font-bold rounded-2xl transition-all duration-200">
                  {t.sitterCtaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pretraga">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 text-base px-10 h-14 rounded-2xl transition-all duration-200">
                  {t.sitterCtaSecondary}
                </Button>
              </Link>
            </div>

            {/* Stats — editorial treatment with dividers */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 mt-20 max-w-3xl mx-auto">
              {[
                { label: t.sitterStat1, body: t.sitterStat1Body },
                { label: t.sitterStat2, body: t.sitterStat2Body },
                { label: t.sitterStat3, body: t.sitterStat3Body },
              ].map((stat, idx) => (
                <div key={stat.label} className={`text-white/80 flex-1 ${idx > 0 ? 'sm:border-l sm:border-white/15 sm:pl-8' : ''}`}>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2 font-semibold">{stat.label}</p>
                  <p className="text-[15px] font-medium leading-relaxed">{stat.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
