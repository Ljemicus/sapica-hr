import type { Metadata } from 'next';
import { Heart, MapPin, Users, PawPrint, Shield, MessageSquare, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'O nama — Naša priča | PetPark',
  description: 'PetPark je nastao u Rijeci iz jednostavnog problema — kad trebaš nekome ostaviti ljubimca, a nemaš kome. Povezujemo vlasnike s pouzdanim čuvarima u njihovom gradu.',
};

const VALUES = [
  {
    icon: Shield,
    title: 'Povjerenje',
    description: 'Verificirani sitteri, recenzije, transparentnost. Znate s kim ostavljate ljubimca.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Users,
    title: 'Zajednica',
    description: 'Forum, blog, izgubljeni ljubimci, udomljavanje. Više od platforme — zajednica.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
  },
  {
    icon: Heart,
    title: 'Jednostavnost',
    description: 'Nađi, rezerviraj, gotovo. Sve na jednom mjestu, bez komplikacija.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
];

const STATS = [
  { value: '6+', label: 'gradova', icon: MapPin },
  { value: '200+', label: 'registriranih sittera', icon: Users },
  { value: '47', label: 'stranica na platformi', icon: Search },
  { value: '∞', label: 'ljubavi prema životinjama', icon: Heart },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-orange-950/20 dark:via-background dark:to-teal-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <PawPrint className="h-3.5 w-3.5 mr-1.5" />
              O nama
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Nastali smo iz ljubavi.{' '}
              <span className="text-gradient">Doslovno.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              PetPark je nastao iz jednostavnog problema — kad trebaš nekome ostaviti
              ljubimca, a nemaš kome.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg animate-fade-in-up">
                Prijatelji su zauzeti, obitelj daleko, a profesionalne opcije? U Hrvatskoj
                praktički ne postoje. Ili ne znaš za njih.
              </p>
              <p className="text-lg animate-fade-in-up delay-100">
                Osnovali smo PetPark u <strong className="text-foreground">Rijeci</strong> jer
                smo to sami trebali. Platforma koja povezuje vlasnike s pouzdanim čuvarima u
                njihovom gradu. Ne agencija, ne posrednik —{' '}
                <strong className="text-foreground">zajednica ljudi koji vole životinje</strong>.
              </p>

              <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-r from-orange-50 to-teal-50 dark:from-orange-950/20 dark:to-teal-950/20 my-10 animate-fade-in-up delay-200">
                <CardContent className="p-8 text-center">
                  <PawPrint className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-snug">
                    Svaki ljubimac zaslužuje brigu kad vlasnik ne može biti tu.
                    <br />
                    Svaki vlasnik zaslužuje mir da zna da je njegov ljubimac u dobrim rukama.
                  </p>
                </CardContent>
              </Card>

              <p className="text-lg animate-fade-in-up delay-300">
                U Hrvatskoj živi preko <strong className="text-foreground">800.000 pasa</strong> —
                a digitalna infrastruktura za čuvanje? Gotovo nikakva. Izvan Zagreba praktički
                ništa ne postoji. Mi to mijenjamo.
              </p>
              <p className="text-lg animate-fade-in-up delay-400">
                Vjerujemo da ljudi u susjedstvu mogu jedni drugima pomoći. Da studentica koja
                obožava pse može zaraditi čuvajući vašeg Maxa dok ste na putu. Da umirovljenik
                koji živi sam može voditi vašeg ljubimca u šetnju i obojici uljepšati dan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What drives us */}
      <section className="bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/10 dark:to-transparent py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
              Što nas <span className="text-gradient">pokreće</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            {STATS.map((stat, i) => (
              <div key={i} className={`text-center animate-fade-in-up delay-${(i + 1) * 100}`}>
                <stat.icon className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {VALUES.map((v, i) => (
              <Card key={i} className={`border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${(i + 1) * 100}`}>
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-xl ${v.bg} mb-4`}>
                    <v.icon className={`h-6 w-6 ${v.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in-up">
            <MapPin className="h-4 w-4 text-orange-500" />
            Rijeka, Hrvatska
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] animate-fade-in-up delay-100">
            Mali tim, velika misija
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 animate-fade-in-up delay-200">
            Od Rijeke smo krenuli, ali cilj nam je cijela Hrvatska.
            Svaki grad, svako susjedstvo, svaki ljubimac. Rastemo jer
            zajednica raste s nama — svaki novi sitter, svaki zadovoljni vlasnik,
            svaka sretna šapa je dokaz da ovo funkcionira.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-teal-500 p-10 md:p-16 text-center text-white shadow-xl">
          <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              PetPark nije samo app. 🐾
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              To je mjesto gdje se ljudi koji vole životinje pronalaze i pomažu jedni drugima
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pretraga">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-8 h-14">
                  <Search className="mr-2 h-5 w-5" />
                  Pronađi sittera
                </Button>
              </Link>
              <Link href="/postani-sitter">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl font-bold text-lg px-8 h-14">
                  <Heart className="mr-2 h-5 w-5" />
                  Postani sitter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
