'use client';

import { Phone, MapPin, AlertTriangle, Heart, Printer, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const emergencyVets = [
  {
    city: 'Zagreb',
    clinics: [
      { name: 'Veterinarski fakultet — Klinika za kirurgiju', phone: '01 2390 395', address: 'Heinzelova 55', hours: '24h dežurstvo' },
      { name: 'Veterinarska stanica Zagreb', phone: '01 4413 333', address: 'Heinzelova 62', hours: '24h hitna služba' },
    ],
  },
  {
    city: 'Split',
    clinics: [
      { name: 'Veterinarska ambulanta Marjan', phone: '021 389 445', address: 'Šetalište Ivana Meštrovića 45', hours: '24h dežurstvo' },
      { name: 'Veterinarska stanica Split', phone: '021 540 022', address: 'Pojišanska 31', hours: 'Pon-Sub 8-20, hitno po dogovoru' },
    ],
  },
  {
    city: 'Rijeka',
    clinics: [
      { name: 'Veterinarska stanica Rijeka', phone: '051 330 433', address: 'Zvonimirova 5', hours: '24h dežurstvo' },
      { name: 'Vet ambulanta Kantrida', phone: '051 622 144', address: 'Brentinijeva 2', hours: 'Pon-Pet 8-20, Sub 8-14' },
    ],
  },
  {
    city: 'Osijek',
    clinics: [
      { name: 'Veterinarski fakultet Osijek — Klinika', phone: '031 554 922', address: 'Trg Svetog Trojstva 3', hours: '24h dežurstvo' },
      { name: 'Veterinarska stanica Osijek', phone: '031 208 344', address: 'Drinska 17', hours: 'Pon-Sub 8-20' },
    ],
  },
  {
    city: 'Zadar',
    clinics: [
      { name: 'Veterinarska stanica Zadar', phone: '023 316 028', address: 'Put Murvice 14', hours: '24h hitna služba' },
    ],
  },
  {
    city: 'Pula',
    clinics: [
      { name: 'Veterinarska stanica Pula', phone: '052 541 288', address: 'Šijanska cesta 14', hours: '24h dežurstvo' },
    ],
  },
];

const emergencyGuides = [
  {
    icon: '☠️',
    title: 'Trovanje',
    color: 'from-red-500 to-rose-500',
    symptoms: 'Povraćanje, proljev, slinjenje, tremor, konvulzije, gubitak koordinacije',
    steps: [
      'Maknite ljubimca od izvora otrova',
      'Identificirajte otrov (sačuvajte ambalažu/uzorak)',
      'NE izazivajte povraćanje bez upute veterinara',
      'Ako je otrov na koži, isperite vodom 10-15 min',
      'Pozovite hitnog veterinara ODMAH',
    ],
    callVetWhen: 'Odmah — svako trovanje je hitno!',
  },
  {
    icon: '🌡️',
    title: 'Toplinski udar',
    color: 'from-orange-500 to-red-500',
    symptoms: 'Pretjerano dahtanje, gusti slinjenje, crvene desni, vrtoglavica, kolaps',
    steps: [
      'Premjestite ljubimca u hlad ili klimatizirani prostor',
      'Ponudite malu količinu hladne (ne ledene!) vode',
      'Vlažite tijelo hladnim (ne ledenim) ručnicima',
      'Stavite ručnike na vrat, pazuhe i prepone',
      'NE koristite led — može pogoršati stanje',
    ],
    callVetWhen: 'Ako se ne oporavlja unutar 10 minuta ili temperatura prelazi 40°C',
  },
  {
    icon: '🩹',
    title: 'Ugrizi i rane',
    color: 'from-amber-500 to-orange-500',
    symptoms: 'Krvarenje, oteklina, bolnost, vidljiva rana, šepanje',
    steps: [
      'Smireno pristupite — ozlijeđeni ljubimac može ugristi iz straha',
      'Pritisnite čistom tkaninom na ranu da zaustavite krvarenje',
      'Isperite ranu fiziološkom otopinom ili čistom vodom',
      'Ne vadite strana tijela iz duboke rane',
      'Zamotajte ranu čistom gazom i transportirajte do veterinara',
    ],
    callVetWhen: 'Kod dubokih rana, jakog krvarenja ili ugriza životinja',
  },
  {
    icon: '😮‍💨',
    title: 'Gušenje',
    color: 'from-blue-500 to-indigo-500',
    symptoms: 'Otežano disanje, panika, plavkaste desni, hrkanje, grebanje po ustima',
    steps: [
      'Pogledajte u usta — možete li vidjeti predmet?',
      'Ako vidite predmet, pažljivo ga izvadite prstima ili pincetom',
      'Za PASE: Heimlich — stanite iza, stavite šake ispod rebara, snažno pritisnite prema gore i naprijed',
      'Za MAČKE: Držite mačku glavom dolje, blago udarajte po leđima između lopatica',
      'Ako ne možete ukloniti predmet u 30 sekundi, hitno kod veterinara',
    ],
    callVetWhen: 'Ako ne možete ukloniti predmet ili ljubimac gubi svijest',
  },
  {
    icon: '⚡',
    title: 'Konvulzije',
    color: 'from-purple-500 to-violet-500',
    symptoms: 'Trzanje mišića, gubitak svijesti, slinenje, nekontrolirano mokrenje',
    steps: [
      'NE stavljajte ništa u usta ljubimca',
      'NE pokušavajte držati ili ograničavati pokrete',
      'Maknite predmete oko ljubimca da se ne ozlijedi',
      'Zabilježite trajanje napadaja (važno za veterinara)',
      'Nakon napadaja, držite ljubimca na toplom i mirnom mjestu',
    ],
    callVetWhen: 'Ako napadaj traje duže od 3 minute ili se napadaji ponavljaju',
  },
  {
    icon: '🫁',
    title: 'Alergijska reakcija',
    color: 'from-pink-500 to-rose-500',
    symptoms: 'Otečena njuška/oči, koprivnjača, otežano disanje, povraćanje, kolaps',
    steps: [
      'Maknite uzrok alergije ako je poznat',
      'Provjerite disanje — jesu li dišni putevi otvoreni?',
      'Hladni oblog na otečeno mjesto može ublažiti simptome',
      'NE dajte lijekove za ljude bez konzultacije s veterinarom',
      'Hitno transportirajte do veterinara',
    ],
    callVetWhen: 'Odmah ako je otežano disanje ili kolaps — anafilaksija je životno opasna!',
  },
];

export function EmergencyContent() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
        <div className="absolute inset-0 paw-pattern opacity-[0.05]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-0 text-sm px-5 py-2 animate-fade-in-up">
              <Siren className="h-3.5 w-3.5 mr-1.5" />
              Hitna pomoć
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
              🚨 Hitne situacije
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 animate-fade-in-up delay-200 leading-relaxed">
              Brzi vodič za hitne veterinarske situacije. Znajte što napraviti
              dok ne stignete do veterinara.
            </p>
            <a href="tel:014413333" className="inline-block animate-fade-in-up delay-300">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 shadow-lg shadow-red-900/30 text-lg px-8 py-6 rounded-xl font-bold btn-hover">
                <Phone className="h-5 w-5 mr-2" />
                Nazovi najbliži hitni vet
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Section 1: Emergency Vet Numbers by City */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 animate-fade-in-up">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-sm">
              <Phone className="h-5 w-5 text-white" />
            </div>
            Hitni veterinarski brojevi
          </h2>
          <p className="text-muted-foreground mb-8 animate-fade-in-up delay-100">Klinike s hitnim dežurstvom po gradovima</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyVets.map((city, i) => (
              <Card key={city.city} className={`border-0 shadow-sm animate-fade-in-up delay-${((i % 4) + 1) * 100}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    {city.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {city.clinics.map((clinic) => (
                    <div key={clinic.name} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 space-y-1">
                      <p className="font-medium text-sm">{clinic.name}</p>
                      <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="text-red-600 font-bold flex items-center gap-1 text-sm hover:text-red-700 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        {clinic.phone}
                      </a>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {clinic.address}
                      </div>
                      <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs hover:bg-green-50">
                        {clinic.hours}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Emergency Guides */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 animate-fade-in-up">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            Što napraviti u slučaju...
          </h2>
          <p className="text-muted-foreground mb-8 animate-fade-in-up delay-100">Brzi vodič za prvu pomoć ljubimcima</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emergencyGuides.map((guide, i) => (
              <Card key={guide.title} className={`border-0 shadow-sm animate-fade-in-up delay-${((i % 4) + 1) * 100}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center shadow-sm flex-shrink-0 text-lg`}>
                      {guide.icon}
                    </div>
                    {guide.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Simptomi</p>
                    <p className="text-sm text-muted-foreground">{guide.symptoms}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Koraci</p>
                    <ol className="space-y-2">
                      {guide.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <span className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {j + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">🚨 Pozovi veterinara</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{guide.callVetWhen}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Printable Emergency Contacts Card */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 animate-fade-in-up">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            Hitni kontakti — kartica za ispis
          </h2>
          <p className="text-muted-foreground mb-8 animate-fade-in-up delay-100">Isprintajte i postavite na vidljivo mjesto</p>

          <Card className="border-0 shadow-sm animate-fade-in-up delay-200 max-w-lg mx-auto">
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">
                  <span className="text-orange-500">Pet</span><span className="text-teal-600">Park</span>
                  {' '}— Hitni kontakti
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Ispunite i držite na hladnjaku ili uz telefon</p>
              </div>

              <div className="space-y-3">
                {[
                  'Moj veterinar:',
                  'Telefon veterinara:',
                  'Adresa veterinara:',
                  'Ime ljubimca:',
                  'Pasmina / Vrsta:',
                  'Alergije:',
                  'Lijekovi:',
                  'Broj mikročipa:',
                  'Kontakt vlasnika 1:',
                  'Kontakt vlasnika 2:',
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                    <div className="flex-1 border-b border-dashed border-gray-300 min-h-[1.5rem]" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground mb-1">Hitni vet Zagreb: 01 2390 395 · Split: 021 389 445</p>
                <p className="text-xs text-muted-foreground">Rijeka: 051 330 433 · Osijek: 031 554 922</p>
              </div>

              <Button onClick={() => window.print()} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover print:hidden">
                <Printer className="h-4 w-4 mr-2" />
                Isprintaj karticu
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Big CTA */}
        <section className="text-center py-12 animate-fade-in-up">
          <a href="tel:014413333">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200/50 text-lg px-10 py-6 rounded-xl font-bold btn-hover">
              <Phone className="h-5 w-5 mr-2" />
              Nazovi najbliži hitni vet
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            U životno opasnoj situaciji, ne čekajte — odmah nazovite veterinara!
          </p>
        </section>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, footer, .print\\:hidden, section:not(:nth-of-type(4)) { display: none !important; }
          body { font-size: 12px; }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
