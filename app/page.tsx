import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Shield, Star, Heart, MapPin, ChevronRight,
  Home, Dog, House, Eye, Sun, Users, Calendar,
  ArrowRight, Scissors, GraduationCap, BookOpen,
  PawPrint,
} from 'lucide-react';

// Revalidate the homepage at most once per 60 seconds (ISR)
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'PetPark — Sve za ljubimce na jednom mjestu' },
  description: 'Čuvanje, grooming, školovanje pasa, veterinari, udomljavanje, dog-friendly lokacije i zajednica ljubitelja životinja — sve na jednom mjestu u Hrvatskoj.',
  keywords: ['pet sitting hrvatska', 'čuvanje ljubimaca', 'grooming', 'školovanje pasa', 'veterinar', 'udomljavanje', 'dog-friendly'],
  openGraph: {
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Čuvanje, grooming, školovanje, veterinari, udomljavanje i zajednica — sve u jednoj aplikaciji.',
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
  { name: 'Grooming', url: 'https://petpark.hr/njega', description: 'Profesionalni saloni za uljepšavanje ljubimaca' },
  { name: 'Školovanje pasa', url: 'https://petpark.hr/dresura', description: 'Certificirani treneri i programi za pse' },
  { name: 'Veterinari', url: 'https://petpark.hr/veterinari', description: 'Veterinarske ordinacije u vašem gradu' },
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
  { name: 'Zagreb', image: '/images/cities/zagreb.jpg' },
  { name: 'Rijeka', image: '/images/cities/rijeka.jpg' },
  { name: 'Split', image: '/images/cities/split.jpg' },
  { name: 'Osijek', image: '/images/cities/osijek.jpg' },
  { name: 'Pula', image: '/images/cities/pula.jpg' },
  { name: 'Zadar', image: '/images/cities/zadar.jpg' },
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
              Sve za ljubimce na jednom mjestu
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Za <span className="text-orange-500">sretne ljubimce</span> i{' '}
              <span className="text-teal-600 dark:text-teal-400">mirnije vlasnike.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              PetPark okuplja pouzdane usluge, korisne savjete i zajednicu posvećenu kvalitetnoj brizi o ljubimcima — sve na jednom mjestu.
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

            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-8 text-sm text-muted-foreground animate-fade-in-up delay-400 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-500" />
                <span>Verificirani sitteri</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Recenzije stvarnih korisnika</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
                <span>Briga prilagođena vašem ljubimcu</span>
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
                    <Image src={service.image} alt={service.title} fill loading="lazy" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
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
                        {sitter.verified && <Badge className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-50">Verificiran</Badge>}
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
              <Link key={city.name} href={`/pretraga?city=${encodeURIComponent(city.name)}`}>
                <Card className="group overflow-hidden rounded-2xl border-0 shadow-sm card-hover">
                  <CardContent className="p-0">
                    <div className="h-32 md:h-36 relative flex items-end p-4 overflow-hidden">
                      <Image src={city.image} alt={city.name} fill loading="lazy" sizes="(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 46vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
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
                stat: 'Saloni',
                image: '/images/services/02-grooming.jpg',
              },
              {
                title: 'Školovanje pasa & Trening',
                description: 'Certificirani treneri za osnovnu poslušnost, agility, korekciju ponašanja i rad sa štencima.',
                icon: GraduationCap,
                color: 'from-indigo-500 to-blue-500',
                href: '/dresura',
                stat: 'Treneri',
                image: '/images/services/03-dresura-agility.jpg',
              },
              {
                title: 'Zajednica & Blog',
                description: 'Savjeti, vodiči i priče za vlasnike ljubimaca. Zdravlje, prehrana, školovanje pasa i putovanja.',
                icon: BookOpen,
                color: 'from-amber-500 to-orange-500',
                href: '/zajednica',
                stat: 'Članci',
                image: '/images/services/06-community.jpg',
              },
              {
                title: 'Forum zajednice',
                description: 'Postavite pitanja, podijelite savjete ili pomozite pronaći izgubljene ljubimce. Viralna zajednica!',
                icon: Users,
                color: 'from-teal-500 to-emerald-500',
                href: '/forum',
                stat: 'Zajednica',
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

      <NewsletterSignup />

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
                    Pronađite kafiće, restorane, plaže i parkove koji dobrodošlicom primaju vašeg ljubimca.
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
