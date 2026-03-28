import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Shield, Star, Heart, Clock, MapPin, ChevronRight,
  Home, Dog, House, Eye, Sun, Users, Calendar, CheckCircle2,
  ArrowRight, Quote, Scissors, GraduationCap, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { getLostPets } from '@/lib/db';
import { LOST_PET_SPECIES_LABELS } from '@/lib/types';

const featuredSitters = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Ana Horvat', city: 'Rijeka', rating: 4.9, reviews: 23, price: 25, bio: 'Obožavam životinje od malih nogu! Imam veliku kuću s dvorištem.', verified: true, superhost: true, initial: 'A', gradient: 'from-orange-400 to-amber-300' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Luka Jurić', city: 'Rijeka', rating: 4.6, reviews: 31, price: 22, bio: 'Umirovljeni vatrogasac s velikom kućom na Trsatu.', verified: true, superhost: true, initial: 'L', gradient: 'from-blue-400 to-cyan-300' },
  { id: '88888888-8888-8888-8888-888888888888', name: 'Ivan Knežević', city: 'Zagreb', rating: 4.9, reviews: 27, price: 32, bio: 'Iskusni čuvar s fokusom na ljubimce s posebnim potrebama.', verified: true, superhost: true, initial: 'I', gradient: 'from-purple-400 to-pink-300' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Ivana Babić', city: 'Rijeka', rating: 4.8, reviews: 19, price: 8, bio: 'Studentica biologije i velika ljubiteljica životinja.', verified: true, superhost: false, initial: 'I', gradient: 'from-green-400 to-emerald-300' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Filip Matić', city: 'Zagreb', rating: 4.8, reviews: 18, price: 27, bio: 'Živim u kući s velikim vrtom i dva vlastita psa.', verified: true, superhost: false, initial: 'F', gradient: 'from-rose-400 to-orange-300' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Marko Novak', city: 'Rijeka', rating: 4.7, reviews: 15, price: 30, bio: 'Veterinarski tehničar s iskustvom u brizi o životinjama.', verified: true, superhost: false, initial: 'M', gradient: 'from-teal-400 to-cyan-300' },
];

const testimonials = [
  { name: 'Marina K.', city: 'Rijeka', text: 'Ana je bila nevjerojatna s našim Rexom! Slala nam je fotke svaki dan i Rex se vratio sretan. Definitivno koristimo PetPark opet!', rating: 5 },
  { name: 'Tomislav B.', city: 'Zagreb', text: 'Filip je spasio naš godišnji odmor! Buddy je bio u sigurnim rukama i uživao je u velikom vrtu. Hvala PetParku na ovoj usluzi!', rating: 5 },
  { name: 'Nina Š.', city: 'Zagreb', text: 'Kao vlasnica mačke s dijabetesom, teško je naći nekoga tko zna dati inzulin. Marko je bio profesionalan i Whiskers je bio savršeno zbrinut.', rating: 5 },
];

const howItWorks = [
  { step: 1, title: 'Pretražite sittere', description: 'Unesite svoj grad i datume, pregledajte profile verificiranih sittera i pročitajte recenzije drugih vlasnika.', icon: Search },
  { step: 2, title: 'Rezervirajte termin', description: 'Kontaktirajte sittera, dogovorite detalje i rezervirajte uslugu online. Plaćanje je sigurno i jednostavno.', icon: Calendar },
  { step: 3, title: 'Uživajte bez brige', description: 'Vaš ljubimac je u sigurnim rukama! Primajte ažuriranja i fotke. Nakon usluge, ostavite recenziju.', icon: Shield },
];

