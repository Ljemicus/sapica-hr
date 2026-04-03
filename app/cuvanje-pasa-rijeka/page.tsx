import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Shield, Clock, Heart, Mountain, Anchor, Scissors, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { getCityServiceLinks, getSiblingCityLinks } from '@/lib/seo/internal-links';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: 'Čuvanje pasa u Rijeci — pronađite pouzdanog sittera',
  description: 'Pronađite iskusne i verificirane pet sittere u Rijeci. Čuvanje pasa u vašem kvartu — Trsat, Kantrida, Sušak, Kozala, Turnić i okolica. Pošaljite upit online.',
  keywords: ['čuvanje pasa rijeka', 'pet sitter rijeka', 'čuvanje ljubimaca rijeka', 'dog sitter rijeka', 'šetanje pasa rijeka', 'dnevna njega pasa rijeka'],
  openGraph: {
    title: 'Čuvanje pasa u Rijeci — pronađite pouzdanog sittera | PetPark',
    description: 'Pronađite verificirane pet sittere u Rijeci. Čuvanje, šetnje i dnevna njega pasa u vašem kvartu.',
    url: `${BASE_URL}/cuvanje-pasa-rijeka`,
    siteName: 'PetPark',
    locale: 'hr_HR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Čuvanje pasa u Rijeci — pronađite pouzdanog sittera | PetPark',
    description: 'Pronađite verificirane pet sittere u Rijeci. Čuvanje, šetnje i dnevna njega pasa u vašem kvartu.',
    images: [`${BASE_URL}/opengraph-image`],
  },
  alternates: { canonical: `${BASE_URL}/cuvanje-pasa-rijeka` },
};

const FAQS = [
  {
    q: 'Koliko košta čuvanje pasa u Rijeci?',
    a: 'Cijene čuvanja pasa u Rijeci kreću se od 10 do 25 eura po danu. Noćni smještaj obično košta 15-22€, dnevna njega 10-16€, a šetnje od 7€ po šetnji. Rijeka je generalno povoljnija od Zagreba i Splita za usluge čuvanja kućnih ljubimaca.',
  },
  {
    q: 'Koji su najbolji kvartovi za pse u Rijeci?',
    a: 'Trsat je odličan izbor zahvaljujući blizini šume i mirnom okruženju. Kantrida nudi pristup plaži i šetnici Lungo mare. Kozala i Turnić imaju zelene površine pogodne za šetnje. Sušak je dobro povezan i ima nekoliko manjih parkova ideanih za svakodnevne šetnje.',
  },
  {
    q: 'Ima li Rijeka dog-friendly plaže?',
    a: 'Da! Rijeka i okolica imaju nekoliko plaža koje su prijateljski nastrojene prema psima, posebno izvan turističke sezone. Kantrida i Preluk su popularne opcije. Naši sitteri poznaju sve lokacije gdje su psi dobrodošli i prilagođavaju šetnje prema tome.',
  },
  {
    q: 'Mogu li pronaći sittera za hitne situacije u Rijeci?',
    a: 'Da, na PetParku možete pronaći sittere koji prihvaćaju rezervacije u kratkom roku. Koristite filter "brzi odgovor" u pretrazi da pronađete sittere koji obično odgovaraju unutar sat vremena. Za najbolje rezultate ipak preporučujemo rezervaciju barem nekoliko dana unaprijed.',
  },
];

