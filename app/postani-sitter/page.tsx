import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Star, MapPin, Shield, TrendingUp, CheckCircle2, ArrowRight, Users, Wallet, Calendar, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Postani pet sitter — zarađuj čuvajući ljubimce',
  description: 'Pridruži se PetPark zajednici sittera. Zarađuj fleksibilno, upoznaj ljubimce i budi dio najveće platforme za čuvanje životinja u Hrvatskoj.',
  keywords: ['postani sitter', 'posao čuvanje pasa', 'zarada čuvanje ljubimaca', 'pet sitter posao'],
  openGraph: {
    title: 'Postani pet sitter — zarađuj čuvajući ljubimce | PetPark',
    description: 'Pridruži se PetPark zajednici sittera. Zarađuj fleksibilno čuvajući ljubimce.',
    url: 'https://petpark.hr/postani-sitter',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/postani-sitter' },
};

const BENEFITS = [
  {
    icon: Wallet,
    title: 'Zarađuj fleksibilno',
    description: 'Sam/a određuješ cijenu i raspoloživost. Bez fiksnog radnog vremena — čuvaj kad ti odgovara.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    icon: Calendar,
    title: 'Ti biraš kad radiš',
    description: 'Blokiraj dane kad nisi dostupan/na. Prihvaćaj samo rezervacije koje ti pašu.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Shield,
    title: 'Podrška & sigurnost',
    description: 'Verificirani profili, sustav recenzija i podrška tima kad ti treba pomoć.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: Heart,
    title: 'Radi ono što voliš',
    description: 'Provodi vrijeme sa životinjama i budi plaćen/a za to. Najbolji posao na svijetu? Možda. 🐾',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
  {
    icon: TrendingUp,
    title: 'Gradi reputaciju',
    description: 'Svaka uspješna rezervacija i pozitivna recenzija podiže tvoj profil u pretrazi.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    icon: Users,
    title: 'Zajednica sittera',
    description: 'Pridruži se forumu, dijeli iskustva i savjete s drugim sitterima iz cijele Hrvatske.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Kreiraj profil',
    description: 'Registriraj se, dodaj sliku, opiši sebe i svoje iskustvo sa životinjama. Traje 2 minute.',
  },
  {
    step: '2',
    title: 'Postavi usluge i cijene',
    description: 'Odaberi što nudiš — smještaj, dnevnu njegu, šetnje. Postavi svoje cijene i raspoloživost.',
  },
  {
    step: '3',
    title: 'Prihvaćaj rezervacije',
    description: 'Vlasnici te pronalaze u pretrazi, šalju upit — ti odlučuješ prihvaćaš li.',
  },
  {
    step: '4',
    title: 'Čuvaj & zarađuj',
    description: 'Čuvaj ljubimce, šalji ažuriranja vlasnicima i prikupi odlične recenzije.',
  },
];

const SERVICES = [
  { name: 'Smještaj', desc: 'Ljubimac ostaje kod tebe', price: 'od 20€/noć', emoji: '🏠' },
  { name: 'Dnevna njega', desc: 'Čuvanje preko dana', price: 'od 15€/dan', emoji: '☀️' },
  { name: 'Šetnja', desc: '30-60 min šetnja', price: 'od 8€/šetnja', emoji: '🐕' },
  { name: 'Posjeta', desc: 'Dolazak u dom vlasnika', price: 'od 12€/posjet', emoji: '🏡' },
];

const TESTIMONIALS = [
  {
    name: 'Ana M.',
    city: 'Zagreb',
    text: 'Čuvam pse već godinu dana preko PetParka. Fleksibilnost je nevjerojatna — radim kad mi odgovara, a pas je uvijek sretan. 🐶',
    rating: 5,
    gradient: 'from-orange-400 to-pink-400',
  },
  {
    name: 'Marko K.',
    city: 'Split',
    text: 'Kao student, ovo je savršen način za zaraditi uz faks. Upoznajem divne ljude i njihove ljubimce svaki tjedan.',
    rating: 5,
    gradient: 'from-teal-400 to-blue-400',
  },
  {
    name: 'Ivana T.',
    city: 'Rijeka',
    text: 'Počela sam sa šetnjama, sad nudim i smještaj. Zarada je odlična, a posao mi je omiljena stvar u danu. ❤️',
    rating: 5,
    gradient: 'from-purple-400 to-indigo-400',
  },
];

const FAQ = [
  {
    q: 'Koliko mogu zaraditi?',
    a: 'Ovisi o tvojim cijenama i koliko rezervacija prihvatiš. Aktivni sitteri zarađuju 300-800€ mjesečno. Neki i više!',
  },
  {
    q: 'Trebam li iskustvo sa životinjama?',
    a: 'Iskustvo pomaže, ali nije obavezno. Bitno je da voliš životinje i da si odgovoran/na. Vlasnici vide tvoj profil i recenzije.',
  },
  {
    q: 'Koliko se naplaćuje PetPark provizija?',
    a: 'Registracija je potpuno besplatna. PetPark uzima malu proviziju od svake rezervacije — ostalo ide tebi.',
  },
  {
    q: 'Što ako imam problem za vrijeme čuvanja?',
    a: 'Naš tim za podršku je tu za tebe. Kontaktiraj nas putem chata ili emaila — pomažemo 7 dana u tjednu.',
  },
  {
    q: 'Mogu li čuvati samo određene životinje?',
    a: 'Naravno! Na profilu označavaš koje životinje prihvaćaš (psi, mačke, male životinje...) i koje veličine.',
  },
  {
    q: 'Kako primam isplate?',
    a: 'Isplate idu direktno na tvoj bankovni račun. Brzo, sigurno, transparentno.',
  },
];

export default function PostaniSitterPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50 dark:from-teal-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <PawPrint className="h-3.5 w-3.5 mr-1.5" />
              Pridruži se timu
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Voliš životinje?{' '}
              <span className="text-gradient">Zarađuj čuvajući ih.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Postani PetPark sitter i pretvori ljubav prema životinjama u fleksibilan izvor prihoda.
              Sam/a biraš kad radiš, koliko naplaćuješ i koje ljubimce čuvaš.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/registracija?role=sitter">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 btn-hover rounded-xl font-bold text-lg px-8 h-14 w-full sm:w-auto">
                  Registriraj se kao sitter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#kako-radi">
                <Button size="lg" variant="outline" className="rounded-xl font-semibold text-lg px-8 h-14 w-full sm:w-auto">
                  Kako funkcionira?
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-fade-in-up delay-400">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-orange-500">0€</p>
                <p className="text-sm text-muted-foreground">Registracija</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-teal-500">2 min</p>
                <p className="text-sm text-muted-foreground">Postavljanje</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-purple-500">Ti biraš</p>
                <p className="text-sm text-muted-foreground">Raspored</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
            Zašto postati <span className="text-gradient">PetPark sitter</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Više od posla — ovo je lifestyle za ljude koji vole životinje.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <Card key={i} className={`border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${(i % 3 + 1) * 100}`}>
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-xl ${b.bg} mb-4`}>
                  <b.icon className={`h-6 w-6 ${b.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services & Earnings */}
      <section className="bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/10 dark:to-transparent py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
              Što možeš <span className="text-gradient">nuditi</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Odaberi usluge koje ti odgovaraju. Možeš nuditi jednu ili sve — ti odlučuješ.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {SERVICES.map((s, i) => (
              <Card key={i} className="border-0 shadow-sm rounded-2xl text-center card-hover">
                <CardContent className="p-6">
                  <span className="text-4xl mb-3 block">{s.emoji}</span>
                  <h3 className="font-bold text-base mb-1">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 font-semibold">
                    {s.price}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            💡 Cijene su orijentacijske — sam/a postavljaš koliko naplaćuješ.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="kako-radi" className="container mx-auto px-4 py-16 md:py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
            Kako <span className="text-gradient">funkcionira</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            4 jednostavna koraka do tvoje prve rezervacije.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex gap-6 mb-8 last:mb-0 animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200/30">
                  {s.step}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-orange-200 to-transparent mx-auto mt-2" />
                )}
              </div>
              <div className="pt-1">
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/10 dark:to-transparent py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
              Što kažu naši <span className="text-gradient">sitteri</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className={`border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${(i + 1) * 100}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {t.city}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
            Česta <span className="text-gradient">pitanja</span>
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ.map((faq, i) => (
            <Card key={i} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-teal-500 p-10 md:p-16 text-center text-white shadow-xl">
          <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Spreman/na za prvu rezervaciju? 🐾
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              Registracija je besplatna i traje manje od 2 minute.
              Pridruži se stotinama sittera koji već zarađuju na PetParku.
            </p>
            <Link href="/registracija?role=sitter">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-10 h-14">
                Kreni sada — besplatno
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