const services = [
  { type: 'boarding' as const, title: 'Smještaj', description: 'Vaš ljubimac boravi kod sittera', icon: Home, price: 'od 20€/noć', color: 'from-orange-500 to-amber-500', image: '/images/services/01-pet-sitting.jpg' },
  { type: 'walking' as const, title: 'Šetnja', description: 'Šetnja vašeg psa u kvartu', icon: Dog, price: 'od 8€/šetnja', color: 'from-green-500 to-emerald-500', image: '/images/services/04-setanje-pasa.jpg' },
  { type: 'house-sitting' as const, title: 'Čuvanje u kući', description: 'Sitter dolazi u vašu kuću', icon: House, price: 'od 30€/noć', color: 'from-blue-500 to-cyan-500', image: '/images/services/06-community.jpg' },
  { type: 'drop-in' as const, title: 'Kratki posjet', description: 'Posjet vašem ljubimcu od 30min', icon: Eye, price: 'od 12€/posjet', color: 'from-purple-500 to-pink-500', image: '/images/services/08-macka.jpg' },
  { type: 'daycare' as const, title: 'Dnevna briga', description: 'Cjelodnevna briga kod sittera', icon: Sun, price: 'od 18€/dan', color: 'from-rose-500 to-orange-500', image: '/images/services/07-hero-puppy.jpg' },
  { type: 'grooming' as const, title: 'Grooming', description: 'Kupanje, šišanje i njega dlake', icon: Scissors, price: 'od 25€', color: 'from-pink-500 to-fuchsia-500', image: '/images/services/08-macka.jpg' },
  { type: 'agility' as const, title: 'Agility trening', description: 'Sportski trening za aktivne pse', icon: GraduationCap, price: 'od 15€/sat', color: 'from-yellow-500 to-orange-500', image: '/images/services/04-setanje-pasa.jpg' },
  { type: 'training' as const, title: 'Dresura', description: 'Profesionalna obuka i socijalizacija', icon: BookOpen, price: 'od 20€/sat', color: 'from-teal-500 to-green-500', image: '/images/services/06-community.jpg' },
];

const cities = [
  { name: 'Zagreb', sitters: 180, gradient: 'from-blue-600 to-blue-400', image: '/images/cities/zagreb.jpg' },
  { name: 'Rijeka', sitters: 95, gradient: 'from-cyan-600 to-cyan-400', image: '/images/cities/rijeka.jpg' },
  { name: 'Split', sitters: 120, gradient: 'from-orange-600 to-amber-400', image: '/images/cities/split.jpg' },
  { name: 'Osijek', sitters: 45, gradient: 'from-green-600 to-emerald-400', image: '/images/cities/osijek.jpg' },
  { name: 'Pula', sitters: 55, gradient: 'from-purple-600 to-purple-400', image: '/images/cities/pula.jpg' },
  { name: 'Zadar', sitters: 60, gradient: 'from-rose-600 to-rose-400', image: '/images/cities/zadar.jpg' },
];

const stats = [
  { value: '500+', label: 'Verificiranih sittera', icon: Users },
  { value: '2.000+', label: 'Uspješnih rezervacija', icon: Calendar },
  { value: '4.8', label: 'Prosječna ocjena', icon: Star },
  { value: '50+', label: 'Gradova u Hrvatskoj', icon: MapPin },
];

