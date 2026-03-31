import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Shield, Star, Heart, MapPin, ChevronRight,
  Home, Dog, House, Eye, Sun, Users, Calendar,
  ArrowRight, Quote, Scissors, GraduationCap, BookOpen,
  PawPrint,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'PetPark — Sve za ljubimce na jednom mjestu',
  description: 'Čuvanje, grooming, školovanje pasa, veterinari, pet shop, udomljavanje, dog-friendly lokacije i zajednica ljubitelja životinja — sve na jednom mjestu u Hrvatskoj.',
  keywords: ['pet sitting hrvatska', 'čuvanje ljubimaca', 'grooming', 'školovanje pasa', 'veterinar', 'pet shop', 'udomljavanje', 'dog-friendly'],
  openGraph: {
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Čuvanje, grooming, školovanje, veterinari, shop, udomljavanje i zajednica — sve u jednoj aplikaciji.',
    url: 'https://petpark.hr',
    type: 'website',
  },
};
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { getLostPets } from '@/lib/db';
import { getSitters } from '@/lib/db';
import { LOST_PET_SPECIES_LABELS } from '@/lib/types';
const NewsletterSignup = dynamic(() => import('@/components/shared/newsletter-signup').then((mod) => mod.NewsletterSignup));
import { ItemListJsonLd } from '@/components/seo/json-ld';

