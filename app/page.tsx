import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Shield, Star, Heart, MapPin, ChevronRight,
  Home, Dog, House, Eye, Sun, Calendar,
  ArrowRight, Scissors, GraduationCap, BookOpen,
  PawPrint, ShieldCheck, CreditCard, PhoneCall, BadgeCheck,
} from 'lucide-react';

// Revalidate the homepage at most once per 60 seconds (ISR)
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'PetPark — Pronađite pouzdanog sittera za svog ljubimca' },
  description: 'Verificirani pet sitteri, groomeri i treneri u vašem gradu. Rezervirajte online brzo, jasno i bez stresa uz PetPark.',
  keywords: ['pet sitting hrvatska', 'čuvanje ljubimaca', 'pet sitter', 'grooming', 'školovanje pasa', 'rezervacija sittera'],
  openGraph: {
    title: 'PetPark — Pronađite pouzdanog sittera za svog ljubimca',
    description: 'Verificirani sitteri, jasne recenzije i brza online rezervacija za ljubimce u Hrvatskoj.',
    url: 'https://petpark.hr',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr' },
};
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getSitters } from '@/lib/db';
const NewsletterSignup = dynamic(() => import('@/components/shared/newsletter-signup').then((mod) => mod.NewsletterSignup));
import { ItemListJsonLd } from '@/components/seo/json-ld';

const homepageServices = [
  { name: 'Čuvanje ljubimaca', url: 'https://petpark.hr/pretraga', description: 'Pronađite pouzdane sittere u vašem gradu' },
  { name: 'Grooming', url: 'https://petpark.hr/njega', description: 'Profesionalni groomeri i saloni za njegu ljubimaca' },
  { name: 'Školovanje pasa', url: 'https://petpark.hr/dresura', description: 'Certificirani treneri i programi za pse' },
  { name: 'Veterinari', url: 'https://petpark.hr/veterinari', description: 'Veterinarske ordinacije u vašem gradu' },
];

// Gradient palette for sitter cards
const SITTER_GRADIENTS = [
  'from-orange-400 to-amber-300',
  'from-teal-400 to-cyan-300',
  'from-purple-400 to-pink-300',
  'from-emerald-400 to-teal-300',
  'from-rose-400 to-orange-300',
  'from-sky-400 to-blue-300',
];

const howItWorks = [
  { step: 1, title: 'Pretražite sittere', description: 'Unesite svoj grad i datume, pregledajte profile verificiranih sittera i pročitajte recenzije drugih vlasnika.', icon: Search, color: 'from-orange-500 to-amber-400' },
  { step: 2, title: 'Rezervirajte termin', description: 'Kontaktirajte sittera, dogovorite detalje i rezervirajte uslugu online. Plaćanje je sigurno i jednostavno.', icon: Calendar, color: 'from-teal-500 to-emerald-400' },
  { step: 3, title: 'Uživajte bez brige', description: 'Vaš ljubimac je u sigurnim rukama! Primajte ažuriranja i fotke. Nakon usluge, ostavite recenziju.', icon: Shield, color: 'from-purple-500 to-pink-400' },
];

