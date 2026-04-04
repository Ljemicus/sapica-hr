import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Heart, Scissors, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { GROOMING_HUB_LINKS, TRAINING_HUB_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: 'Grooming saloni u Zagrebu — pronađite salon za ljubimca',
  description: 'Pronađite najbolje grooming salone za pse i mačke u Zagrebu. Šišanje, kupanje, trimanje, njega zubi i kandži. Usporedite cijene i recenzije na PetParku!',
  keywords: ['grooming zagreb', 'salon za pse zagreb', 'šišanje pasa zagreb', 'grooming salon zagreb', 'njega pasa zagreb', 'kupanje pasa zagreb', 'trimanje pasa zagreb'],
  openGraph: {
    title: 'Grooming saloni u Zagrebu — pronađite salon za ljubimca | PetPark',
    description: 'Pronađite najbolje grooming salone u Zagrebu. Usporedite cijene, usluge i recenzije.',
    siteName: 'PetPark',
    type: 'website',
    ...buildLocaleOpenGraph('/grooming-zagreb'),
  },
  alternates: buildLocaleAlternates('/grooming-zagreb'),
};

const GROOMING_SERVICES = [
  { name: 'Šišanje i stiliziranje', desc: 'Profesionalno šišanje prema pasmini ili prema želji vlasnika. Uključuje pranje i sušenje.', price: 'od 25€', icon: Scissors },
  { name: 'Kupanje i sušenje', desc: 'Dubinsko pranje kvalitetnim šamponima, sušenje i četkanje dlake.', price: 'od 15€', icon: Sparkles },
  { name: 'Trimanje', desc: 'Ručno ili strojno trimanje za pasmine koje zahtijevaju posebnu njegu dlake.', price: 'od 30€', icon: Scissors },
  { name: 'Njega kandži', desc: 'Rezanje i brušenje kandži, čišćenje ušiju i njega šapa.', price: 'od 8€', icon: CheckCircle2 },
  { name: 'Njega zubi', desc: 'Profesionalno čišćenje zubi ultrazvukom bez anestezije.', price: 'od 20€', icon: Sparkles },
  { name: 'Spa tretman', desc: 'Kompletni wellness za ljubimce — kupanje, masaža, aromaterapija i njega dlake.', price: 'od 45€', icon: Heart },
];

const FAQS = [
  {
    q: 'Koliko košta grooming u Zagrebu?',
    a: 'Cijene groominga u Zagrebu ovise o veličini psa, stanju dlake i vrsti usluge. Osnovno kupanje i sušenje košta 15-30€, kompletno šišanje 25-60€, a trimanje 30-70€. Manji psi su generalno povoljniji, dok veliki psi s gustom dlakom zahtijevaju više vremena i resursa.',
  },
  {
    q: 'Koliko često trebam voditi psa na grooming?',
    a: 'To ovisi o pasmini i tipu dlake. Psi s dugom dlakom (npr. Shih Tzu, Maltezer, Yorkshire terrier) trebaju grooming svakih 4-6 tjedana. Psi s kratkom dlakom mogu čekati 8-12 tjedana. Pasmine koje zahtijevaju trimanje (npr. Škotski terrier, Wire Fox terrier) trebaju tretman svakih 6-8 tjedana.',
  },
  {
    q: 'Kako odabrati dobar grooming salon u Zagrebu?',
    a: 'Provjerite recenzije na PetParku, pitajte za kvalifikacije groomera, posjetite salon prije prvog termina i obratite pažnju na čistoću prostora. Dobar salon koristi kvalitetne proizvode, ima strpljive groomere i ne koristi sedative. Na PetParku možete usporediti salone po ocjenama, cijenama i uslugama.',
  },
  {
    q: 'Može li moj pas dobiti grooming ako ima kožne probleme?',
    a: 'Da, ali je važno unaprijed obavijestiti groomera o stanju kože vašeg psa. Iskusni groomeri koriste hipoalergene šampone i prilagođavaju tretman osjetljivim ljubimcima. U slučaju ozbiljnih kožnih problema, preporučujemo konzultaciju s veterinarom prije groominga.',
  },
];

