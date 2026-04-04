import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Heart, Scissors, Sparkles, CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { GROOMING_HUB_LINKS, TRAINING_HUB_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { buildLocaleAlternates } from '@/lib/seo/locale-metadata';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: 'Pet Grooming in Zagreb — Find a Grooming Salon for Your Pet',
  description:
    'Find pet grooming salons in Zagreb for dogs and cats. Haircuts, bathing, hand stripping, nail care and spa treatments — compare services and prices on PetPark.',
  keywords: [
    'pet grooming zagreb',
    'dog grooming zagreb',
    'cat grooming zagreb',
    'dog salon zagreb',
    'dog haircut zagreb',
    'dog bathing zagreb',
    'hand stripping zagreb',
  ],
  openGraph: {
    title: 'Pet Grooming in Zagreb — Find a Grooming Salon for Your Pet | PetPark',
    description: 'Find grooming salons in Zagreb. Compare services, prices and reviews in one place.',
    url: `${BASE_URL}/grooming-zagreb/en`,
    siteName: 'PetPark',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pet Grooming in Zagreb — Find a Grooming Salon for Your Pet | PetPark',
    description: 'Find grooming salons in Zagreb. Compare services, prices and reviews in one place.',
    images: [`${BASE_URL}/opengraph-image`],
  },
  alternates: buildLocaleAlternates('/grooming-zagreb/en'),
};

const GROOMING_SERVICES = [
  {
    name: 'Haircut and styling',
    desc: 'Professional grooming tailored to the breed standard or the owner’s preference. Includes washing and drying.',
    price: 'from €25',
    icon: Scissors,
  },
  {
    name: 'Bathing and drying',
    desc: 'Deep wash with quality shampoos, followed by drying and coat brushing.',
    price: 'from €15',
    icon: Sparkles,
  },
  {
    name: 'Hand stripping',
    desc: 'Hand or machine stripping for breeds that require more specialized coat care.',
    price: 'from €30',
    icon: Scissors,
  },
  {
    name: 'Nail care',
    desc: 'Nail trimming and filing, ear cleaning and paw care.',
    price: 'from €8',
    icon: CheckCircle2,
  },
  {
    name: 'Dental care',
    desc: 'Professional ultrasonic teeth cleaning without anesthesia.',
    price: 'from €20',
    icon: Sparkles,
  },
  {
    name: 'Spa treatment',
    desc: 'Full pet wellness treatment — bathing, massage, aromatherapy and coat care.',
    price: 'from €45',
    icon: Heart,
  },
];

const FAQS = [
  {
    q: 'How much does grooming cost in Zagreb?',
    a: 'Grooming prices in Zagreb depend on your dog’s size, coat condition and the type of service you book. Basic bathing and drying usually costs €15–30, a full haircut €25–60, and hand stripping €30–70. Small dogs are usually more affordable, while large dogs with thick coats require more time and work.',
  },
  {
    q: 'How often should I take my dog to grooming?',
    a: 'It depends on the breed and coat type. Long-haired dogs such as Shih Tzus, Maltese and Yorkshire Terriers usually need grooming every 4–6 weeks. Short-haired dogs can often wait 8–12 weeks. Breeds that require hand stripping should typically be booked every 6–8 weeks.',
  },
  {
    q: 'How do I choose a good grooming salon in Zagreb?',
    a: 'Check reviews on PetPark, ask about the groomer’s qualifications, visit the salon before the first appointment and pay attention to cleanliness. A good salon uses quality products, has patient groomers and does not rely on sedatives. On PetPark you can compare salons by ratings, prices and services.',
  },
  {
    q: 'Can my dog be groomed if they have skin problems?',
    a: 'Yes, but you should always inform the groomer in advance about your dog’s skin condition. Experienced groomers can use hypoallergenic shampoos and adapt the treatment for sensitive pets. If the skin problem is more serious, it is smartest to talk to your vet before booking grooming.',
  },
];

