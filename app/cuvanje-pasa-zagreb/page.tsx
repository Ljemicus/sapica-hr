import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Shield, Clock, Heart, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: 'Čuvanje pasa u Zagrebu — pronađite pouzdanog sittera',
  description: 'Pronađite iskusne i verificirane pet sittere u Zagrebu. Čuvanje pasa u vašem kvartu — Maksimir, Trešnjevka, Novi Zagreb, Dubrava i drugi. Rezervirajte online!',
  keywords: ['čuvanje pasa zagreb', 'pet sitter zagreb', 'čuvanje ljubimaca zagreb', 'dog sitter zagreb', 'šetanje pasa zagreb', 'dnevna njega pasa zagreb'],
  openGraph: {
    title: 'Čuvanje pasa u Zagrebu — pronađite pouzdanog sittera | PetPark',
    description: 'Pronađite verificirane pet sittere u Zagrebu. Čuvanje, šetnje i dnevna njega pasa u vašem kvartu.',
    url: `${BASE_URL}/cuvanje-pasa-zagreb`,
    siteName: 'PetPark',
    locale: 'hr_HR',
    type: 'website',
  },
  alternates: { canonical: `${BASE_URL}/cuvanje-pasa-zagreb` },
};

const FAQS = [
  {
    q: 'Koliko košta čuvanje pasa u Zagrebu?',
    a: 'Cijene čuvanja pasa u Zagrebu kreću se od 12 do 30 eura po danu, ovisno o vrsti usluge. Noćni smještaj obično košta 18-25€, dnevna njega 12-20€, a šetnje od 8€ po šetnji. Na PetParku svaki sitter postavlja vlastite cijene, pa možete pronaći opciju koja odgovara vašem budžetu.',
  },
  {
    q: 'Kako pronaći pouzdanog pet sittera u Zagrebu?',
    a: 'Na PetParku svi sitteri prolaze proces verifikacije koji uključuje provjeru identiteta i iskustva sa životinjama. Preporučujemo da provjerite recenzije drugih korisnika, dogovorite upoznavanje prije rezervacije i odaberete sittere s oznakom "Superhost" za dodatnu sigurnost.',
  },
  {
    q: 'Mogu li dobiti dnevna ažuriranja o svom psu?',
    a: 'Da! Većina sittera na PetParku šalje redovita ažuriranja s fotografijama i videozapisima vašeg ljubimca. Možete dogovoriti učestalost ažuriranja prije početka čuvanja. Neki sitteri nude i GPS praćenje šetnji.',
  },
  {
    q: 'Što ako se moj pas razboli tijekom čuvanja?',
    a: 'Svi PetPark sitteri imaju upute za postupanje u hitnim situacijama. Sitter vas odmah kontaktira i zajedno reagirate. Preporučujemo da unaprijed dogovorite veterinara i hitni kontakt.',
  },
];

