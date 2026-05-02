import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Clock, GraduationCap, Heart, MapPin, Scissors, Shield } from 'lucide-react';

import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCityServiceLinks, getSiblingCityLinks } from '@/lib/seo/internal-links';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export type SupportedEnglishCity = 'Zagreb' | 'Split' | 'Rijeka';

export type CityLandingFaq = {
  q: string;
  a: string;
};

export type CityLandingStatCard = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  bg: string;
};

export type CityLandingListItem = {
  name: string;
  desc: string;
};

export type CityLandingHighlight = {
  name: string;
  feature: string;
};

export type CityLandingCrossLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  hoverBorderClass: string;
  hoverTextClass: string;
};

export type CityLandingEnConfig = {
  city: SupportedEnglishCity;
  route: string;
  title: string;
  description: string;
  keywords: string[];
  openGraphDescription: string;
  heroBadgeLabel: string;
  heroBadgeIcon: LucideIcon;
  heroBadgeClassName: string;
  heroSectionClassName: string;
  heroTitle: string;
  heroDescription: string;
  heroCtaLabel: string;
  searchCity: string;
  introTitle: string;
  introParagraphs: string[];
  neighborhoodsTitle: string;
  neighborhoods: CityLandingListItem[];
  neighborhoodIconColorClass: string;
  neighborhoodIconBgClass: string;
  highlightsTitle: string;
  highlightsIntroParagraphs: string[];
  highlights: CityLandingHighlight[];
  highlightsPanelClassName: string;
  highlightsIcon: LucideIcon;
  highlightsIconClass: string;
  tipsTitle: string;
  tipsParagraphs: string[];
  whyTitle: string;
  whyCards: CityLandingStatCard[];
  internalLinksEyebrow: string;
  internalLinksTitle: string;
  internalLinksDescription: string;
  faqTitle: string;
  faqs: CityLandingFaq[];
  crossLinksTitle: string;
  crossLinks: CityLandingCrossLink[];
  finalCtaSectionClassName: string;
  finalCtaTitle: string;
  finalCtaDescription: string;
  finalCtaButtonClassName: string;
  finalCtaLabel: string;
  localBusinessName: string;
  localBusinessDescription: string;
  addressRegion: string;
  latitude: number;
  longitude: number;
};

export function buildEnglishCityMetadata(config: CityLandingEnConfig): Metadata {
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: `${config.heroTitle} | PetPark`,
      description: config.openGraphDescription,
      siteName: 'PetPark',
      type: 'website',
      ...buildLocaleOpenGraph(config.route),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.heroTitle} | PetPark`,
      description: config.openGraphDescription,
      images: [`${BASE_URL}/opengraph-image`],
    },
    alternates: buildLocaleAlternates(config.route),
  };
}

export function CityLandingPageEn({ config }: { config: CityLandingEnConfig }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.localBusinessName,
    description: config.localBusinessDescription,
    url: `${BASE_URL}${config.route}`,
    logo: `${BASE_URL}/opengraph-image`,
    image: `${BASE_URL}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: config.city,
      addressRegion: config.addressRegion,
      addressCountry: 'HR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.latitude,
      longitude: config.longitude,
    },
    areaServed: {
      '@type': 'City',
      name: config.city,
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
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const HighlightsIcon = config.highlightsIcon;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs items={[{ label: 'Dog sitting', href: '/pretraga' }, { label: config.city, href: config.route }]} />

      <section className={`relative overflow-hidden ${config.heroSectionClassName}`}>
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className={`mb-6 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up ${config.heroBadgeClassName}`}>
              <config.heroBadgeIcon className="h-3.5 w-3.5 mr-1.5" />
              {config.heroBadgeLabel}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              {config.heroTitle.split(config.city)[0]}
              <span className="text-gradient">{config.city}</span>
              {config.heroTitle.split(config.city)[1]}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              {config.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href={`/pretraga?city=${encodeURIComponent(config.searchCity)}`}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                  {config.heroCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">{config.introTitle}</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            {config.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">{config.neighborhoodsTitle}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.neighborhoods.map((hood) => (
                <Card key={hood.name} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${config.neighborhoodIconBgClass}`}>
                        <MapPin className={`h-4 w-4 ${config.neighborhoodIconColorClass}`} />
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

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">{config.highlightsTitle}</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground mb-8">
            {config.highlightsIntroParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {config.highlights.map((item) => (
              <div key={item.name} className={`flex items-center gap-3 p-4 rounded-xl ${config.highlightsPanelClassName}`}>
                <HighlightsIcon className={`h-5 w-5 flex-shrink-0 ${config.highlightsIconClass}`} />
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">— {item.feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">{config.tipsTitle}</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              {config.tipsParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">{config.whyTitle}</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {config.whyCards.map((item) => (
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
        eyebrow={config.internalLinksEyebrow}
        title={config.internalLinksTitle}
        description={config.internalLinksDescription}
        items={[
          ...getCityServiceLinks(config.city).slice(0, 4),
          ...getSiblingCityLinks(config.city),
        ]}
      />

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center font-[var(--font-heading)]">{config.faqTitle}</h2>
          <div className="space-y-4">
            {config.faqs.map((faq) => (
              <details key={faq.q} className="group rounded-xl border bg-card p-0 overflow-hidden">
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

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-[var(--font-heading)]">{config.crossLinksTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {config.crossLinks.map((item) => (
            <Link key={`${item.href}-${item.title}`} href={item.href} className={`group flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all ${item.hoverBorderClass}`}>
              <item.icon className={`h-5 w-5 flex-shrink-0 ${item.iconColor}`} />
              <div>
                <p className={`font-semibold text-sm transition-colors ${item.hoverTextClass}`}>{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={config.finalCtaSectionClassName}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">{config.finalCtaTitle}</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">{config.finalCtaDescription}</p>
          <Link href={`/pretraga?city=${encodeURIComponent(config.searchCity)}`}>
            <Button size="lg" className={config.finalCtaButtonClassName}>
              {config.finalCtaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

export const defaultWhyCards = {
  verifiedProfiles: {
    icon: Shield,
    title: 'Clearer Profiles',
    desc: 'Profiles show key details, services and reviews so you can better assess who you are contacting.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  clearArrangements: {
    icon: Heart,
    title: 'Clearer Arrangements',
    desc: 'Profile, reviews and service details are all in one place so you can send the right inquiry more easily.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
  quickFirstStep: {
    icon: Clock,
    title: 'Quick First Step',
    desc: 'Find a sitter and send an inquiry in just a few minutes, without unnecessary browsing.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
  },
  foundedInRijeka: {
    icon: Heart,
    title: 'Founded in Rijeka',
    desc: 'PetPark was founded in Rijeka. We know the city, the community and the needs of local pet owners.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
  supportMonSat: {
    icon: Clock,
    title: 'Support Mon–Sat',
    desc: 'Our support team is available Mon–Sat from 8 AM to 8 PM. We are here when you need help.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
  },
  securePlatform: {
    icon: Heart,
    title: 'Secure Platform',
    desc: 'All bookings go through the platform — transparent payment and communication in one place.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
  localSitters: {
    icon: Clock,
    title: 'Local Sitters',
    desc: 'Sitters from your neighborhood who know the city, local parks and everyday routines.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
  },
};

export const defaultCrossLinkIcons = {
  city: MapPin,
  grooming: Scissors,
  training: GraduationCap,
};
