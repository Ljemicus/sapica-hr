import Link from 'next/link';
import { Search, Shield, Star, Heart, Clock, MapPin, ChevronRight, Dog, Cat, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { SERVICE_LABELS } from '@/lib/types';

// Hero section featured sitters (hardcoded)
const featuredSitters = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Ana Horvat', city: 'Rijeka', rating: 4.9, reviews: 23, price: 25, bio: 'Obožavam životinje od malih nogu! Imam veliku kuću s dvorištem.', verified: true, superhost: true, initial: 'A' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Luka Jurić', city: 'Rijeka', rating: 4.6, reviews: 31, price: 22, bio: 'Umirovljeni vatrogasac s velikom kućom na Trsatu.', verified: true, superhost: true, initial: 'L' },
  { id: '88888888-8888-8888-8888-888888888888', name: 'Ivan Knežević', city: 'Zagreb', rating: 4.9, reviews: 27, price: 32, bio: 'Iskusni čuvar s fokusom na ljubimce s posebnim potrebama.', verified: true, superhost: true, initial: 'I' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Ivana Babić', city: 'Rijeka', rating: 4.8, reviews: 19, price: 8, bio: 'Studentica biologije i velika ljubiteljica životinja.', verified: true, superhost: false, initial: 'I' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Filip Matić', city: 'Zagreb', rating: 4.8, reviews: 18, price: 27, bio: 'Živim u kući s velikim vrtom i dva vlastita psa.', verified: true, superhost: false, initial: 'F' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Marko Novak', city: 'Rijeka', rating: 4.7, reviews: 15, price: 30, bio: 'Veterinarski tehničar s iskustvom u brizi o životinjama.', verified: true, superhost: false, initial: 'M' },
];

const testimonials = [
  { name: 'Marina K.', city: 'Rijeka', text: 'Ana je bila nevjerojatna s našim Rexom! Slala nam je fotke svaki dan i Rex se vratio sretan. Definitivno koristimo Šapicu opet!', rating: 5 },
  { name: 'Tomislav B.', city: 'Zagreb', text: 'Filip je spasio naš godišnji odmor! Buddy je bio u sigurnim rukama i uživao je u velikom vrtu. Hvala Šapici na ovoj usluzi!', rating: 5 },
  { name: 'Nina Š.', city: 'Zagreb', text: 'Kao vlasnica mačke s dijabetesom, teško je naći nekoga tko zna dati inzulin. Marko je bio profesionalan i Whiskers je bio savršeno zbrinut.', rating: 5 },
];

const howItWorks = [
  { step: 1, title: 'Pretražite sittere', description: 'Unesite svoj grad i datume, pregledajte profile verificiranih sittera i pročitajte recenzije drugih vlasnika.', icon: Search },
  { step: 2, title: 'Rezervirajte termin', description: 'Kontaktirajte sittera, dogovorite detalje i rezervirajte uslugu online. Plaćanje je sigurno i jednostavno.', icon: Heart },
  { step: 3, title: 'Uživajte bez brige', description: 'Vaš ljubimac je u sigurnim rukama! Primajte ažuriranja i fotke. Nakon usluge, ostavite recenziju.', icon: Shield },
];