export default function CuvanjePasaRijeka() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PetPark — Čuvanje pasa u Rijeci',
    description: 'Pronađite pouzdane pet sittere za čuvanje pasa u Rijeci. Verificirani profili i slanje upita online.',
    url: `${BASE_URL}/cuvanje-pasa-rijeka`,
    logo: `${BASE_URL}/opengraph-image`,
    image: `${BASE_URL}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Rijeka',
      addressRegion: 'Primorsko-goranska županija',
      addressCountry: 'HR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.3271,
      longitude: 14.4422,
    },
    areaServed: {
      '@type': 'City',
      name: 'Rijeka',
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
      <Breadcrumbs items={[{ label: 'Čuvanje pasa', href: '/pretraga' }, { label: 'Rijeka', href: '/cuvanje-pasa-rijeka' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-teal-950/20 dark:via-background dark:to-blue-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <Anchor className="h-3.5 w-3.5 mr-1.5" />
              Rijeka, Hrvatska
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Čuvanje pasa u{' '}
              <span className="text-gradient">Rijeci</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Pronađite pouzdane pet sittere u Rijeci i okolici. Od Trsata do Kantrida — vaš ljubimac je u sigurnim rukama.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/pretraga?city=Rijeka">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                  Pronađi sittera u Rijeci
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
            Čuvanje pasa u Rijeci — grad na moru s velikim srcem za ljubimce
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Rijeka je treći najveći grad u Hrvatskoj, smješten na sjevernom Jadranu između mora i planine.
              Ovaj jedinstveni položaj čini Rijeku izvanrednim gradom za vlasnike pasa — s jedne strane imate
              pristup morskoj obali i šetnici Lungo mare, a s druge strane brda i šume koje nude beskrajne
              mogućnosti za šetnje i avanture s vašim četveronožnim prijateljem.
            </p>
            <p>
              Riječani su poznati po svojoj ljubavi prema životinjama. Grad ima aktivnu zajednicu vlasnika
              pasa i sve više sadržaja prilagođenih kućnim ljubimcima. Međutim, specifičan teren grada —
              brda, stepenice i uske ulice u starom dijelu — čini da pronalaženje pravog sittera koji
              poznaje grad postaje još važnije. PetPark vam pomaže pronaći sittera koji živi u vašem
              kvartu, poznaje lokalne parkove i staze, i razumije specifičnosti života s psom u Rijeci.
            </p>
            <p>
              Bilo da živite na Trsatu s pogledom na Kvarner, u mirnom Sušaku, na vjetrovitoj Kantridi
              uz more ili u živahnom centru grada — na PetParku ćete pronaći iskusnog sittera koji će
              se brinuti o vašem ljubimcu kao o vlastitom. Naša zajednica sittera u Rijeci stalno raste,
              a svaki prolazi verificaciju koja uključuje provjeru identiteta i iskustva sa životinjama.
            </p>
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Čuvanje pasa po riječkim <span className="text-gradient">kvartovima</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Trsat', desc: 'Pogled na Kvarner, blizina šume' },
                { name: 'Kantrida', desc: 'Uz more, plaža i Lungo mare' },
                { name: 'Sušak', desc: 'Mirna četvrt, dobra povezanost' },
                { name: 'Kozala', desc: 'Zelene površine, mirno okruženje' },
                { name: 'Turnić', desc: 'Parkovne površine, blizina centra' },
                { name: 'Pećine', desc: 'Uz obalu, šetnice uz more' },
                { name: 'Zamet', desc: 'Mirno predgrađe sa zelenim površinama' },
                { name: 'Drenova', desc: 'Brežuljkasto okruženje, svježi zrak' },
                { name: 'Škurinje', desc: 'Blizina šuma i planinskih staza' },
              ].map((hood) => (
                <Card key={hood.name} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2">
                        <MapPin className="h-4 w-4 text-teal-500" />
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

      {/* Parks & walks */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
            Najbolja mjesta za šetnju pasa u Rijeci
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-8">
            <p>
              Šetnica Lungo mare jedna je od najljepših obalnih šetnica u Hrvatskoj i savršena je za
              svakodnevne šetnje s psom. Proteže se od Opatije do Voloskog, prolazi kroz Kantridu i
              pruža spektakularne poglede na Kvarnerski zaljev. Mnogi naši sitteri ovu šetnicu koriste
              za jutarnje i večernje šetnje jer kombinira more, svježi zrak i ravan teren.
            </p>
            <p>
              Trsatska šuma iznad istoimene gradske četvrti nudi prekrasne staze kroz gustu šumu
              s pogledom na grad i zaljev. Park Mlaka u centru grada manji je, ali praktičan za brze
              šetnje. Za aktivnije pse, okolica Rijeke nudi pristup planinskim stazama prema
              Učki i Gorskom kotaru, gdje vaš ljubimac može uživati u prirodi daleko od gradske gužve.
              Preluk je popularna dog-friendly plaža gdje psi mogu uživati u moru tijekom toplijih mjeseci.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'Lungo mare', feature: 'Obalna šetnica, ravan teren' },
              { name: 'Trsatska šuma', feature: 'Šumske staze iznad grada' },
              { name: 'Preluk', feature: 'Dog-friendly plaža' },
              { name: 'Park Mlaka', feature: 'Gradski park, brze šetnje' },
            ].map((park) => (
              <div key={park.name} className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/20">
                <Mountain className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold">{park.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">— {park.feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
              Savjeti za vlasnike pasa u Rijeci
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              <p>
                Rijeka je poznata po buri — snažnom sjevernom vjetru koji može biti izazov za šetnje
                s manjim psima. Iskusni riječki sitteri znaju kako prilagoditi šetnje prema vremenskim
                uvjetima i koje rute koristiti kada puše bura. Zimi je važno zaštititi šape pasa od
                soli na posutim cestama, dok ljeti treba paziti na vrućinu asfalta, posebno u nižim
                dijelovima grada.
              </p>
              <p>
                PetPark je nastao upravo u Rijeci, pa imamo posebnu vezu s ovim gradom i njegovom
                zajednicom vlasnika ljubimaca. Naši riječki sitteri su među prvima koji su se
                pridružili platformi i imaju bogato iskustvo. Preporučujemo da iskoristite mogućnost
                upoznavanja sa sitterom prije rezervacije — mnogi sitteri nude besplatan uvodini
                susret gdje se mogu upoznati s vašim psom i dogovoriti sve detalje njege.
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
              Zašto vlasnici u Rijeci biraju <span className="text-gradient">PetPark</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'Verificirani profili', desc: 'Svaki profil prolazi osnovnu provjeru prije objave kako biste lakše procijenili kome šaljete upit.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { icon: Heart, title: 'Nastali u Rijeci', desc: 'PetPark je osnovan u Rijeci. Poznajemo grad, zajednicu i potrebe lokalnih vlasnika ljubimaca.', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
                { icon: Clock, title: 'Podrška pon–sub', desc: 'Naš tim podrške dostupan je pon–sub od 8 do 20h. Tu smo kad vam treba pomoć.', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
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

      <InternalLinkSection
        eyebrow="Idući korak"
        title="Istražite Rijeku i povezane PetPark rute"
        description="Rijeka već ima sadržajni sitting landing, grooming supply i training supply — zato ovdje povezujemo realne nastavke puta umjesto generičkog SEO punjenja."
        items={[
          ...getCityServiceLinks('Rijeka').slice(0, 4),
          ...getSiblingCityLinks('Rijeka'),
        ]}
      />

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

      {/* Cross-links: other cities + services */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-[var(--font-heading)]">
          Čuvanje pasa u drugim gradovima
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link href="/cuvanje-pasa-zagreb" className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-orange-300 hover:shadow-md transition-all">
            <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm group-hover:text-orange-600 transition-colors">Zagreb</p>
              <p className="text-xs text-muted-foreground">Sitteri u zagrebačkim kvartovima</p>
            </div>
          </Link>
          <Link href="/cuvanje-pasa-split" className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-blue-300 hover:shadow-md transition-all">
            <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">Split</p>
              <p className="text-xs text-muted-foreground">Sitteri u splitskim kvartovima</p>
            </div>
          </Link>
          <Link href="/njega?city=Rijeka" className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-pink-300 hover:shadow-md transition-all">
            <Scissors className="h-5 w-5 text-pink-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm group-hover:text-pink-600 transition-colors">Grooming u Rijeci</p>
              <p className="text-xs text-muted-foreground">Šišanje, kupanje i njega</p>
            </div>
          </Link>
          <Link href="/dresura?city=Rijeka" className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-indigo-300 hover:shadow-md transition-all">
            <GraduationCap className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">Školovanje pasa u Rijeci</p>
              <p className="text-xs text-muted-foreground">Treneri i programi</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-teal-500 to-blue-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
            Pronađite savršenog sittera u Rijeci
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Pouzdani profili u svim riječkim kvartovima čekaju vaš upit. Pošaljite upit online brzo i jasno.
          </p>
          <Link href="/pretraga?city=Rijeka">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 rounded-full px-8 font-semibold">
              Pretraži sittere u Rijeci
              <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
        </div>
      </section>
    </>
  );
}