const homepageServices = [
  { name: 'Čuvanje ljubimaca', url: 'https://petpark.hr/pretraga', description: 'Pronađite pouzdane sittere u vašem gradu' },
  { name: 'Grooming', url: 'https://petpark.hr/njega', description: 'Profesionalni saloni za uljepšavanje ljubimaca' },
  { name: 'Školovanje pasa', url: 'https://petpark.hr/dresura', description: 'Certificirani treneri i programi za pse' },
  { name: 'Veterinari', url: 'https://petpark.hr/veterinari', description: 'Veterinarske ordinacije u vašem gradu' },
  { name: 'Pet Shop', url: 'https://petpark.hr/shop', description: 'Hrana, igračke i oprema za ljubimce' },
  { name: 'Udomljavanje', url: 'https://petpark.hr/udomljavanje', description: 'Psi i mačke koji traže dom' },
  { name: 'Dog-Friendly lokacije', url: 'https://petpark.hr/dog-friendly', description: 'Kafići, restorani i plaže za pse' },
  { name: 'Izgubljeni ljubimci', url: 'https://petpark.hr/izgubljeni', description: 'Prijavite ili pronađite izgubljenog ljubimca' },
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


const reviewCards = [
  { name: 'Marina K.', city: 'Rijeka', text: 'Pronašli smo savršenu čuvaricu za našeg Maxa! Ana je slala fotke svaki dan i Max se vratio sretan kao nikad.', rating: 5, initial: 'M', gradient: 'from-orange-400 to-rose-400', petType: 'dog' as const },
  { name: 'Luka P.', city: 'Zagreb', text: 'Najbolji posao ikad - zarađujem radeći ono što volim! PetPark mi je omogućio fleksibilan raspored i divne klijente.', rating: 5, initial: 'L', gradient: 'from-teal-400 to-cyan-400', petType: 'dog' as const, isSitter: true },
  { name: 'Nina Š.', city: 'Split', text: 'Mačka Mila je prvi put bila sama i bilo me strah. Ali sitterica je bila predivna i slala ažuriranja svakih par sati!', rating: 5, initial: 'N', gradient: 'from-purple-400 to-pink-400', petType: 'cat' as const },
  { name: 'Tomislav B.', city: 'Osijek', text: 'Filip je spasio naš godišnji odmor! Buddy je uživao u velikom vrtu. GPS tracking šetnji nam je dao potpuni mir.', rating: 5, initial: 'T', gradient: 'from-blue-400 to-indigo-400', petType: 'dog' as const },
  { name: 'Ana M.', city: 'Pula', text: 'Kao sitterica na PetParku zarađujem 600€ mjesečno. Fleksibilno, zabavno i upoznajem divne ljubimce svaki dan!', rating: 5, initial: 'A', gradient: 'from-emerald-400 to-teal-400', petType: 'cat' as const, isSitter: true },
  { name: 'Petra V.', city: 'Zadar', text: 'Treći put koristimo PetPark i svaki put je iskustvo savršeno. Verificirani sitteri daju nam potpuno povjerenje.', rating: 5, initial: 'P', gradient: 'from-amber-400 to-orange-400', petType: 'dog' as const },
];

const howItWorks = [
  { step: 1, title: 'Pretražite sittere', description: 'Unesite svoj grad i datume, pregledajte profile verificiranih sittera i pročitajte recenzije drugih vlasnika.', icon: Search, color: 'from-orange-500 to-amber-400' },
  { step: 2, title: 'Rezervirajte termin', description: 'Kontaktirajte sittera, dogovorite detalje i rezervirajte uslugu online. Plaćanje je sigurno i jednostavno.', icon: Calendar, color: 'from-teal-500 to-emerald-400' },
  { step: 3, title: 'Uživajte bez brige', description: 'Vaš ljubimac je u sigurnim rukama! Primajte ažuriranja i fotke. Nakon usluge, ostavite recenziju.', icon: Shield, color: 'from-purple-500 to-pink-400' },
];

const mainCards = [
  { href: '/pretraga', emoji: '🐾', title: 'Sitteri', description: 'Pouzdani čuvari u vašem gradu', bg: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20', hover: 'hover:shadow-orange-200/40 dark:hover:shadow-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30' },
  { href: '/njega', emoji: '✂️', title: 'Grooming', description: 'Šišanje, kupanje i njegu noktiju', bg: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20', hover: 'hover:shadow-pink-200/40 dark:hover:shadow-pink-900/20', border: 'border-pink-100 dark:border-pink-900/30' },
  { href: '/dresura', emoji: '🎓', title: 'Školovanje pasa', description: 'Profesionalna obuka i trening', bg: 'from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20', hover: 'hover:shadow-indigo-200/40 dark:hover:shadow-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-900/30' },
  { href: '/forum', emoji: '💬', title: 'Forum', description: 'Zajednica ljubitelja životinja', bg: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20', hover: 'hover:shadow-teal-200/40 dark:hover:shadow-teal-900/20', border: 'border-teal-100 dark:border-teal-900/30' },
  { href: '/zajednica', emoji: '📝', title: 'Blog', description: 'Savjeti, vodiči i priče', bg: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20', hover: 'hover:shadow-purple-200/40 dark:hover:shadow-purple-900/20', border: 'border-purple-100 dark:border-purple-900/30' },
  { href: '/shop', emoji: '🛒', title: 'Webshop', description: 'Sve za vašeg ljubimca', bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20', hover: 'hover:shadow-amber-200/40 dark:hover:shadow-amber-900/20', border: 'border-amber-100 dark:border-amber-900/30' },
];

const services = [
  { type: 'boarding' as const, title: 'Smještaj', description: 'Vaš ljubimac boravi kod sittera', icon: Home, price: 'od 20€/noć', color: 'from-orange-500 to-amber-500', image: '/images/services/01-pet-sitting.jpg' },
  { type: 'walking' as const, title: 'Šetnja', description: 'Šetnja vašeg psa u kvartu', icon: Dog, price: 'od 8€/šetnja', color: 'from-emerald-500 to-teal-500', image: '/images/services/04-setanje-pasa.jpg' },
  { type: 'house-sitting' as const, title: 'Čuvanje u kući', description: 'Sitter dolazi u vašu kuću', icon: House, price: 'od 30€/noć', color: 'from-blue-500 to-cyan-500', image: '/images/services/06-community.jpg' },
  { type: 'drop-in' as const, title: 'Kratki posjet', description: 'Posjet vašem ljubimcu od 30min', icon: Eye, price: 'od 12€/posjet', color: 'from-purple-500 to-pink-500', image: '/images/services/08-macka.jpg' },
  { type: 'daycare' as const, title: 'Dnevna briga', description: 'Cjelodnevna briga kod sittera', icon: Sun, price: 'od 18€/dan', color: 'from-rose-500 to-orange-500', image: '/images/services/07-hero-puppy.jpg' },
  { type: 'grooming' as const, title: 'Grooming', description: 'Kupanje, šišanje i njega dlake', icon: Scissors, price: 'od 25€', color: 'from-pink-500 to-fuchsia-500', image: '/images/services/08-macka.jpg' },
  { type: 'agility' as const, title: 'Agility trening', description: 'Sportski trening za aktivne pse', icon: GraduationCap, price: 'od 15€/sat', color: 'from-yellow-500 to-orange-500', image: '/images/services/04-setanje-pasa.jpg' },
  { type: 'training' as const, title: 'Školovanje pasa', description: 'Profesionalna obuka i socijalizacija', icon: BookOpen, price: 'od 20€/sat', color: 'from-teal-500 to-emerald-500', image: '/images/services/06-community.jpg' },
];

const cities = [
  { name: 'Zagreb', sitters: 180, image: '/images/cities/zagreb.jpg' },
  { name: 'Rijeka', sitters: 95, image: '/images/cities/rijeka.jpg' },
  { name: 'Split', sitters: 120, image: '/images/cities/split.jpg' },
  { name: 'Osijek', sitters: 45, image: '/images/cities/osijek.jpg' },
  { name: 'Pula', sitters: 55, image: '/images/cities/pula.jpg' },
  { name: 'Zadar', sitters: 60, image: '/images/cities/zadar.jpg' },
];

export default async function HomePage() {
  // Fetch top-rated sitters from Supabase
  const topSitters = await getSitters({ sort: 'rating', limit: 6, fields: 'homepage-card' });
  const featuredSitters = topSitters.map((s, i) => ({
    id: s.user_id,
    name: s.user?.name || 'Sitter',
    city: s.city || '',
    rating: s.rating_avg,
    reviews: s.review_count,
    price: Math.min(...Object.values(s.prices || {}).filter(Boolean) as number[]) || 20,
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
              Sve za ljubimce na jednom mjestu
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Za sretne <span className="text-orange-500">ljubimce</span> i{' '}
              <span className="text-teal-600 dark:text-teal-400">mirnije vlasnike.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              PetPark okuplja pouzdane usluge, korisne savjete i zajednicu posvećenu kvalitetnoj brizi o ljubimcima — sve na jednom mjestu.
            </p>

            {/* Hero Image */}
            <div className="mb-8 animate-fade-in-up delay-200 max-w-2xl mx-auto">
              <Image
                src="/hero-pets.jpg"
                alt="Sretni psi i mačke zajedno"
                width={672}
                height={240}
                className="w-full h-44 md:h-60 lg:h-68 object-cover rounded-3xl shadow-xl shadow-orange-200/30 dark:shadow-orange-900/20 border-4 border-white/80 dark:border-white/10"
                priority
              />
            </div>

            {/* Search Bar */}
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
                    placeholder="Vrsta usluge (smještaj, šetnja...)"
                    className="pl-11 h-12 md:h-13 border-0 bg-transparent focus:ring-0 text-base placeholder:text-muted-foreground/60 rounded-xl md:rounded-full"
                    aria-label="Vrsta usluge"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 h-12 md:h-13 px-8 rounded-xl md:rounded-full btn-hover shadow-lg shadow-orange-300/40 dark:shadow-orange-900/30 text-base font-semibold">
                  <Search className="h-4 w-4 mr-2" />
                  Pretraži
                </Button>
              </form>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-8 text-sm text-muted-foreground animate-fade-in-up delay-400 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-500" />
                <span>Verificirani sitteri</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>4.8 prosječna ocjena</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
                <span>500+ sretnih ljubimaca</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 Big Section Cards (Google Stitch style) ── */}
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

      {/* ── Lost Pets Section ── */}
      <LostPetsHomepageSection />

      {/* ── Services Section ── */}
      <section className="py-16 md:py-24 bg-warm-section" aria-label="Usluge">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">Usluge</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Sve što vaš ljubimac treba</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Od čuvanja i njege do dresure i svakodnevne podrške — pronađite usluge prilagođene svom ljubimcu
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {services.map((service, i) => (
              <Link key={service.type} href={`/pretraga?service=${service.type}`}>
                <Card className={`group card-hover cursor-pointer h-full border-0 shadow-sm overflow-hidden rounded-2xl animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                  <CardContent className="p-5 text-center relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <service.icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-1 group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{service.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3">
                      <Image src={service.image} alt={service.title} fill loading="lazy" sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-sm font-bold text-orange-500">{service.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/40 to-white dark:from-orange-950/10 dark:to-background relative overflow-hidden" aria-label="Kako funkcionira">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Kako funkcionira</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Tri jednostavna koraka</h2>
            <p className="text-muted-foreground text-lg">Od pretrage do sretnog ljubimca</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <div key={item.step} className={`text-center relative animate-fade-in-up delay-${(i + 1) * 200}`}>
                <div className="step-number text-7xl md:text-8xl font-extrabold text-orange-100/80 dark:text-orange-900/30 leading-none mb-4 select-none">
                  {String(item.step).padStart(2, '0')}
                </div>
                <div className={`relative inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-5 shadow-lg -mt-12`}>
                  <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-[var(--font-heading)]">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Sitters ── */}
      <section className="py-16 md:py-24" aria-label="Popularni sitteri">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">Top sitteri</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-[var(--font-heading)]">Popularni sitteri</h2>
              <p className="text-muted-foreground text-lg">Upoznajte naše najbolje ocijenjene čuvare ljubimaca</p>
            </div>
            <Link href="/pretraga" className="hidden md:block">
              <Button variant="outline" className="items-center gap-1 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-200 dark:hover:border-orange-800 rounded-xl">
                Vidi sve <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {featuredSitters.map((sitter, i) => (
              <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                <Card className={`group card-hover cursor-pointer overflow-hidden border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                  <CardContent className="p-0">
                    <div className={`relative h-44 bg-gradient-to-br ${sitter.gradient} flex items-center justify-center`}>
                      <div className="absolute inset-0 paw-pattern opacity-10" />
                      <Avatar className="h-20 w-20 md:h-22 md:w-22 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AvatarFallback className="bg-white/90 dark:bg-gray-800/90 text-foreground text-2xl font-bold">
                          {sitter.initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {sitter.verified && (
                          <Badge className="bg-white/90 dark:bg-gray-900/80 text-teal-600 dark:text-teal-400 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificiran
                          </Badge>
                        )}
                        {sitter.superhost && (
                          <Badge className="bg-white/90 dark:bg-gray-900/80 text-amber-600 dark:text-amber-400 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5 font-semibold">
                            <Star className="h-3 w-3 mr-1 fill-amber-500" />
                            Superhost
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{sitter.name}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{sitter.rating}</span>
                          <span className="text-xs text-amber-600/70 dark:text-amber-400/60">({sitter.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5 text-teal-500" />
                        {sitter.city}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{sitter.bio}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-xl font-extrabold text-orange-500">od {sitter.price}€</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                          Pogledaj profil <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/pretraga">
              <Button variant="outline" className="hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-200 dark:hover:border-orange-800 rounded-xl">
                Vidi sve sittere <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cities Section ── */}
      <section className="py-16 md:py-24 bg-warm-section" aria-label="Gradovi">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Lokacije</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Dostupni u cijeloj Hrvatskoj</h2>
            <p className="text-muted-foreground text-lg">Pronađite čuvare u vašem gradu</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {cities.map((city, i) => (
              <Link key={city.name} href={`/pretraga?city=${city.name}`}>
                <Card className={`group card-hover cursor-pointer overflow-hidden border-0 shadow-md rounded-2xl animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                  <CardContent className="p-0">
                    <div className="h-32 md:h-36 relative flex items-end p-4 overflow-hidden">
                      <Image src={city.image} alt={city.name} fill loading="lazy" sizes="(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 46vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/5" />
                      <div className="relative">
                        <h3 className="text-white font-extrabold text-lg leading-none drop-shadow-sm font-[var(--font-heading)]">{city.name}</h3>
                        <p className="text-white/90 text-sm mt-1 font-medium">{city.sitters} sittera</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews / Social Proof ── */}
      <section className="py-16 md:py-24 relative overflow-hidden" aria-label="Recenzije">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 dark:bg-orange-950/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">Recenzije</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Što kažu naši korisnici</h2>
            <p className="text-muted-foreground text-lg">Stvarna iskustva vlasnika ljubimaca i sittera</p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-12 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-lg font-bold">4.9</span>
              <span className="text-muted-foreground text-sm">prosječna ocjena</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">500+</span>
              <span className="text-muted-foreground text-sm">rezervacija</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">6+</span>
              <span className="text-muted-foreground text-sm">gradova</span>
            </div>
          </div>

          {/* Review Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {reviewCards.map((review, i) => (
              <Card key={i} className={`border-0 shadow-sm card-hover rounded-2xl animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                <CardContent className="p-6 relative">
                  <Quote className="h-8 w-8 text-orange-100 dark:text-orange-900/40 absolute top-4 right-4" />
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-5 leading-relaxed text-sm">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`bg-gradient-to-br ${review.gradient} text-white text-sm font-bold`}>
                          {review.initial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{review.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {review.city}
                          {review.isSitter && (
                            <Badge className="ml-1 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-[10px] px-1.5 py-0 h-4 hover:bg-teal-50 border-0">
                              Sitter
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xl">{review.petType === 'cat' ? '🐱' : '🐶'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PetPark / Features Section ── */}
      <section className="py-16 md:py-24 bg-warm-section relative overflow-hidden" aria-label="Značajke">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Zašto PetPark</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Više od obične pet platforme</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">PetPark spaja korisne alate, preglednost i dodatnu vrijednost za vlasnike ljubimaca</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                title: 'GPS Tracking šetnji',
                description: 'Demo prikaz GPS šetnje: ruta, checkpointi i statistike kao primjer funkcionalnosti PetParka.',
                emoji: '📍',
                color: 'from-emerald-500 to-teal-500',
                href: '/setnja/walk1111-1111-1111-1111-111111111111',
              },
              {
                title: 'Foto ažuriranja',
                description: 'Demo feed foto i video ažuriranja koji pokazuje kako izgleda komunikacija tijekom bookinga.',
                emoji: '📸',
                color: 'from-blue-500 to-cyan-500',
                href: '/azuriranja/book1111-1111-1111-1111-111111111111',
              },
              {
                title: 'Zdravstveni karton',
                description: 'Demo zdravstveni karton s cijepljenjima, alergijama i terapijama — primjer kako izgleda privatni zapis.',
                emoji: '🏥',
                color: 'from-purple-500 to-pink-500',
                href: '/ljubimac/pet11111-1111-1111-1111-111111111111/karton',
              },
            ].map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <Card className={`group card-hover cursor-pointer h-full border-0 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <span className="text-2xl md:text-3xl">{feature.emoji}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-3 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-200">
                        Demo primjer
                      </Badge>
                    </div>
                    <div className="mt-4 text-sm font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Pogledaj demo <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── More Services Section ── */}
      <section className="py-16 md:py-24 relative overflow-hidden" aria-label="Istraži više">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">Istraži više</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">Još više za vašeg ljubimca</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Istražite usluge, sadržaj i zajednicu koji PetPark čine mjestom za cjelovitu brigu o ljubimcima</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              {
                title: 'Grooming & Njega',
                description: 'Premium saloni za šišanje, kupanje, trimanje i njegu noktiju. Pronađite verificirane groomere u vašem gradu.',
                icon: Scissors,
                color: 'from-pink-500 to-rose-500',
                href: '/njega',
                stat: '8 salona',
                image: '/images/services/02-grooming.jpg',
              },
              {
                title: 'Školovanje pasa & Trening',
                description: 'Certificirani treneri za osnovnu poslušnost, agility, korekciju ponašanja i rad sa štencima.',
                icon: GraduationCap,
                color: 'from-indigo-500 to-blue-500',
                href: '/dresura',
                stat: '6 trenera',
                image: '/images/services/03-dresura-agility.jpg',
              },
              {
                title: 'Zajednica & Blog',
                description: 'Savjeti, vodiči i priče za vlasnike ljubimaca. Zdravlje, prehrana, školovanje pasa i putovanja.',
                icon: BookOpen,
                color: 'from-amber-500 to-orange-500',
                href: '/zajednica',
                stat: '8 članaka',
                image: '/images/services/06-community.jpg',
              },
              {
                title: 'Forum zajednice',
                description: 'Postavite pitanja, podijelite savjete ili pomozite pronaći izgubljene ljubimce. Viralna zajednica!',
                icon: Users,
                color: 'from-teal-500 to-emerald-500',
                href: '/forum',
                stat: '15 tema',
                image: '/images/services/07-hero-puppy.jpg',
              },
            ].map((item, i) => (
              <Link key={item.title} href={item.href}>
                <Card className={`group card-hover cursor-pointer h-full border-0 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-5 md:p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4">
                      <Image src={item.image} alt={item.title} fill loading="lazy" sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <Badge variant="secondary" className="bg-accent text-muted-foreground rounded-full">{item.stat}</Badge>
                    <div className="mt-3 text-sm font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Istraži <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <NewsletterSignup />

      {/* ── Adoption CTA ── */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/10 relative overflow-hidden" aria-label="Udomljavanje">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-8 md:p-10 flex flex-col justify-center text-white relative">
                    <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
                    <div className="relative">
                      <span className="text-5xl mb-4 block">🏠</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold mb-3 font-[var(--font-heading)]">Udomite ljubimca</h2>
                      <p className="text-purple-100 leading-relaxed">
                        Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce iz azila diljem Hrvatske.
                      </p>
                    </div>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐕</span>
                        <span className="text-sm text-muted-foreground">Psi raznih pasmina i dobi</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐈</span>
                        <span className="text-sm text-muted-foreground">Mačke koje traže topli dom</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐰</span>
                        <span className="text-sm text-muted-foreground">Mali ljubimci — kunići i više</span>
                      </div>
                    </div>
                    <Link href="/udomljavanje">
                      <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg">
                        <Heart className="h-5 w-5 mr-2 fill-white" />
                        Istraži udomljavanje
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Dog-Friendly CTA ── */}
      <section className="py-12 md:py-16 relative overflow-hidden" aria-label="Dog-Friendly lokacije">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10" />
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white">
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <Badge className="mb-4 bg-white/20 text-white hover:bg-white/20 border-0 text-sm px-4 py-1.5 rounded-full font-semibold">
                    Novo na PetParku
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3 font-[var(--font-heading)]">
                    Dog-Friendly Lokacije
                  </h2>
                  <p className="text-white/80 mb-6 max-w-md">
                    Pronađite kafiće, restorane, plaže i parkove koji dobrodošlicom primaju vašeg ljubimca. 35+ lokacija u 7 gradova!
                  </p>
                  <Link href="/dog-friendly">
                    <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl shadow-lg">
                      <Dog className="h-5 w-5 mr-2" />
                      Pronađi lokacije
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="text-6xl md:text-8xl opacity-80">
                  🐕
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA for Sitters ── */}
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

            <div className="grid grid-cols-3 gap-6 mt-14 max-w-md mx-auto">
              <div className="animate-count-up">
                <p className="text-3xl md:text-4xl font-extrabold text-white font-[var(--font-heading)]">500+</p>
                <p className="text-sm text-white/70 mt-1">Sittera</p>
              </div>
              <div className="animate-count-up delay-200">
                <p className="text-3xl md:text-4xl font-extrabold text-white font-[var(--font-heading)]">2000+</p>
                <p className="text-sm text-white/70 mt-1">Rezervacija</p>
              </div>
              <div className="animate-count-up delay-400">
                <p className="text-3xl md:text-4xl font-extrabold text-white font-[var(--font-heading)]">4.8</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-3 w-3 fill-white text-white" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

async function LostPetsHomepageSection() {
  const lostPets = await getLostPets({ status: 'lost', limit: 3, fields: 'homepage-card' });
  if (lostPets.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-red-50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/10 relative overflow-hidden" aria-label="Izgubljeni ljubimci">
      <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border-0 text-sm px-4 py-1.5 animate-pulse rounded-full font-semibold">
            Hitno — pomoć potrebna
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-[var(--font-heading)]">Izgubljeni ljubimci</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Ovi ljubimci traže put kući. Svako dijeljenje pomaže!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {lostPets.map((pet) => (
            <Link key={pet.id} href={`/izgubljeni/${pet.id}`}>
              <Card className="group border-2 border-red-200 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-600 hover:shadow-xl transition-all duration-300 overflow-hidden h-full rounded-2xl">
                <div className="relative h-44 md:h-48 bg-muted">
                  <Image src={pet.image_url} alt={pet.name} fill loading="lazy" sizes="(min-width: 768px) 30vw, 92vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold rounded-full">
                    Traži se
                  </Badge>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg font-[var(--font-heading)]">{pet.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow">{LOST_PET_SPECIES_LABELS[pet.species]} &bull; {pet.breed}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="font-medium">{pet.city}, {pet.neighborhood}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(pet.date_lost).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long' })}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/izgubljeni">
            <Button size="lg" className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 font-bold text-base px-8 py-5 shadow-xl shadow-red-200/50 dark:shadow-red-900/30 rounded-xl">
              <Heart className="h-5 w-5 mr-2" />
              Pomozi pronaći — Pogledaj sve
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