export default async function HomePage() {
  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float delay-200" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-300" />
        <div className="container mx-auto px-4 py-28 md:py-40 lg:py-48 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-8 bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-sm px-6 py-2 animate-fade-in-up shadow-sm">
              <PawPrintIcon className="h-3.5 w-3.5 mr-1.5" />
              #1 Pet Sitting platforma u Hrvatskoj
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-up delay-100">
              Tko čuva vašeg ljubimca{' '}
              <span className="text-gradient">dok ste na putu?</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              Pronađite pouzdane i verificirane čuvare ljubimaca u vašem gradu.
              Vaš ljubimac zaslužuje najbolju brigu — čak i kad niste tu.
            </p>

            {/* Hero Pets Image */}
            <div className="mb-10 animate-fade-in-up delay-250 max-w-2xl mx-auto">
              <img
                src="/hero-pets.jpg"
                alt="Sretni psi i mačke zajedno"
                className="w-full h-48 md:h-64 lg:h-72 object-cover rounded-3xl shadow-xl shadow-orange-200/30 border-4 border-white/80"
              />
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-full shadow-2xl shadow-orange-200/40 p-2.5 md:p-3 max-w-2xl mx-auto animate-fade-in-up delay-300 border border-orange-100/60">
              <form action="/pretraga" className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <Input
                    name="city"
                    placeholder="Unesite grad (npr. Rijeka, Zagreb...)"
                    className="pl-11 h-13 border-0 bg-transparent focus:ring-0 text-base placeholder:text-gray-400"
                  />
                </div>
                <div className="hidden md:block w-px bg-gray-200 my-2" />
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <Input
                    name="service"
                    placeholder="Vrsta usluge (smještaj, šetnja...)"
                    className="pl-11 h-13 border-0 bg-transparent focus:ring-0 text-base placeholder:text-gray-400"
                  />
                </div>
                <Link href="/pretraga">
                  <Button size="lg" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 h-13 px-10 rounded-full btn-hover shadow-lg shadow-orange-300/40 text-base font-semibold">
                    <Search className="h-4 w-4 mr-2" />
                    Pretraži
                  </Button>
                </Link>
              </form>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-10 mt-12 text-sm text-muted-foreground animate-fade-in-up delay-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Verificirani sitteri</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>4.8 prosječna ocjena</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                <span>500+ sretnih ljubimaca</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Menu Section ── */}
      <section className="py-0 relative z-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 -mt-8 md:-mt-12 p-5 md:p-6">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
              {[
                { href: '/pretraga', emoji: '🐾', label: 'Sitteri', color: 'from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100' },
                { href: '/njega', emoji: '✂️', label: 'Grooming', color: 'from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100' },
                { href: '/dresura', emoji: '🎓', label: 'Dresura', color: 'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' },
                { href: '/shop', emoji: '🛍️', label: 'Shop', color: 'from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' },
                { href: '/izgubljeni', emoji: '🚨', label: 'Izgubljeni', color: 'from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100' },
                { href: '/forum', emoji: '💬', label: 'Forum', color: 'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' },
                { href: '/zajednica', emoji: '📝', label: 'Blog', color: 'from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100' },
                { href: '/ljubimac/pet11111-1111-1111-1111-111111111111/karton', emoji: '🏥', label: 'Putovnica', color: 'from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100' },
              ].map((item, i) => (
                <Link
                  key={`${item.href}-${i}`}
                  href={item.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${item.color} transition-all duration-200 hover:shadow-md hover:scale-[1.02] group animate-fade-in-up`}
                >
                  <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Lost Pets Section ── */}
      <LostPetsHomepageSection />

      {/* ── Services Section ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Usluge</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sve što vaš ljubimac treba</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Od smještaja do šetnje — pronađite savršenu uslugu za vašeg ljubimca
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service, i) => (
              <Link key={service.type} href={`/pretraga?service=${service.type}`}>
                <Card className={`group card-hover cursor-pointer h-full border-0 shadow-sm overflow-hidden animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-6 text-center relative">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-500 transition-colors">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3">
                      <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-sm font-semibold text-orange-500">{service.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-orange-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Kako funkcionira</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tri jednostavna koraka</h2>
            <p className="text-muted-foreground text-lg">Od pretrage do sretnog ljubimca</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <div key={item.step} className={`text-center relative animate-fade-in-up delay-${(i + 1) * 200}`}>
                <div className="step-number text-8xl md:text-9xl font-extrabold text-orange-100/80 leading-none mb-4 select-none">
                  {String(item.step).padStart(2, '0')}
                </div>
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white mb-5 shadow-lg shadow-orange-200/50 -mt-12">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Sitters ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-14">
            <div>
              <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Top sitteri</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Popularni sitteri</h2>
              <p className="text-muted-foreground text-lg">Upoznajte naše najbolje ocijenjene čuvare ljubimaca</p>
            </div>
            <Link href="/pretraga" className="hidden md:block">
              <Button variant="outline" className="items-center gap-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                Vidi sve <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSitters.map((sitter, i) => (
              <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                <Card className={`group card-hover cursor-pointer overflow-hidden border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-0">
                    <div className={`relative h-48 bg-gradient-to-br ${sitter.gradient} flex items-center justify-center`}>
                      <div className="absolute inset-0 paw-pattern opacity-10" />
                      <Avatar className="h-22 w-22 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AvatarFallback className="bg-white/90 text-gray-700 text-2xl font-bold">
                          {sitter.initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {sitter.verified && (
                          <Badge className="bg-white/90 text-blue-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificiran
                          </Badge>
                        )}
                        {sitter.superhost && (
                          <Badge className="bg-white/90 text-amber-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5 font-semibold">
                            <Star className="h-3 w-3 mr-1 fill-amber-500" />
                            Superhost
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">{sitter.name}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-700">{sitter.rating}</span>
                          <span className="text-xs text-amber-600/70">({sitter.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        {sitter.city}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{sitter.bio}</p>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xl font-bold text-orange-500">od {sitter.price}€</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          Pogledaj profil <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10 md:hidden">
            <Link href="/pretraga">
              <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                Vidi sve sittere <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cities Section ── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Lokacije</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Dostupni u cijeloj Hrvatskoj</h2>
            <p className="text-muted-foreground text-lg">Pronađite čuvare u vašem gradu</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city, i) => (
              <Link key={city.name} href={`/pretraga?city=${city.name}`}>
                <Card className={`group card-hover cursor-pointer overflow-hidden border-0 shadow-md rounded-2xl animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-0">
                    <div className="h-36 relative flex items-end p-5 overflow-hidden">
                      <Image src={city.image} alt={city.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                      <div className="relative">
                        <h3 className="text-white font-bold text-xl leading-none drop-shadow-sm">{city.name}</h3>
                        <p className="text-white/90 text-sm mt-1.5 font-medium">{city.sitters} sittera</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Recenzije</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Što kažu naši korisnici</h2>
            <p className="text-muted-foreground text-lg">Stvarna iskustva vlasnika ljubimaca</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className={`bg-white border-0 shadow-sm card-hover rounded-2xl animate-fade-in-up delay-${(i + 1) * 200}`}>
                <CardContent className="p-8 relative">
                  <Quote className="h-12 w-12 text-orange-100/80 absolute top-6 right-6" />
                  <div className="flex items-center gap-0.5 mb-5">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={`h-5 w-5 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-8 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm font-medium">
                        {t.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {t.city}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PetPark Section ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-orange-50/30 relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Zašto PetPark</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Što PetPark nudi više od ostalih</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Napredne značajke za potpuni mir i kontrolu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'GPS Tracking šetnji',
                description: 'Pratite svog ljubimca u realnom vremenu dok je na šetnji. Vidite rutu, checkpointe i statistike šetnje.',
                emoji: '📍',
                color: 'from-green-500 to-emerald-500',
                href: '/setnja/walk1111-1111-1111-1111-111111111111',
              },
              {
                title: 'Foto ažuriranja',
                description: 'Primajte redovita ažuriranja s fotografijama i videima od sittera. Instagram-style feed za vašeg ljubimca.',
                emoji: '📸',
                color: 'from-blue-500 to-cyan-500',
                href: '/azuriranja/book1111-1111-1111-1111-111111111111',
              },
              {
                title: 'Zdravstveni karton',
                description: 'Digitalni pas-putovnica s cijepljenjima, alergijama, lijekovima i kontaktom veterinara. Uvijek pri ruci.',
                emoji: '🏥',
                color: 'from-purple-500 to-pink-500',
                href: '/ljubimac/pet11111-1111-1111-1111-111111111111/karton',
              },
            ].map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <Card className={`group card-hover cursor-pointer h-full border-0 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{feature.emoji}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-4 text-sm font-medium text-orange-500 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      <section className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Istraži više</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Još više za vašeg ljubimca</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Osim čuvanja, nudimo grooming, dresuru i zajednicu ljubitelja životinja</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: 'Grooming & Njega',
                description: 'Premium saloni za šišanje, kupanje, trimanje i spa tretmane. Pronađite verificirane groomere u vašem gradu.',
                icon: Scissors,
                color: 'from-pink-500 to-rose-500',
                href: '/njega',
                stat: '8 salona',
                image: '/images/services/02-grooming.jpg',
              },
              {
                title: 'Dresura & Trening',
                description: 'Certificirani treneri za osnovnu poslušnost, agility, korekciju ponašanja i rad sa štencima.',
                icon: GraduationCap,
                color: 'from-indigo-500 to-blue-500',
                href: '/dresura',
                stat: '6 trenera',
                image: '/images/services/03-dresura-agility.jpg',
              },
              {
                title: 'Zajednica & Blog',
                description: 'Savjeti, vodiči i priče za vlasnike ljubimaca. Zdravlje, prehrana, dresura i putovanja.',
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
                color: 'from-violet-500 to-purple-500',
                href: '/forum',
                stat: '15 tema',
                image: '/images/services/07-hero-puppy.jpg',
              },
            ].map((item, i) => (
              <Link key={item.title} href={item.href}>
                <Card className={`group card-hover cursor-pointer h-full border-0 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up delay-${(i + 1) * 100}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4">
                      <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">{item.stat}</Badge>
                    <div className="mt-4 text-sm font-medium text-orange-500 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Istraži <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA for Sitters ── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400" />
        <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 opacity-[0.06]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-y-1/2 translate-x-1/2 opacity-[0.06]" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-0 text-sm px-4 py-1.5">
              <Heart className="h-3.5 w-3.5 mr-1.5 fill-white" />
              Pridruži se zajednici
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-white leading-tight">
              Volite životinje?<br />Zarađujte čuvajući ljubimce!
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-lg mx-auto leading-relaxed">
              Pridružite se stotinama sittera diljem Hrvatske. Postavite vlastite cijene,
              upravljajte rasporedom i zarađujte radeći ono što volite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registracija?role=sitter">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-black/10 text-base px-8 btn-hover font-semibold">
                  Postani sitter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pretraga">
                <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 text-base px-8">
                  Pretraži sittere
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
              <div className="animate-count-up">
                <p className="text-4xl font-extrabold text-white">500+</p>
                <p className="text-sm text-white/70 mt-1">Sittera</p>
              </div>
              <div className="animate-count-up delay-200">
                <p className="text-4xl font-extrabold text-white">2000+</p>
                <p className="text-sm text-white/70 mt-1">Rezervacija</p>
              </div>
              <div className="animate-count-up delay-400">
                <p className="text-4xl font-extrabold text-white">4.8</p>
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
  const lostPets = (await getLostPets({ status: 'lost' })).slice(0, 3);
  if (lostPets.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-red-50 to-orange-50/50 relative overflow-hidden">
      <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-100 border-0 text-sm px-4 py-1.5 animate-pulse">
            🚨 Hitno — pomoć potrebna
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">Izgubljeni ljubimci</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Ovi ljubimci traže put kući. Svako dijeljenje pomaže!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {lostPets.map((pet) => (
            <Link key={pet.id} href={`/izgubljeni/${pet.id}`}>
              <Card className="group border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                <div className="relative h-48 bg-gray-100">
                  <Image src={pet.image_url} alt={pet.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold">
                    🔴 Traži se
                  </Badge>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{pet.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow">{LOST_PET_SPECIES_LABELS[pet.species]} • {pet.breed}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="font-medium">{pet.city}, {pet.neighborhood}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
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
            <Button size="lg" className="bg-red-500 hover:bg-red-600 font-bold text-lg px-8 py-6 shadow-xl shadow-red-200/50">
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

function PawPrintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="15" rx="3.5" ry="4" />
      <ellipse cx="7.5" cy="9" rx="2" ry="2.8" />
      <ellipse cx="16.5" cy="9" rx="2" ry="2.8" />
      <ellipse cx="5" cy="13.5" rx="1.8" ry="2.5" />
      <ellipse cx="19" cy="13.5" rx="1.8" ry="2.5" />
    </svg>
  );
}
