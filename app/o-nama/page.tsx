import type { Metadata } from 'next';
import { Heart, MapPin, Users, PawPrint, Shield, Search } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export const metadata: Metadata = {
  title: { absolute: 'O nama — Naša priča | PetPark' },
  description: 'PetPark je nastao iz jednostavnog problema — vlasnici ljubimaca u Hrvatskoj nisu imali sve na jednom mjestu. Čuvanje, grooming, školovanje, veterinari, udomljavanje — sad imaju.',
  alternates: { canonical: 'https://petpark.hr/o-nama' },
};

const VALUES = [
  {
    icon: Shield,
    title: 'Povjerenje',
    description: 'Verificirani sitteri, recenzije, transparentnost. Znate s kim ostavljate ljubimca.',
    color: 'text-warm-orange',
    bg: 'bg-warm-orange/5',
  },
  {
    icon: Users,
    title: 'Zajednica',
    description: 'Forum, blog, izgubljeni ljubimci, udomljavanje. Više od platforme — zajednica.',
    color: 'text-warm-teal',
    bg: 'bg-warm-teal/5',
  },
  {
    icon: Heart,
    title: 'Jednostavnost',
    description: 'Nađi, rezerviraj, gotovo. Sve na jednom mjestu, bez komplikacija.',
    color: 'text-warm-coral',
    bg: 'bg-warm-coral/5',
  },
];

export default function AboutPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'O nama', href: '/o-nama' }]} />
      {/* Editorial Hero sa slikom u pozadini */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
        {/* Pozadinska slika */}
        <div className="absolute inset-0">
          <img 
            src="/images/o-nama-ljubav.png" 
            alt="Ljudi i psi u parku" 
            className="w-full h-full object-cover"
          />
          {/* Tamni overlay za bolju čitljivost teksta */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Tekst preko slike */}
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative z-10 flex justify-center">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm font-semibold tracking-wider text-white/80 uppercase mb-4">O nama</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] leading-[1.05] text-white drop-shadow-lg">
              <span className="text-logo-orange">Nastali smo iz ljubavi.</span>{' '}
              <span className="text-logo-teal">Doslovno.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              PetPark je nastao iz želje da svaka šapa nađe svog čovjeka.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16 md:py-20 flex justify-center">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg animate-fade-in-up">
                Mi smo platforma gdje vlasnici ljubimaca mogu naći
                sve na jednom mjestu — čuvanje, grooming, školovanje, veterinare, udomljavanje,
                dog-friendly lokacije i zajednicu koja razumije. Ne agencija, ne posrednik —{' '}
                <strong className="text-foreground">ekosustav za ljude koji vole životinje</strong>.
              </p>

              <div className="appeal-card my-10 animate-fade-in-up delay-200 overflow-hidden">
                <div className="p-8 md:p-10 text-center bg-gradient-to-r from-warm-orange/5 to-warm-teal/5">
                  <PawPrint className="h-10 w-10 text-warm-orange mx-auto mb-4" />
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-snug font-[var(--font-heading)]">
                    Svaki ljubimac zaslužuje brigu kad vlasnik ne može biti tu.
                    <br />
                    Svaki vlasnik zaslužuje mir da zna da je njegov ljubimac u dobrim rukama.
                  </p>
                </div>
              </div>

              <p className="text-lg animate-fade-in-up delay-300">
                U Hrvatskoj živi preko <strong className="text-foreground">800.000 pasa</strong> —
                a platforma koja sve to objedinjuje? Nije postojala. Izvan Zagreba praktički
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

      {/* Origin */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20 flex justify-center">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in-up">
            <MapPin className="h-4 w-4 text-warm-orange" />
            Rijeka, Hrvatska
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] animate-fade-in-up delay-100">
            Mali tim, velika misija
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 animate-fade-in-up delay-200">
            Od Rijeke smo krenuli, ali cilj nam je cijela Hrvatska.
            Svaki grad, svako susjedstvo, svaki ljubimac. Rastemo jer
            zajednica raste s nama — svaki novi korisnik, svaki udomljeni ljubimac,
            svaka sretna šapa je dokaz da ovo funkcionira.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {VALUES.map((v, i) => (
            <div 
              key={i} 
              className="community-section-card p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${v.bg} mb-4`}>
                <v.icon className={`h-6 w-6 ${v.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 font-[var(--font-heading)]">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 pb-20 flex justify-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-warm-orange to-warm-teal p-10 md:p-16 text-center text-white shadow-xl">
          <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">
              PetPark nije samo app. 🐾
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              To je mjesto gdje se ljudi koji vole životinje pronalaze i pomažu jedni drugima
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pretraga">
                <Button size="lg" className="bg-white text-warm-orange hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-8 h-14">
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
