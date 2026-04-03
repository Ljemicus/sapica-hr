import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Shield, Clock, Heart, Sun, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: 'Čuvanje pasa u Splitu — pronađite pouzdanog sittera',
  description: 'Pronađite iskusne i verificirane pet sittere u Splitu. Čuvanje pasa u vašem kvartu — Bačvice, Firule, Marjan, Spinut, Solin i okolica. Rezervirajte online!',
  keywords: ['čuvanje pasa split', 'pet sitter split', 'čuvanje ljubimaca split', 'dog sitter split', 'šetanje pasa split', 'dnevna njega pasa split'],
  openGraph: {
    title: 'Čuvanje pasa u Splitu — pronađite pouzdanog sittera | PetPark',
    description: 'Pronađite verificirane pet sittere u Splitu. Čuvanje, šetnje i dnevna njega pasa u vašem kvartu.',
    url: `${BASE_URL}/cuvanje-pasa-split`,
    siteName: 'PetPark',
    locale: 'hr_HR',
    type: 'website',
  },
  alternates: { canonical: `${BASE_URL}/cuvanje-pasa-split` },
};

const FAQS = [
  {
    q: 'Koliko košta čuvanje pasa u Splitu?',
    a: 'Cijene čuvanja pasa u Splitu kreću se od 12 do 28 eura po danu. Noćni smještaj obično košta 16-25€, dnevna njega 12-18€, a šetnje od 8€ po šetnji. Tijekom ljetne sezone cijene mogu biti nešto više zbog povećane potražnje.',
  },
  {
    q: 'Ima li u Splitu pet sittera koji primaju pse tijekom ljeta?',
    a: 'Da! Na PetParku imate desetke aktivnih sittera u Splitu koji primaju pse tijekom cijele godine, uključujući ljetnu sezonu. Preporučujemo da rezervirate unaprijed jer je ljeto najtraženije razdoblje. Mnogi splitski sitteri imaju dvorišta ili blizinu parkova idealne za šetnje i igru.',
  },
  {
    q: 'Može li sitter šetati mog psa po Marjanu?',
    a: 'Naravno! Marjan je omiljena lokacija za šetnje pasa u Splitu. Mnogi naši sitteri iz kvartova Spinut, Meje i Varoš redovito šeću pse po marjanskim stazama. Svježi zrak, hlad i priroda čine Marjan idealnim za dugačke šetnje.',
  },
  {
    q: 'Kako rezervirati sittera u Splitu preko PetParka?',
    a: 'Jednostavno pretražite sittere u Splitu na našoj platformi, pregledajte profile, recenzije i cijene. Pošaljite upit za željene datume, dogovorite upoznavanje i potvrdite rezervaciju. Cijeli proces traje samo nekoliko minuta.',
  },
];