const services = [
  { type: 'boarding' as const, title: 'Smještaj', description: 'Vaš ljubimac boravi kod sittera', emoji: '🏠', price: 'od 20€/noć' },
  { type: 'walking' as const, title: 'Šetnja', description: 'Šetnja vašeg psa u kvartu', emoji: '🐕', price: 'od 8€/šetnja' },
  { type: 'house-sitting' as const, title: 'Čuvanje u kući', description: 'Sitter dolazi u vašu kuću', emoji: '🏡', price: 'od 30€/noć' },
  { type: 'drop-in' as const, title: 'Kratki posjet', description: 'Posjet vašem ljubimcu od 30min', emoji: '👋', price: 'od 12€/posjet' },
  { type: 'daycare' as const, title: 'Dnevna briga', description: 'Cjelodnevna briga kod sittera', emoji: '☀️', price: 'od 18€/dan' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-[url('/images/paw-pattern.svg')] opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-sm px-4 py-1">
              🐾 #1 Pet Sitting platforma u Hrvatskoj
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Tko čuva vašeg ljubimca{' '}
              <span className="text-orange-500">dok ste na putu?</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Pronađite pouzdane i verificirane čuvare ljubimaca u vašem gradu.
              Vaš ljubimac zaslužuje najbolju brigu — čak i kad niste tu.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-3 md:p-4 max-w-2xl mx-auto">
              <form action="/pretraga" className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    name="city"
                    placeholder="Grad (npr. Rijeka, Zagreb...)"
                    className="pl-10 h-12 border-gray-200"
                  />
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    name="service"
                    placeholder="Usluga (smještaj, šetnja...)"
                    className="pl-10 h-12 border-gray-200"
                  />
                </div>
                <Link href="/pretraga">
                  <Button size="lg" className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 h-12 px-8">
                    Pretraži
                  </Button>
                </Link>
              </form>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                Verificirani sitteri
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400" />
                4.8 prosječna ocjena
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-400" />
                500+ sretnih ljubimaca
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Usluge koje nudimo</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Od smještaja do šetnje — pronađite savršenu uslugu za vašeg ljubimca
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <Link key={service.type} href={`/pretraga?service=${service.type}`}>
                <Card className="group hover:shadow-md transition-all hover:border-orange-200 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{service.emoji}</div>
                    <h3 className="font-semibold mb-1 group-hover:text-orange-500 transition-colors">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <p className="text-sm font-medium text-orange-500">{service.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Kako funkcionira?</h2>
            <p className="text-muted-foreground">Tri jednostavna koraka do savršenog čuvara</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white mb-4 shadow-lg shadow-orange-200">
                  <item.icon className="h-7 w-7" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-orange-500 rounded-full text-sm font-bold flex items-center justify-center shadow">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sitters */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-3">Popularni sitteri</h2>
              <p className="text-muted-foreground">Upoznajte naše najbolje ocijenjene čuvare ljubimaca</p>
            </div>
            <Link href="/pretraga">
              <Button variant="outline" className="hidden md:flex items-center gap-1">
                Vidi sve <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSitters.map((sitter) => (
              <Link key={sitter.id} href={`/sitter/${sitter.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-40 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                        <AvatarFallback className="bg-orange-200 text-orange-700 text-xl">
                          {sitter.initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute top-3 right-3 flex gap-1">
                        {sitter.verified && (
                          <Badge className="bg-blue-500 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificiran
                          </Badge>
                        )}
                        {sitter.superhost && (
                          <Badge className="bg-amber-500 text-xs">Superhost</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{sitter.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{sitter.rating}</span>
                          <span className="text-xs text-muted-foreground">({sitter.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {sitter.city}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{sitter.bio}</p>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-lg font-bold text-orange-500">od {sitter.price}€</span>
                        <span className="text-xs text-muted-foreground">po usluzi</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/pretraga">
              <Button variant="outline">Vidi sve sittere</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Što kažu naši korisnici</h2>
            <p className="text-muted-foreground">Stvarna iskustva vlasnika ljubimaca</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                        {t.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Sitters */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Volite životinje? Zarađujte čuvajući ljubimce!</h2>
            <p className="text-lg text-orange-100 mb-8">
              Pridružite se stotinama sittera diljem Hrvatske. Postavite vlastite cijene,
              upravljajte rasporedom i zarađujte radeći ono što volite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registracija?role=sitter">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg text-base px-8">
                  Postani sitter
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#kako-funkcionira">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-8">
                  Saznaj više
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto">
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-orange-100">Sittera</p>
              </div>
              <div>
                <p className="text-3xl font-bold">2000+</p>
                <p className="text-sm text-orange-100">Rezervacija</p>
              </div>
              <div>
                <p className="text-3xl font-bold">4.8★</p>
                <p className="text-sm text-orange-100">Prosječna ocjena</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