const mainCards = [
  { href: '/pretraga', emoji: '🐾', title: 'Sitteri', description: 'Pouzdani čuvari u vašem gradu', bg: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20', hover: 'hover:shadow-orange-200/40 dark:hover:shadow-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30' },
  { href: '/njega', emoji: '✂️', title: 'Grooming', description: 'Kupanje, šišanje i njega', bg: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20', hover: 'hover:shadow-pink-200/40 dark:hover:shadow-pink-900/20', border: 'border-pink-100 dark:border-pink-900/30' },
  { href: '/dresura', emoji: '🎓', title: 'Školovanje pasa', description: 'Profesionalna obuka i trening', bg: 'from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20', hover: 'hover:shadow-indigo-200/40 dark:hover:shadow-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-900/30' },
  { href: '/veterinari', emoji: '🩺', title: 'Veterinari', description: 'Provjerene ordinacije i pomoć', bg: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20', hover: 'hover:shadow-teal-200/40 dark:hover:shadow-teal-900/20', border: 'border-teal-100 dark:border-teal-900/30' },
];

const services = [
  { type: 'boarding' as const, title: 'Smještaj', description: 'Vaš ljubimac boravi kod sittera', icon: Home, color: 'from-orange-500 to-amber-500', image: '/images/services/01-pet-sitting.jpg' },
  { type: 'walking' as const, title: 'Šetnja', description: 'Šetnja vašeg psa u kvartu', icon: Dog, color: 'from-emerald-500 to-teal-500', image: '/images/services/04-setanje-pasa.jpg' },
  { type: 'house-sitting' as const, title: 'Čuvanje u kući', description: 'Sitter dolazi u vašu kuću', icon: House, color: 'from-blue-500 to-cyan-500', image: '/images/services/06-community.jpg' },
  { type: 'drop-in' as const, title: 'Kratki posjet', description: 'Posjet vašem ljubimcu od 30min', icon: Eye, color: 'from-purple-500 to-pink-500', image: '/images/services/08-macka.jpg' },
  { type: 'daycare' as const, title: 'Dnevna briga', description: 'Cjelodnevna briga kod sittera', icon: Sun, color: 'from-rose-500 to-orange-500', image: '/images/services/07-hero-puppy.jpg' },
  { type: 'grooming' as const, title: 'Grooming', description: 'Kupanje, šišanje i njega dlake', icon: Scissors, color: 'from-pink-500 to-fuchsia-500', image: '/images/services/08-macka.jpg' },
  { type: 'agility' as const, title: 'Agility trening', description: 'Sportski trening za aktivne pse', icon: GraduationCap, color: 'from-yellow-500 to-orange-500', image: '/images/services/04-setanje-pasa.jpg' },
  { type: 'training' as const, title: 'Školovanje pasa', description: 'Profesionalna obuka i socijalizacija', icon: BookOpen, color: 'from-teal-500 to-emerald-500', image: '/images/services/06-community.jpg' },
];

const cities = [
  { name: 'Zagreb', image: '/images/cities/zagreb.jpg', landing: '/cuvanje-pasa-zagreb' },
  { name: 'Rijeka', image: '/images/cities/rijeka.jpg', landing: '/cuvanje-pasa-rijeka' },
  { name: 'Split', image: '/images/cities/split.jpg', landing: '/cuvanje-pasa-split' },
  { name: 'Osijek', image: '/images/cities/osijek.jpg', landing: null },
  { name: 'Pula', image: '/images/cities/pula.jpg', landing: null },
  { name: 'Zadar', image: '/images/cities/zadar.jpg', landing: null },
];

export default async function HomePage() {
  const topSitters = await getSitters({ sort: 'rating', limit: 6, fields: 'homepage-card' });

  const featuredSitters = topSitters.map((s, i) => ({
    id: s.user_id,
    name: s.user?.name || 'Sitter',
    city: s.city || '',
    rating: s.rating_avg,
    reviews: s.review_count,
    bio: s.bio || '',
    verified: s.verified,
    superhost: s.superhost,
    initial: (s.user?.name || 'S').charAt(0),
    gradient: SITTER_GRADIENTS[i % SITTER_GRADIENTS.length],
  }));

  return (
    <div>
      <ItemListJsonLd items={homepageServices} />
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden hero-gradient" aria-label="Hero">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-orange-300/20 dark:bg-orange-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-64 h-64 bg-teal-200/15 dark:bg-teal-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-float delay-200" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 dark:bg-amber-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-float delay-300" />
        <div className="container mx-auto px-4 py-20 md:py-32 lg:py-40 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up shadow-sm rounded-full font-semibold">
              <PawPrint className="h-3.5 w-3.5 mr-1.5" />
              Verificirani sitteri i usluge za ljubimce
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Pronađite <span className="text-orange-500">pouzdanog sittera</span> za svog{' '}
              <span className="text-teal-600 dark:text-teal-400">ljubimca.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              Verificirani čuvari, groomeri i treneri u vašem gradu. Rezervirajte online brzo, jasno i bez stresa — uz recenzije stvarnih korisnika i podršku kad zatreba.
            </p>

            <div className="mb-8 animate-fade-in-up delay-200 max-w-2xl mx-auto">
              <Image
                src="/hero-pets.jpg"
                alt="Sretni psi i mačke zajedno"
                width={672}
                height={375}
                sizes="(max-width: 672px) 100vw, 672px"
                className="w-full h-44 md:h-60 lg:h-68 object-cover rounded-3xl shadow-xl shadow-orange-200/30 dark:shadow-orange-900/20 border-4 border-white/80 dark:border-white/10"
                priority
                fetchPriority="high"
              />
            </div>

            <div className="bg-white dark:bg-card rounded-2xl md:rounded-full shadow-2xl shadow-orange-200/30 dark:shadow-black/20 p-2.5 md:p-3 max-w-2xl mx-auto animate-fade-in-up delay-300 border border-orange-100/60 dark:border-orange-800/30">
              <form action="/pretraga" className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <Input
                    name="city"
                    placeholder="Unesite grad (npr. Rijeka, Zagreb...)"
                    className="pl-11 h-12 md:h-13 border-0 bg-transparent focus:ring-0 text-base placeholder:text-muted-foreground/60 rounded-xl md:rounded-full"
                    aria-label="Grad"
                  />
                </div>
                <div className="hidden md:block w-px bg-border my-2" />
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500" />
                  <Input
                    name="service"
                    placeholder="Usluga (smještaj, šetnja, grooming...)"
                    className="pl-11 h-12 md:h-13 border-0 bg-transparent focus:ring-0 text-base placeholder:text-muted-foreground/60 rounded-xl md:rounded-full"
                    aria-label="Vrsta usluge"
                  />
                </div>
                <Button type="submit" size="lg" aria-label="Pronađi sittera" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 h-12 md:h-13 px-8 rounded-xl md:rounded-full btn-hover shadow-lg shadow-orange-300/40 dark:shadow-orange-900/30 text-base font-semibold">
                  <Search className="h-4 w-4 mr-2" />
                  Pronađi sittera
                </Button>
              </form>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 text-sm text-muted-foreground animate-fade-in-up delay-400 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-500" />
                <span>Ručno verificirani profili</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Recenzije stvarnih korisnika</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span>Sigurno plaćanje</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-rose-400" />
                <span>Podrška pon–sub 8–20h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 relative z-10" aria-label="Brzi pristup">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 -mt-8 md:-mt-12">
            {mainCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card className={`group card-hover cursor-pointer h-full border ${card.border} shadow-sm ${card.hover} hover:shadow-lg rounded-2xl overflow-hidden animate-fade-in-up bg-gradient-to-br ${card.bg}`}>
                  <CardContent className="p-5 md:p-6 text-center flex flex-col items-center gap-2">
                    <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-200 block">{card.emoji}</span>
                    <h3 className="font-bold text-base font-[var(--font-heading)] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-snug hidden sm:block">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" aria-label="Usluge">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">Usluge</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Sve što vaš ljubimac treba</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Od čuvanja i šetnji do groominga i školovanja — pronađite uslugu koja odgovara vašem ljubimcu.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service, i) => (
              <Link key={service.type} href={`/pretraga?service=${service.type}`}>
                <Card className={`group overflow-hidden card-hover border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                  <div className="relative h-44 overflow-hidden">
                    <Image src={service.image} alt={service.title} fill loading="lazy" decoding="async" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className={`absolute top-4 left-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-extrabold font-[var(--font-heading)]">{service.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <div className="mt-4 flex items-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                      Pregledaj uslugu <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-section relative overflow-hidden" aria-label="Kako funkcionira">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Kako funkcionira</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Tri jednostavna koraka do idealne brige</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">PetPark vam olakšava pronalazak provjerene usluge za vašeg ljubimca.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <Card key={item.step} className={`relative overflow-hidden border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${(i + 1) * 100}`}>
                <CardContent className="p-6 md:p-7">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg mb-5`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <Badge className="mb-3 bg-accent text-accent-foreground rounded-full border-0">Korak {item.step}</Badge>
                  <h3 className="text-xl font-bold mb-3 font-[var(--font-heading)]">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Safety Section ── */}
      <section className="py-16 md:py-24 bg-warm-section relative overflow-hidden" aria-label="Sigurnost i povjerenje">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Sigurnost i povjerenje</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Zašto vlasnici biraju PetPark?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Svaki korak je osmišljen da vaš ljubimac bude siguran, a vi mirni.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-12">
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-teal-100/60 dark:border-teal-900/30 flex flex-col gap-3 animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                <BadgeCheck className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-base font-[var(--font-heading)]">Što znači &ldquo;Verificiran&rdquo;?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Verificirani profil znači da je prošla osnovna provjera identiteta i profila prije objave na PetParku.</p>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-blue-100/60 dark:border-blue-900/30 flex flex-col gap-3 animate-fade-in-up delay-100">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-base font-[var(--font-heading)]">Sigurno plaćanje</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Plaćanje se odvija kroz platformu, a za probleme s rezervacijom možete se javiti podršci da zajedno riješimo slučaj.</p>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-rose-100/60 dark:border-rose-900/30 flex flex-col gap-3 animate-fade-in-up delay-200">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <PhoneCall className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="font-bold text-base font-[var(--font-heading)]">Podrška pon–sub 8–20h</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Ako nešto zapne, javljate se podršci i zajedno tražimo najrazumnije rješenje.</p>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-amber-100/60 dark:border-amber-900/30 flex flex-col gap-3 animate-fade-in-up delay-300">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </div>
              <h3 className="font-bold text-base font-[var(--font-heading)]">Recenzije bez filtera</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Recenzije pomažu da brže procijenite profil, stil komunikacije i iskustva drugih vlasnika.</p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 md:p-8 text-white text-center shadow-lg shadow-teal-200/40 dark:shadow-teal-900/20">
            <Shield className="h-8 w-8 mx-auto mb-3 opacity-90" />
            <h3 className="text-xl font-extrabold mb-2 font-[var(--font-heading)]">Podrška kad zapne</h3>
            <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Ako rezervacija ne ide po planu, javite se PetPark podršci. Svaki slučaj gledamo zasebno i pomažemo pronaći rješenje.
            </p>
          </div>
        </div>
      </section>


      {featuredSitters.length > 0 && (
        <section className="py-16 md:py-24" aria-label="Popularni sitteri">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">Popularni sitteri</Badge>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-[var(--font-heading)]">Pouzdani čuvari koje vlasnici rado biraju</h2>
                <p className="text-muted-foreground text-lg max-w-2xl">Istražite profile sittera s najboljim ocjenama i verifikacijom.</p>
              </div>
              <Link href="/pretraga" className="hidden md:inline-flex">
                <Button variant="outline" className="rounded-full">
                  Pregledaj sve
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredSitters.map((sitter, i) => (
                <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                  <Card className={`overflow-hidden border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${sitter.gradient} text-white font-bold flex items-center justify-center text-lg shadow-lg`}>
                            {sitter.initial}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight font-[var(--font-heading)]">{sitter.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {sitter.city}
                            </div>
                          </div>
                        </div>
                        {sitter.verified && <Badge className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-50">Verificiran profil</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{sitter.rating?.toFixed(1) || '—'}</span>
                          <span className="text-muted-foreground">({sitter.reviews || 0})</span>
                        </div>
                        {sitter.superhost && <Badge variant="secondary" className="rounded-full">Top izbor</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5">{sitter.bio || 'Pouzdan sitter za pse i mačke u vašem gradu.'}</p>
                      <div className="flex items-center justify-end pt-4 border-t border-border/60">
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1">
                          Pogledaj profil <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24" aria-label="Gradovi">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Gradovi</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Pronađi usluge u svom gradu</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">PetPark povezuje vlasnike ljubimaca s lokalnim sitterima, groomerima i trenerima diljem Hrvatske.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link key={city.name} href={city.landing ?? `/pretraga?city=${encodeURIComponent(city.name)}`}>
                <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm card-hover">
                  <CardContent className="p-0">
                    <div className="h-32 md:h-36 relative flex items-end p-4 overflow-hidden">
                      <Image src={city.image} alt={city.name} fill loading="lazy" decoding="async" sizes="(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 46vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/5" />
                      <div className="relative">
                        <h3 className="text-white font-extrabold text-lg leading-none drop-shadow-sm font-[var(--font-heading)]">{city.name}</h3>
                        <p className="text-white/90 text-sm mt-1 font-medium">Istraži ponudu u gradu</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSignup />

      <section className="py-16 md:py-24 relative overflow-hidden" aria-label="Završni poziv na akciju">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-orange-950/20 dark:via-background dark:to-teal-950/20" />
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 rounded-full font-semibold dark:bg-orange-900/30 dark:text-orange-300">
              Spremni za rezervaciju?
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 font-[var(--font-heading)]">
              Vaš ljubimac zaslužuje pouzdanu brigu.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Pronađite sittera, groomera ili trenera u svom gradu — s jasnim profilima, recenzijama i podrškom ako zapne.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pretraga">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 rounded-xl shadow-lg shadow-orange-300/30">
                  Pronađi sittera
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/postani-sitter">
                <Button size="lg" variant="outline" className="px-8 rounded-xl">
                  Postani sitter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden" aria-label="Poziv za sittere">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-teal-500" />
        <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 opacity-[0.06]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-y-1/2 translate-x-1/2 opacity-[0.06]" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-0 text-sm px-4 py-1.5 rounded-full font-semibold">
              <Heart className="h-3.5 w-3.5 mr-1.5 fill-white" />
              Pridruži se PetPark zajednici
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-white leading-tight font-[var(--font-heading)]">
              Volite životinje?<br />Pretvorite to u posao koji volite.
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
              Pridružite se rastućoj mreži sittera i partnera diljem Hrvatske. Postavite vlastite cijene, upravljajte rasporedom i gradite posao uz PetPark.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/registracija?role=sitter">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-black/10 text-base px-8 btn-hover font-bold rounded-xl">
                  Postani partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pretraga">
                <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 text-base px-8 rounded-xl">
                  Istraži PetPark
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 max-w-3xl mx-auto text-white/85">
              <div className="animate-fade-in-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-2">Verifikacija</p>
                <p className="text-base font-semibold">Istaknite profil i gradite povjerenje</p>
              </div>
              <div className="animate-fade-in-up delay-200">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-2">Fleksibilnost</p>
                <p className="text-base font-semibold">Postavite vlastite cijene i raspored</p>
              </div>
              <div className="animate-fade-in-up delay-400">
                <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-2">Rast</p>
                <p className="text-base font-semibold">Lakše do novih upita i vidljivosti</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