export default function CuvanjePasaSplit() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PetPark — Čuvanje pasa u Splitu',
    description: 'Pronađite pouzdane pet sittere za čuvanje pasa u Splitu. Verificirani sitteri, online rezervacija, osiguranje.',
    url: `${BASE_URL}/cuvanje-pasa-split`,
    logo: `${BASE_URL}/opengraph-image`,
    image: `${BASE_URL}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Split',
      addressRegion: 'Splitsko-dalmatinska županija',
      addressCountry: 'HR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.5081,
      longitude: 16.4402,
    },
    areaServed: {
      '@type': 'City',
      name: 'Split',
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
      <Breadcrumbs items={[{ label: 'Čuvanje pasa', href: '/pretraga' }, { label: 'Split', href: '/cuvanje-pasa-split' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-blue-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <Sun className="h-3.5 w-3.5 mr-1.5" />
              Split, Hrvatska
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Čuvanje pasa u{' '}
              <span className="text-gradient">Splitu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Pronađite verificirane pet sittere u Splitu i okolici. Vaš ljubimac zaslužuje najbolju njegu dok ste na putu ili na poslu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/pretraga?city=Split">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                  Pronađi sittera u Splitu
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
            Čuvanje pasa u Splitu — sve što trebate znati
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Split je drugi najveći grad u Hrvatskoj s bogatom mediteranskom kulturom i toplom klimom koja pogoduje
              aktivnom životu na otvorenom — i za ljude i za njihove ljubimce. Međutim, život u dalmatinskom gradu
              donosi i specifične izazove za vlasnike pasa. Ljetne vrućine, turističke gužve i nedostatak zelenih
              površina u užem centru grada čine pronalaženje pouzdanog pet sittera iznimno važnim.
            </p>
            <p>
              PetPark nudi rješenje za sve splitske vlasnike pasa. Naša platforma povezuje vas s iskusnim sitterima
              koji poznaju grad, razumiju potrebe pasa u mediteranskoj klimi i nude usluge prilagođene vašim
              potrebama. Bilo da trebate nekoga tko će čuvati vašeg psa dok ste na godišnjem odmoru, ili vam
              treba svakodnevna pomoć sa šetnjama tijekom vrelih ljetnih dana — na PetParku ćete pronaći
              pravu osobu.
            </p>
            <p>
              Posebno je važno napomenuti da Split tijekom ljetnih mjeseci doživljava značajan porast temperature.
              Naši iskusni sitteri znaju da je šetnje potrebno organizirati rano ujutro ili kasno navečer,
              da pas uvijek mora imati pristup svježoj vodi i da je hlad neophodan tijekom najvrućeg
              dijela dana. To znanje i iskustvo čini razliku između prosječnog i izvrsnog sittera.
            </p>
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Čuvanje pasa po splitskim <span className="text-gradient">kvartovima</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Bačvice', desc: 'Popularna plaža, blizina centra grada' },
                { name: 'Firule', desc: 'Mirna četvrt s parkom i plažom' },
                { name: 'Marjan', desc: 'Park-šuma idealna za dugačke šetnje' },
                { name: 'Spinut', desc: 'Blizina Marjana i ACI marine' },
                { name: 'Meje', desc: 'Šetnice uz more i pristup Marjanu' },
                { name: 'Solin', desc: 'Blizina rijeke Jadro, zeleno okruženje' },
                { name: 'Žnjan', desc: 'Dugačka šetnica i dog-friendly plaža' },
                { name: 'Stobreč', desc: 'Mirno predgrađe s pristupom moru' },
                { name: 'Split 3', desc: 'Središnja lokacija, parkovi u blizini' },
              ].map((hood) => (
                <Card key={hood.name} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
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

      {/* Parks & beaches */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
            Najbolja mjesta za šetnju pasa u Splitu
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-8">
            <p>
              Park-šuma Marjan je bez premca najbolja lokacija za šetnje pasa u Splitu. S preko 300 hektara
              šumskog područja, kilometrima staza i svježim zrakom, Marjan pruža bijeg od gradske vreve.
              Staze su raznolike — od laganog šetališta uz more do zahtjevnijih planinskih puteva po
              brdu. Naši sitteri posebno cijene rane jutarnje šetnje po Marjanu kada je temperatura ugodna,
              a staze prazne.
            </p>
            <p>
              Šetnica Žnjan popularna je za večernje šetnje uz more. Plaža Žnjan ima i dijelove koji su
              tolerantni prema psima, posebno izvan glavne turističke sezone. Rijeka Jadro u Solinu nudi
              zeleno okruženje s hlada uz vodu, dok je Sustipan mali ali lijep park na vrhu poluotoka
              Marjan s pogledom na more i otoke.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'Park-šuma Marjan', feature: 'Šume, staze, svježi zrak' },
              { name: 'Šetnica Žnjan', feature: 'Uz more, dugačka staza' },
              { name: 'Rijeka Jadro (Solin)', feature: 'Zeleni koridori uz vodu' },
              { name: 'Sustipan', feature: 'Pogled na more i otoke' },
            ].map((park) => (
              <div key={park.name} className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <Waves className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
              Savjeti za vlasnike pasa u Splitu
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              <p>
                Splitsko ljeto može biti izazovno za pse. Temperature lako prelaze 35 stupnjeva, a asfalt
                se može zagrijati do opasnih razina. Dobri sitteri u Splitu znaju da se šetnje moraju
                planirati rano ujutro prije 9 sati ili navečer nakon 19 sati. Između toga, pas treba
                biti na hladnom, s pristupom svježoj vodi i po mogućnosti klima-uređaju.
              </p>
              <p>
                Ako planirate putovanje tijekom ljeta, rezervirajte sittera što ranije — idealno 2-3
                tjedna unaprijed. Ljeto je vršna sezona i najtraženiji sitteri se brzo popune.
                Upoznajte sittera s vašim psom prije rezervacije i obavezno ostavite detaljne
                upute o hranjenju, lijekovima i posebnim potrebama. S PetParkom imate sigurnost
                verificiranog sittera, osiguranja i korisničke podrške na raspolaganju 7 dana u tjednu.
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
              Zašto vlasnici u Splitu biraju <span className="text-gradient">PetPark</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'Verificirani sitteri', desc: 'Svaki sitter prolazi provjeru identiteta i iskustva. Samo pouzdani sitteri dobivaju pristup platformi.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { icon: Heart, title: 'Osiguranje uključeno', desc: 'Svaka rezervacija pokrivena je osiguranjem do 500€ za hitne veterinarske troškove.', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
                { icon: Clock, title: 'Lokalni sitteri', desc: 'Sitteri iz vašeg kvarta koji poznaju Split, lokalne parkove i specifičnosti mediteranske klime.', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
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
      <section className="bg-gradient-to-r from-blue-500 to-teal-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
            Pronađite savršenog sittera u Splitu
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Verificirani sitteri u svim splitskim kvartovima spremni su za vašeg ljubimca. Rezervirajte sigurno i brzo.
          </p>
          <Link href="/pretraga?city=Split">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-8 font-semibold">
              Pretraži sittere u Splitu
              <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
        </div>
      </section>
    </>
  );
}
