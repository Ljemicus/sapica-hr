import { SearchContent } from './search-content';
import { ServiceHubOverview } from '@/components/shared/petpark/service-hub-overview';
import { type InternalLinkItem } from '@/components/shared/internal-link-section';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { getUnifiedProviders, normalizeProviderSearchParams } from '@/lib/search/providers';

export type SearchPageLocale = 'hr' | 'en';

export const SEARCH_PAGE_COPY = {
  hr: {
    title: 'Pronađite sittere i usluge za ljubimce u svom gradu',
    description: 'Pretražite sittere, groomere i trenere za svog ljubimca. Filtrirajte po gradu, usluzi, cijeni i ocjeni.',
    keywords: ['pet sitter', 'groomer', 'trener pasa', 'pretraga', 'čuvanje ljubimaca'],
    openGraphTitle: 'Pronađite sittere i usluge za ljubimce | PetPark',
    openGraphDescription: 'Pretražite sittere, groomere i trenere za svog ljubimca u Hrvatskoj.',
    jsonLdName: 'PetPark pretraga usluga za ljubimce',
    jsonLdDescription: 'Pretražite sittere, groomere i trenere za svog ljubimca u Hrvatskoj.',
    breadcrumbLabel: 'Pretraga',
    loadingLabel: 'Učitavanje...',
    internalLinksEyebrow: 'Popularne rute',
    internalLinksTitle: 'Ako niste našli odmah što tražite',
    internalLinksDescription: 'Ako želite krenuti od grada ili vrste usluge, ove rute vode na lokalizirane vodiče i korisne stranice za usporedbu.',
    internalLinksCta: 'Otvori',
  },
  en: {
    title: 'Find sitters and pet services in your city',
    description: 'Browse sitters, groomers, and dog trainers. Filter by city, service, price, and rating.',
    keywords: ['pet sitter croatia', 'pet grooming croatia', 'dog trainer croatia', 'pet services search', 'petpark search'],
    openGraphTitle: 'Find sitters and pet services | PetPark',
    openGraphDescription: 'Browse sitters, groomers, and dog trainers across Croatia.',
    jsonLdName: 'PetPark pet services search',
    jsonLdDescription: 'Browse sitters, groomers, and dog trainers across Croatia.',
    breadcrumbLabel: 'Search',
    loadingLabel: 'Loading...',
    internalLinksEyebrow: 'Popular routes',
    internalLinksTitle: 'If you did not find the right match right away',
    internalLinksDescription: 'If you want to start from a city or service type, these routes lead to localized guides and useful comparison pages.',
    internalLinksCta: 'Open',
  },
} as const;

export function getSearchPagePath(locale: SearchPageLocale) {
  return locale === 'en' ? '/pretraga/en' : '/pretraga';
}

export function getLocalizedDiscoveryLinks(locale: SearchPageLocale): InternalLinkItem[] {
  if (locale === 'hr') {
    return [
      { href: '/cuvanje-pasa-zagreb', title: 'Čuvanje pasa Zagreb', description: 'Lokalni vodič i ponuda čuvanja pasa u Zagrebu.', badge: 'Grad' },
      { href: '/cuvanje-pasa-split', title: 'Čuvanje pasa Split', description: 'Praktični vodič za čuvanje pasa u Splitu.', badge: 'Grad' },
      { href: '/cuvanje-pasa-rijeka', title: 'Čuvanje pasa Rijeka', description: 'Lokalni vodič za čuvanje ljubimaca u Rijeci.', badge: 'Grad' },
      { href: '/grooming-zagreb', title: 'Grooming Zagreb', description: 'Saloni, cijene i korisne informacije za Zagreb.', badge: 'Landing' },
      { href: '/veterinari', title: 'Veterinari u Hrvatskoj', description: 'Registar veterinarskih stanica i ambulanti.', badge: 'Direktorij' },
      { href: '/dog-friendly', title: 'Dog-friendly lokacije', description: 'Kafići, parkovi i druge lokacije vrijedne spremanja.', badge: 'Lifestyle' },
    ];
  }

  return [
    { href: '/cuvanje-pasa-zagreb/en', title: 'Dog sitting in Zagreb', description: 'Neighborhood-specific context, practical tips, and local dog sitting options in Zagreb.', badge: 'City page' },
    { href: '/cuvanje-pasa-split/en', title: 'Dog sitting in Split', description: 'A practical guide for pet owners looking for care in Split and nearby areas.', badge: 'City page' },
    { href: '/cuvanje-pasa-rijeka/en', title: 'Dog sitting in Rijeka', description: 'Local context and useful information for finding pet care in Rijeka.', badge: 'City page' },
    { href: '/grooming-zagreb/en', title: 'Grooming Zagreb', description: 'Pet grooming salons, pricing, and practical grooming guidance in Zagreb.', badge: 'Landing' },
    { href: '/veterinari/en', title: 'Veterinarians in Croatia', description: 'Directory of veterinary stations and clinics with contact details.', badge: 'Directory' },
    { href: '/dog-friendly/en', title: 'Dog-friendly places', description: 'Cafés, parks, and other dog-friendly places worth bookmarking.', badge: 'Lifestyle' },
  ];
}

interface SearchPageShellProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    service?: string;
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    sort?: string;
  }>;
  locale: SearchPageLocale;
}

export async function SearchPageShell({ searchParams, locale }: SearchPageShellProps) {
  const params = await searchParams;
  const normalizedParams = normalizeProviderSearchParams(params);
  const providers = await getUnifiedProviders(normalizedParams);
  const copy = SEARCH_PAGE_COPY[locale];
  const pathname = getSearchPagePath(locale);

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Pet Sitting"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      internalLinks={{
        eyebrow: copy.internalLinksEyebrow,
        title: copy.internalLinksTitle,
        description: copy.internalLinksDescription,
        items: getLocalizedDiscoveryLinks(locale),
        ctaLabel: copy.internalLinksCta,
      }}
    >
      {locale === 'hr' ? <ServiceHubOverview mode="production" /> : null}
      <SearchContent
        providers={providers}
        initialParams={params}
        forcedLanguage={locale}
        showEditorialHero={locale !== 'hr'}
        resultsAnchorId="rezultati"
      />
    </DiscoveryPageShell>
  );
}