export default function CuvanjePasaZagreb() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PetPark — Čuvanje pasa u Zagrebu',
    description: 'Pronađite pouzdane pet sittere za čuvanje pasa u Zagrebu. Verificirani sitteri, online rezervacija, osiguranje.',
    url: `${BASE_URL}/cuvanje-pasa-zagreb`,
    logo: `${BASE_URL}/opengraph-image`,
    image: `${BASE_URL}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zagreb',
      addressRegion: 'Grad Zagreb',
      addressCountry: 'HR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.815,
      longitude: 15.9819,
    },
    areaServed: {
      '@type': 'City',
      name: 'Zagreb',
    },
    priceRange: '€€',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs items={[{ label: 'Čuvanje pasa', href: '/pretraga' }, { label: 'Zagreb', href: '/cuvanje-pasa-zagreb' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-orange-950/20 dark:via-background dark:to-teal-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              Zagreb, Hrvatska
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Čuvanje pasa u{' '}
              <span className="text-gradient">Zagrebu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Pronađite verificirane i iskusne pet sittere u vašem zagrebačkom kvartu. Smještaj, dnevna njega, šetnje i posjete — sve na jednom mjestu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/pretraga?city=Zagreb">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                  Pronađi sittera u Zagrebu
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
            Zašto odabrati PetPark za čuvanje pasa u Zagrebu?
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Zagreb je grad s više od 800.000 stanovnika i desecima tisuća kućnih ljubimaca. Svaki vlasnik psa u nekom
              trenutku treba pouzdanu osobu koja će se brinuti o njegovom ljubimcu — bilo da putuje na godišnji odmor,
              ima poslovne obveze ili jednostavno treba pomoć s dnevnim šetnjama. PetPark povezuje vlasnike pasa u
              Zagrebu s verificiranim i iskusnim pet sitterima koji pružaju profesionalnu njegu u ugodnom okruženju.
            </p>
            <p>
              Naša platforma pokriva sve zagrebačke kvartove i gradske četvrti. Bez obzira živite li na Trešnjevci,
              u Maksimiru, Novom Zagrebu, Dubravi, na Jarunu, Trnju ili u Stenjevcu — na PetParku ćete pronaći
              sittera u blizini vašeg doma. To je posebno važno jer psi se bolje osjećaju kad ostaju u poznatom
              okruženju ili barem blizu njega.
            </p>
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Čuvanje pasa po zagrebačkim <span className="text-gradient">kvartovima</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Maksimir', desc: 'Blizina park-šume Maksimir, idealno za šetnje' },
                { name: 'Trešnjevka', desc: 'Središnja lokacija, mnogo zelenih površina' },
                { name: 'Novi Zagreb', desc: 'Bundek, Savica i prostrani parkovi' },
                { name: 'Dubrava', desc: 'Mirna četvrt sa zelenim okruženjem' },
                { name: 'Jarun', desc: 'Jezero Jarun — raj za aktivne pse' },
                { name: 'Stenjevec', desc: 'Zapadni dio grada, blizina Medvednice' },
                { name: 'Trnje', desc: 'Blizina Savskog nasipa i šetnica' },
                { name: 'Črnomerec', desc: 'Pristup šumskim stazama Medvednice' },
                { name: 'Sesvete', desc: 'Ruralno okruženje, prostrani dvorišta' },
              ].map((hood) => (
                <Card key={hood.name} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{hood.name}</h3>
                        <p className="text-sm text-muted-foreground">{hood.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Parks section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
            Popularni parkovi za šetnju pasa u Zagrebu
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-8">
            <p>
              Zagreb obiluje zelenim površinama koje su savršene za šetnje i igru s vašim ljubimcem. Park-šuma Maksimir
              je najveći i najpoznatiji gradski park s kilometrima šetnica kroz šumu i travnate površine. Mnogi
              zagrebački sitteri koriste Maksimir za dugačke šetnje jer nudi obilje prostora gdje psi mogu sigurno
              trčati i istraživati.
            </p>
            <p>
              Jezero Jarun omiljena je destinacija za vlasnike aktivnih pasa. Šljunčane plaže i staze oko jezera
              pružaju savršen teren za trčanje, plivanje i igru. Bundek u Novom Zagrebu manja je, ali jednako
              popularna opcija sa uređenim stazama oko jezera. Park Ribnjak u centru grada, Tuškanac i Zelengaj
              na obroncima Medvednice te Savski nasip koji se proteže kroz cijeli grad — sve su to lokacije koje
              naši sitteri redovito koriste za šetnje vaših ljubimaca.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'Park-šuma Maksimir', feature: 'Kilometri šumskih staza' },
              { name: 'Jezero Jarun', feature: 'Plaže i staze uz jezero' },
              { name: 'Bundek', feature: 'Uređene staze, mirna atmosfera' },
              { name: 'Savski nasip', feature: 'Dugačke šetnje uz rijeku' },
            ].map((park) => (
              <div key={park.name} className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/20">
                <TreePine className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{park.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">— {park.feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
              Savjeti za vlasnike pasa u Zagrebu
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              <p>
                Ako prvi put tražite pet sittera u Zagrebu, evo nekoliko korisnih savjeta. Prije svega, rezervirajte
                sittera barem tjedan dana unaprijed, posebno tijekom ljetnih mjeseci i blagdana kada je potražnja
                najveća. Dogovorite upoznavanje s potencijalnim sitterom kako bi se vaš pas naviknuo na novu osobu.
                Pripremite pisane upute o hranjenju, lijekovima i navikama vašeg ljubimca.
              </p>
              <p>
                Važno je znati da Zagreb ima pravila o držanju pasa na javnim površinama. Psi moraju biti na
                povodcu u parkovima i na ulici, osim na posebno označenim površinama za slobodno puštanje.
                Obavezno je skupljanje za psom — vaš sitter će to naravno znati, ali dobro je i vama biti
                upoznatim s pravilima. Zagreb ima i nekoliko posebno označenih &quot;dog parkova&quot; s ogradama
                gdje psi mogu slobodno trčati, uključujući onaj na Jarunu i u parku Mladenaca.
              </p>
              <p>
                Odabirom verificiranog sittera na PetParku dobivate dodatnu sigurnost. Svi naši sitteri prolaze
                provjeru identiteta, imaju ocjene i recenzije od prethodnih korisnika, a PetPark nudi osiguranje
                za svaku rezervaciju. To znači da možete mirne savjesti otputovati znajući da je vaš ljubimac
                u sigurnim rukama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why PetPark */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Zašto vlasnici u Zagrebu biraju <span className="text-gradient">PetPark</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'Verificirani sitteri', desc: 'Svaki sitter prolazi provjeru identiteta i iskustva. Samo pouzdani sitteri dobivaju pristup platformi.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { icon: Heart, title: 'Sigurna platforma', desc: 'Sve rezervacije prolaze kroz platformu — transparentno plaćanje i komunikacija na jednom mjestu.', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
                { icon: Clock, title: 'Brza rezervacija', desc: 'Pronađite sittera, pošaljite upit i rezervirajte — sve u roku od nekoliko minuta.', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
              ].map((item) => (
                <Card key={item.title} className="border-0 shadow-sm text-center">
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-full ${item.bg} p-3 mb-4`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
            Često postavljana pitanja
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-xl border bg-card p-0 overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden list-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-teal-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
            Pronađite savršenog sittera u Zagrebu
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Verificirani sitteri u svim zagrebačkim kvartovima čekaju vašeg ljubimca. Rezervirajte online u par klikova.
          </p>
          <Link href="/pretraga?city=Zagreb">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 rounded-full px-8 font-semibold">
              Pretraži sittere u Zagrebu
              <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
        </div>
      </section>
    </>
  );
}