export default function GroomingZagreb() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PetPark — Grooming saloni u Zagrebu',
    description: 'Pronađite najbolje grooming salone za pse i mačke u Zagrebu. Usporedite cijene, usluge i recenzije.',
    url: `${BASE_URL}/grooming-zagreb`,
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
      <Breadcrumbs items={[{ label: 'Grooming', href: '/njega' }, { label: 'Zagreb', href: '/grooming-zagreb' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <Scissors className="h-3.5 w-3.5 mr-1.5" />
              Zagreb, Hrvatska
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Grooming saloni u{' '}
              <span className="text-gradient">Zagrebu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Pronađite najbolje grooming salone za vašeg ljubimca. Šišanje, kupanje, trimanje i spa tretmani — sve na jednom mjestu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/pretraga?category=grooming&city=Zagreb">
              <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8">
                  Pronađi salon u Zagrebu
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
            Profesionalni grooming za pse i mačke u Zagrebu
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Grooming nije samo estetska usluga — to je bitan dio zdravstvene njege vašeg ljubimca. Redovito
              šišanje, kupanje i njega dlake sprječavaju kožne probleme, smanjuju rizik od parazita i održavaju
              vašeg psa ili mačku zdravima i sretnima. U Zagrebu postoji rastući broj profesionalnih grooming
              salona, ali pronalaženje pravog može biti izazov bez pouzdanih informacija.
            </p>
            <p>
              PetPark vam omogućuje da na jednom mjestu usporedite grooming salone u Zagrebu po cijenama,
              uslugama, lokaciji i recenzijama stvarnih korisnika. Svaki salon na našoj platformi ima
              detaljni profil s popisom usluga, cjenikom, fotografijama radova i ocjenama vlasnika
              koji su već koristili njihove usluge. To vam pomaže donijeti informiranu odluku i
              pronaći salon koji najbolje odgovara potrebama vašeg ljubimca.
            </p>
            <p>
              Zagreb ima salone za sve budžete — od pristupačnih opcija za osnovno kupanje i šišanje
              do luksuznih spa tretmana koji uključuju masažu, aromaterapiju i premium proizvode za
              njegu dlake. Bez obzira na to kakvu uslugu tražite, na PetParku ćete pronaći salon u
              vašem kvartu koji nudi upravo ono što vaš ljubimac treba.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Vrste grooming <span className="text-gradient">usluga</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GROOMING_SERVICES.map((service) => (
                <Card key={service.name} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="inline-flex rounded-full bg-purple-100 dark:bg-purple-900/30 p-2.5 mb-3">
                      <service.icon className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="font-bold mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{service.desc}</p>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{service.price}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Breed-specific info */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
            Grooming prema pasmini — što vaš pas treba?
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Svaka pasmina ima specifične potrebe za njegu dlake. Psi s dugom, svilenastom dlakom poput
              Maltezera, Shih Tzua i Yorkshire teriera zahtijevaju redovito šišanje i svakodnevno četkanje
              kako bi se spriječilo stvaranje čvorova. Ove pasmine trebaju grooming svakih 4-6 tjedana i
              profesionalno šišanje prema standardu pasmine ili prema želji vlasnika.
            </p>
            <p>
              Pasmine s žičanom dlakom kao što su Schnauzer, Wire Fox terrier i Škotski terrier zahtijevaju
              trimanje — posebnu tehniku uklanjanja stare dlake koja održava teksturu i boju dlake.
              Trimanje je zahtjevniji postupak od običnog šišanja i traži iskusnog groomera koji poznaje
              tehniku. U Zagrebu nekoliko salona specijaliziranih je za trimanje i nude vrhunsku uslugu
              za ove pasmine.
            </p>
            <p>
              Psi s gustom dvostrukom dlakom poput Huskija, Golden retrievera i Bernskog planinskog psa
              trebaju redovito četkanje i sezonsko uklanjanje poddlake. Profesionalno kupanje s
              odgovarajućim šamponom i temeljito sušenje posebnim sušilicama ključni su za zdravlje
              kože i dlake ovih pasmina. Grooming saloni u Zagrebu opremljeni su profesionalnom
              opremom koja omogućuje učinkovitu njegu i za najveće pasmine.
            </p>
          </div>
        </div>
      </section>

      {/* Salon listings */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 font-[var(--font-heading)]">
              Saloni u <span className="text-gradient">Zagrebu</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              U Zagrebu već postoji aktivna grooming ponuda na PetParku. Otvorite filtrirane rezultate za Zagreb i pregledajte profile, usluge i cijene na jednom mjestu.
            </p>
            <Link href="/pretraga?category=grooming&city=Zagreb">
              <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8">
                Otvori grooming rezultate u Zagrebu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
            Savjeti za odabir grooming salona u Zagrebu
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Prije prvog posjeta salonu, posjetite prostor i upoznajte groomera. Obratite pažnju na čistoću
              salona, kvalitetu opreme i kako se groomer odnosi prema životinjama. Profesionalni groomer
              trebao bi biti strpljiv, nježan i imati iskustvo s vašom pasminom. Pitajte za certifikate
              i edukaciju — kvalitetni groomeri redovito pohađaju seminare i usavršavanja.
            </p>
            <p>
              Pripremite svog ljubimca za grooming postupno. Ako vaš pas nikada nije bio na groomingu,
              počnite s kraćim tretmanima poput kupanja ili rezanja kandži. Pohvalite ga i nagradite
              nakon posjeta. S vremenom će se naviknuti na salon i postupak će biti ugodniji i za
              psa i za groomera. Na PetParku možete pročitati iskustva drugih vlasnika i odabrati
              salon koji je posebno dobar s nervoznim ili plašljivim ljubimcima.
            </p>
          </div>
        </div>
      </section>

      {/* Why PetPark */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Zašto koristiti PetPark za <span className="text-gradient">grooming</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Star, title: 'Stvarne recenzije', desc: 'Svaka recenzija dolazi od verificiranog korisnika koji je stvarno posjetio salon.', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
                { icon: Shield, title: 'Verificirani saloni', desc: 'Provjeravamo kvalifikacije groomera i uvjete u salonu prije objave na platformi.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
                { icon: Sparkles, title: 'Usporedba cijena', desc: 'Na jednom mjestu vidite cijene svih salona u vašem kvartu i odaberite najbolju opciju.', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
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
        eyebrow="Povezano"
        title="Nastavite iz Zagreba prema drugim relevantnim rutama"
        description="Umjesto da grooming landingica ostane izolirana, ovdje vodi prema drugim gradovima, treningu i sadržajnom sloju koji prati isti intent."
        items={[
          ...GROOMING_HUB_LINKS,
          TRAINING_HUB_LINKS[0],
          ...CONTENT_DISCOVERY_LINKS.slice(0, 2),
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

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
            Pronađite savršeni grooming salon u Zagrebu
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Usporedite salone, pročitajte recenzije i zakažite termin za vašeg ljubimca. Sve na jednom mjestu.
          </p>
          <Link href="/pretraga?category=grooming&city=Zagreb">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-8 font-semibold">
              Pretraži salone u Zagrebu
              <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
        </div>
      </section>
    </>
  );
}
