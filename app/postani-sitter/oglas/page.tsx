import type { Metadata } from 'next';
import { BadgeCheck, CalendarDays, CheckCircle2, Heart, MapPin, ShieldCheck, Wallet } from 'lucide-react';
import { LandingPrimaryCTA, LandingSecondaryCTA } from './cta-buttons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Postani sitter — fleksibilna zarada uz ljubimce',
  description: 'Zarađuj čuvajući pse i mačke u svom gradu. Prijava je besplatna, onboarding traje par minuta, a ti biraš termine i cijene.',
  keywords: ['pet sitter posao', 'čuvanje pasa posao', 'zarada uz pse', 'postani sitter hrvatska'],
  openGraph: {
    title: 'Postani sitter — fleksibilna zarada uz ljubimce | PetPark',
    description: 'Zarađuj čuvajući pse i mačke u svom gradu. Ti biraš termine, usluge i cijene.',
    url: 'https://petpark.hr/postani-sitter/oglas',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/postani-sitter/oglas' },
};

const BENEFITS = [
  {
    icon: Wallet,
    title: 'Dodatna zarada na svoj način',
    description: 'Sam/a određuješ cijene, usluge i koliko rezervacija želiš prihvatiti.',
  },
  {
    icon: CalendarDays,
    title: 'Ti biraš termine',
    description: 'Radi kad ti odgovara — vikendom, navečer ili samo povremeno.',
  },
  {
    icon: Heart,
    title: 'Posao za ljude koji vole životinje',
    description: 'Ako voliš pse i mačke, ovo je jedan od rijetkih side-jobova koji je stvarno gušt.',
  },
  {
    icon: ShieldCheck,
    title: 'Sigurniji i ozbiljniji od dogovora “preko poruke”',
    description: 'Profil, upiti, recenzije i onboarding na jednom mjestu — bez kaosa u inboxu.',
  },
];

const SERVICES = [
  'Smještaj preko noći',
  'Dnevna briga',
  'Šetnje pasa',
  'Čuvanje u domu vlasnika',
  'Kratki posjeti',
];

const STEPS = [
  'Ispuni prijavu i pošalji osnovne podatke',
  'Dodaj grad, usluge i kratki opis profila',
  'Nakon odobrenja primaš prve upite vlasnika',
  'Prihvaćaš samo rezervacije koje ti odgovaraju',
];

const FAQ = [
  {
    q: 'Moram li imati obrt ili firmu?',
    a: 'Da. Za pružanje usluga na PetParku potrebno je imati registriran obrt ili firmu (j.d.o.o., d.o.o.). To osigurava pravnu zaštitu tebi i vlasnicima ljubimaca.',
  },
  {
    q: 'Mogu li nuditi samo šetnje ili samo čuvanje?',
    a: 'Da. Ne moraš nuditi sve. Odabereš samo ono što ti ima smisla.',
  },
  {
    q: 'Koliko traje prijava?',
    a: 'Par minuta. Dovoljno je da pošalješ osnovne podatke i kratki opis.',
  },
  {
    q: 'Mogu li raditi uz postojeći posao ili faks?',
    a: 'Da, to je i poanta. Ovo je fleksibilna dodatna zarada, ne klasična smjena od 8 sati.',
  },
];

export default function SitterAdsLandingPage() {
  return (
    <div className="bg-background">
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <p className="section-kicker mb-5">
              Prijave za nove sittere su otvorene
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-[var(--font-heading)] mb-5 text-white">
              Zarađuj čuvajući pse i mačke
              <span className="block text-white/80">u svom gradu</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
              Ako voliš životinje i želiš fleksibilnu dodatnu zaradu, prijavi se za PetPark sittera.
              Ti biraš kad radiš, koje usluge nudiš i koliko rezervacija prihvaćaš.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <LandingPrimaryCTA />
              <LandingSecondaryCTA />
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="community-section-card p-4 bg-white/10 border-white/20">
                <div className="text-2xl font-extrabold text-white">0€</div>
                <div className="text-sm text-white/70">prijava</div>
              </div>
              <div className="community-section-card p-4 bg-white/10 border-white/20">
                <div className="text-2xl font-extrabold text-white">par min</div>
                <div className="text-sm text-white/70">do prijave</div>
              </div>
              <div className="community-section-card p-4 bg-white/10 border-white/20">
                <div className="text-2xl font-extrabold text-white">ti biraš</div>
                <div className="text-sm text-white/70">raspored</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((item) => (
            <div key={item.title} className="community-section-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-orange/10 text-warm-orange mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="font-bold text-lg mb-2 font-[var(--font-heading)]">{item.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-14 md:py-18">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] mb-4">
                Što možeš nuditi kao sitter?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Ne moraš nuditi sve. Kreneš s jednom uslugom, a kasnije proširiš profil kad ti sjedne ritam.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {SERVICES.map((service) => (
                  <div key={service} className="community-section-card px-4 py-3 font-medium flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-warm-teal flex-shrink-0" />
                    {service}
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
              <CardContent className="p-7">
                <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">Za koga je ovo?</Badge>
                <div className="space-y-4 text-sm md:text-base">
                  <p>✅ Za ljude koji vole životinje i žele dodatnu zaradu</p>
                  <p>✅ Za studente, freelancere i zaposlene koji žele fleksibilnost</p>
                  <p>✅ Za one koji već čuvaju ljubimce “usput”, ali to žele raditi ozbiljnije</p>
                  <p>❌ Nije za ekipu koja želi brzu lovu bez odgovornosti</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="kako-radi" className="container mx-auto px-4 py-14 md:py-18 scroll-mt-24">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] mb-4">Kako izgleda prijava?</h2>
          <p className="text-lg text-muted-foreground">Bez filozofije. Jednostavno i brzo.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {STEPS.map((step, index) => (
            <Card key={step} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6 flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-teal-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <p className="pt-2 font-medium leading-relaxed">{step}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-18">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-orange-500 to-teal-500 text-white p-8 md:p-12 shadow-xl">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Tražimo sittere u većim gradovima</h2>
              <p className="text-white/90 text-lg leading-relaxed mb-5">
                Zagreb, Rijeka, Split i ostali gradovi gdje postoji potražnja za čuvanjem i šetnjama pasa.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                {['Zagreb', 'Rijeka', 'Split', 'Osijek', 'Pula'].map((city) => (
                  <span key={city} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {city}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm border border-white/15">
              <p className="text-sm uppercase tracking-wide text-white/70 mb-2">Call to action bez glupiranja</p>
              <p className="text-xl font-bold mb-5">Ako želiš krenuti, prijava ti je doslovno par minuta.</p>
              <LandingPrimaryCTA className="w-full h-13 rounded-xl bg-white text-orange-600 hover:bg-white/90 font-bold" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] mb-4">Pitanja koja će ljudi imati</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <Card key={item.q} className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    {item.q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-7">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
