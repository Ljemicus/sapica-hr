import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getUnifiedProviders, normalizeProviderSearchParams } from '@/lib/search/providers';
import { SearchContent } from './search-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { InternalLinkSection, type InternalLinkItem } from '@/components/shared/internal-link-section';
import { SEARCH_DISCOVERY_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

type SearchPageLocale = 'hr' | 'en';

const SEARCH_PAGE_COPY = {
  hr: {
    title: 'Pronađite sittere i usluge za ljubimce u svom gradu',
    description: 'Pretražite verificirane sittere, groomere i trenere za svog ljubimca. Filtrirajte po gradu, usluzi, cijeni i ocjeni.',
    keywords: ['pet sitter', 'groomer', 'trener pasa', 'pretraga', 'čuvanje ljubimaca'],
    openGraphTitle: 'Pronađite sittere i usluge za ljubimce | PetPark',
    openGraphDescription: 'Pretražite verificirane sittere, groomere i trenere za svog ljubimca u Hrvatskoj.',
    jsonLdName: 'PetPark pretraga usluga za ljubimce',
    jsonLdDescription: 'Pretražite verificirane sittere, groomere i trenere za svog ljubimca u Hrvatskoj.',
    breadcrumbLabel: 'Pretraga',
    loadingLabel: 'Učitavanje...',
    internalLinksEyebrow: 'Popularne rute',
    internalLinksTitle: 'Ako niste našli odmah što tražite',
    internalLinksDescription: 'Pretraga je hub, ali ove rute daju jače city/service signale i lakši ulaz u sadržajni sloj gdje već postoji konkretna vrijednost.',
    internalLinksCta: 'Otvori',
  },
  en: {
    title: 'Find sitters and pet services in your city',
    description: 'Browse verified sitters, groomers, and dog trainers. Filter by city, service, price, and rating.',
    keywords: ['pet sitter croatia', 'pet grooming croatia', 'dog trainer croatia', 'pet services search', 'petpark search'],
    openGraphTitle: 'Find sitters and pet services | PetPark',
    openGraphDescription: 'Browse verified sitters, groomers, and dog trainers across Croatia.',
    jsonLdName: 'PetPark pet services search',
    jsonLdDescription: 'Browse verified sitters, groomers, and dog trainers across Croatia.',
    breadcrumbLabel: 'Search',
    loadingLabel: 'Loading...',
    internalLinksEyebrow: 'Popular routes',
    internalLinksTitle: 'If you did not find the right match right away',
    internalLinksDescription: 'Search is the hub, but these routes provide stronger city/service signals and an easier entry into richer localized content.',
    internalLinksCta: 'Open',
  },
} as const satisfies Record<SearchPageLocale, {
  title: string;
  description: string;
  keywords: string[];
  openGraphTitle: string;
  openGraphDescription: string;
  jsonLdName: string;
  jsonLdDescription: string;
  breadcrumbLabel: string;
  loadingLabel: string;
  internalLinksEyebrow: string;
  internalLinksTitle: string;
  internalLinksDescription: string;
  internalLinksCta: string;
}>;

function getSearchPagePath(locale: SearchPageLocale) {
  return locale === 'en' ? '/pretraga/en' : '/pretraga';
}

function getLocalizedDiscoveryLinks(locale: SearchPageLocale): InternalLinkItem[] {
  if (locale === 'hr') {
    return [...SEARCH_DISCOVERY_LINKS, ...CONTENT_DISCOVERY_LINKS];
  }

  return [
    {
      href: '/cuvanje-pasa-zagreb/en',
      title: 'Dog sitting in Zagreb',
      description: 'Neighborhood-specific context, practical tips, and local dog sitting options in Zagreb.',
      badge: 'City page',
    },
    {
      href: '/cuvanje-pasa-split/en',
      title: 'Dog sitting in Split',
      description: 'A practical guide for pet owners looking for care in Split and nearby areas.',
      badge: 'City page',
    },
    {
      href: '/cuvanje-pasa-rijeka/en',
      title: 'Dog sitting in Rijeka',
      description: 'Local context and useful information for finding pet care in Rijeka.',
      badge: 'City page',
    },
    {
      href: '/grooming-zagreb/en',
      title: 'Grooming Zagreb',
      description: 'Pet grooming salons, pricing, and practical grooming guidance in Zagreb.',
      badge: 'Landing',
    },
    {
      href: '/veterinari/en',
      title: 'Veterinarians in Croatia',
      description: 'Official directory of veterinary stations and clinics with contact details.',
      badge: 'Directory',
    },
    {
      href: '/dog-friendly/en',
      title: 'Dog-friendly places',
      description: 'Cafés, parks, and other dog-friendly places worth bookmarking.',
      badge: 'Lifestyle',
    },
  ];
}

function buildSearchMetadata(locale: SearchPageLocale): Metadata {
  const copy = SEARCH_PAGE_COPY[locale];
  const pathname = getSearchPagePath(locale);

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    openGraph: {
      title: copy.openGraphTitle,
      description: copy.openGraphDescription,
      type: 'website',
      ...buildLocaleOpenGraph(pathname),
    },
    alternates: buildLocaleAlternates(pathname),
  };
}

// ISR: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export const metadata: Metadata = buildSearchMetadata('hr');

interface SearchPageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    service?: string;
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    sort?: string;
  }>;
}

export async function SearchPageView({ searchParams, locale }: SearchPageProps & { locale: SearchPageLocale }) {
  const params = await searchParams;
  const normalizedParams = normalizeProviderSearchParams(params);
  const providers = await getUnifiedProviders(normalizedParams);
  const copy = SEARCH_PAGE_COPY[locale];
  const pathname = getSearchPagePath(locale);

  return (
    <>
      <ServiceJsonLd
        name={copy.jsonLdName}
        description={copy.jsonLdDescription}
        url={`https://petpark.hr${pathname}`}
        serviceType="Pet Sitting"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: copy.breadcrumbLabel, href: pathname }]} />
      <Suspense fallback={<div className="container mx-auto px-6 md:px-10 lg:px-16 py-16">{copy.loadingLabel}</div>}>
        <SearchContent providers={providers} initialParams={params} forcedLanguage={locale} />
      </Suspense>
      <InternalLinkSection
        eyebrow={copy.internalLinksEyebrow}
        title={copy.internalLinksTitle}
        description={copy.internalLinksDescription}
        items={getLocalizedDiscoveryLinks(locale)}
        ctaLabel={copy.internalLinksCta}
      />
    </>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return <SearchPageView {...props} locale="hr" />;
}

export { buildSearchMetadata };
