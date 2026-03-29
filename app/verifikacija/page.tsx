import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Award, ArrowRight, CheckCircle2, PawPrint, Upload, UserCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Verifikacija sittera | PetPark',
  description: 'Saznajte više o verifikacijskim razinama na PetParku — Basic, Verificiran i Premium sitter. Izgradite povjerenje i privucite više klijenata.',
};

const tiers = [
  {
    level: 'Basic',
    subtitle: 'Početni korak',
    icon: PawPrint,
    color: 'from-gray-400 to-gray-500',
    borderColor: 'border-gray-200 dark:border-gray-700',
    badgeColor: 'bg-gray-100 text-gray-600',
    benefits: [
      'Kreiranje profila',
      'Postavljanje cijena',
      'Primanje upita',
      'Pristup forumu',
    ],
    requirements: [
      'Registracija na platformi',
      'Ispunjen profil s fotografijom',
    ],
  },
  {
    level: 'Verificiran',
    subtitle: 'Pouzdani čuvar',
    icon: ShieldCheck,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    benefits: [
      'Plava oznaka na profilu',
      'Viši rang u pretrazi',
      'Pristup premium klijentima',
      'Prioritetna podrška',
      'PetPark osiguranje',
    ],
    requirements: [
      'Provjera identiteta (osobna iskaznica)',
      'Provjera pozadine',
      'Verifikacija adrese',
    ],
    featured: true,
  },
  {
    level: 'Premium',
    subtitle: 'Elitni sitter',
    icon: Award,
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    benefits: [
      'Zlatna Premium oznaka',
      'Najviši rang u pretrazi',
      'Istaknuti profil na naslovnici',
      'Ekskluzivne promocije',
      'Niža provizija (10% umjesto 15%)',
      'Personalizirani marketing',
    ],
    requirements: [
      'Verificiran status',
      '10+ pozitivnih recenzija',
      'Prosječna ocjena 4.5+',
      'Aktivni profil 3+ mjeseca',
    ],
  },
];

const steps = [
  {
    step: 1,
    title: 'Registrirajte se',
    description: 'Kreirajte profil, dodajte fotografije i opišite svoje iskustvo s ljubimcima.',
    icon: UserCheck,
    color: 'from-orange-500 to-amber-500',
  },
  {
    step: 2,
    title: 'Pošaljite dokumente',
    description: 'Uploadajte osobnu iskaznicu i ispunite obrazac za provjeru pozadine.',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: 3,
    title: 'Dobijte oznaku',
    description: 'Naš tim pregleda prijavu u roku 24-48h. Nakon odobrenja dobivate verificiranu oznaku.',
    icon: ShieldCheck,
    color: 'from-teal-500 to-emerald-500',
  },
  {
    step: 4,
    title: 'Rastite do Premium',
    description: 'Prikupite recenzije, održavajte visoku ocjenu i automatski napredujte na Premium razinu.',
    icon: Star,
    color: 'from-amber-500 to-orange-500',
  },
];

export default function VerifikacijaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-blue-950/20 dark:via-background dark:to-amber-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Povjerenje i sigurnost
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Verifikacija{' '}
              <span className="text-gradient">sittera</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Izgradite povjerenje s vlasnicima ljubimaca. Verificirani sitteri dobivaju
              do 3x više rezervacija i pristup premium značajkama.
            </p>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">
            Razine verifikacije
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">
            Tri razine za vaš uspjeh
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Od početnika do elitnog sittera — svaka razina donosi nove pogodnosti
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <Card
              key={tier.level}
              className={`border-2 ${tier.borderColor} shadow-sm rounded-2xl overflow-hidden animate-fade-in-up delay-${(i + 1) * 100} ${tier.featured ? 'ring-2 ring-blue-400 dark:ring-blue-600 scale-[1.02]' : ''} relative`}
            >
              {tier.featured && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center text-xs font-bold py-1.5">
                  Najpopularniji
                </div>
              )}
              <CardContent className={`p-6 md:p-8 ${tier.featured ? 'pt-10' : ''}`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} text-white mb-4 shadow-lg`}>
                  <tier.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-extrabold mb-1 font-[var(--font-heading)]">{tier.level}</h3>
                <p className="text-sm text-muted-foreground mb-6">{tier.subtitle}</p>

                <div className="space-y-3 mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pogodnosti</p>
                  {tier.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zahtjevi</p>
                  {tier.requirements.map((req) => (
                    <div key={req} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Get Verified */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/40 to-white dark:from-orange-950/10 dark:to-background relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">
              Kako do verifikacije
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">
              Četiri jednostavna koraka
            </h2>
            <p className="text-muted-foreground text-lg">Od registracije do Premium statusa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((item, i) => (
              <div key={item.step} className={`text-center animate-fade-in-up delay-${(i + 1) * 100}`}>
                <div className="text-6xl font-extrabold text-orange-100/80 dark:text-orange-900/30 leading-none mb-3 select-none">
                  {String(item.step).padStart(2, '0')}
                </div>
                <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg -mt-10`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 font-[var(--font-heading)]">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="border-0 shadow-sm rounded-3xl bg-gradient-to-r from-blue-500 via-teal-500 to-orange-500 overflow-hidden">
          <CardContent className="p-10 md:p-16 text-center text-white relative">
            <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">
                Spremni za verifikaciju?
              </h2>
              <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
                Pokrenite proces verifikacije danas i počnite privlačiti više klijenata.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/registracija?role=sitter">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-10 h-14">
                    Započni verifikaciju
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 rounded-xl text-lg px-10 h-14">
                    Česta pitanja
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