export default function GroomingZagrebEnPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PetPark — Pet Grooming in Zagreb',
    description: 'Find grooming salons for dogs and cats in Zagreb. Compare services, prices and reviews.',
    url: `${BASE_URL}/grooming-zagreb/en`,
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
      <Breadcrumbs items={[{ label: 'Grooming', href: '/njega' }, { label: 'Zagreb', href: '/grooming-zagreb/en' }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <Scissors className="h-3.5 w-3.5 mr-1.5" />
              Zagreb, Croatia
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Pet Grooming in <span className="text-gradient">Zagreb</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Find trusted grooming salons for your pet. Haircuts, bathing, hand stripping and spa treatments — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/pretraga?category=grooming&city=Zagreb">
                <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8">
                  Find a salon in Zagreb
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">Professional grooming for dogs and cats in Zagreb</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Grooming is not just about appearance — it is an important part of your pet’s health routine. Regular coat care,
              bathing and trimming help prevent skin problems, reduce the risk of parasites and keep your dog or cat more
              comfortable. Zagreb has a growing number of professional grooming salons, but finding the right one is much easier
              when you can compare the options in one place.
            </p>
            <p>
              PetPark helps you compare grooming salons in Zagreb by price, services, location and reviews from real owners.
              Each salon profile can include service lists, pricing, portfolio photos and ratings from people who have already
              used that salon. That gives you a more confident starting point when choosing care for your pet.
            </p>
            <p>
              Zagreb offers options for different budgets — from practical salons for basic bathing and clipping to more premium
              spa-style treatments with massage, aromatherapy and specialized coat care products. Whether you need a routine wash
              or breed-specific grooming, you can start with a salon that matches your pet’s needs and your budget.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Types of grooming <span className="text-gradient">services</span>
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

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">Breed-specific grooming — what does your dog need?</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Every breed has different coat-care requirements. Dogs with long silky coats, such as Maltese, Shih Tzus and
              Yorkshire Terriers, usually need regular clipping and frequent brushing to avoid matting. These breeds often benefit
              from grooming every 4–6 weeks, either according to breed standards or the owner’s preferred style.
            </p>
            <p>
              Wire-coated breeds such as Schnauzers, Wire Fox Terriers and Scottish Terriers often need hand stripping — a more
              specialized technique that helps preserve coat texture and color. It is a more demanding service than a regular
              haircut, so it makes sense to look for a groomer with direct experience in that technique.
            </p>
            <p>
              Dogs with thick double coats, such as Huskies, Golden Retrievers and Bernese Mountain Dogs, benefit from regular
              brushing and seasonal undercoat removal. Professional bathing with suitable shampoos and proper high-velocity drying
              can make a huge difference for skin and coat health. Grooming salons in Zagreb increasingly offer equipment that can
              handle larger breeds comfortably too.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 font-[var(--font-heading)]">
              Salons in <span className="text-gradient">Zagreb</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Zagreb already has an active grooming supply on PetPark. Open filtered results for Zagreb and browse profiles,
              services and prices in one place.
            </p>
            <Link href="/pretraga?category=grooming&city=Zagreb">
              <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8">
                Open Zagreb grooming results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">Tips for choosing a grooming salon in Zagreb</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Before your first appointment, visit the space if possible and meet the groomer. Pay attention to cleanliness,
              equipment quality and how the groomer interacts with animals. A professional groomer should be patient, gentle and
              comfortable working with your breed. It is also fair game to ask about certifications and ongoing education.
            </p>
            <p>
              Prepare your pet for grooming gradually. If your dog has never been groomed before, start with shorter services such
              as bathing or nail trimming. Praise and reward your pet after the appointment. Over time the process becomes easier
              for both the dog and the groomer. On PetPark you can also read owner experiences and look for salons that handle shy
              or anxious pets especially well.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">
              Why use PetPark for <span className="text-gradient">grooming</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Star,
                  title: 'Real reviews',
                  desc: 'Every review comes from a verified user who actually visited the salon.',
                  color: 'text-yellow-500',
                  bg: 'bg-yellow-50 dark:bg-yellow-950/20',
                },
                {
                  icon: Shield,
                  title: 'Verified salons',
                  desc: 'We aim to surface salons with clearer profile information so comparison is easier.',
                  color: 'text-purple-500',
                  bg: 'bg-purple-50 dark:bg-purple-950/20',
                },
                {
                  icon: Sparkles,
                  title: 'Price comparison',
                  desc: 'See service ranges and compare salons in your area without jumping between tabs.',
                  color: 'text-pink-500',
                  bg: 'bg-pink-50 dark:bg-pink-950/20',
                },
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
        eyebrow="Related"
        title="Keep exploring from Zagreb"
        description="This English landing now connects into the same nearby routes instead of becoming a lonely SEO island. Tiny victory, very on-brand."
        items={[
          ...GROOMING_HUB_LINKS,
          TRAINING_HUB_LINKS[0],
          ...CONTENT_DISCOVERY_LINKS.slice(0, 2),
        ]}
      />

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-xl border bg-card p-0 overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden list-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple-500 to-pink-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
            Find the right grooming salon in Zagreb
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Compare salons, read reviews and move faster toward the right appointment for your pet.
          </p>
          <Link href="/pretraga?category=grooming&city=Zagreb">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-8 font-semibold">
              Browse Zagreb salons
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
