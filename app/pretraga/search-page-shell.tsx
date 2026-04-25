import { Suspense } from 'react';
import { SearchStaticContent } from './search-static-content';
import { InternalLinkSection, type InternalLinkItem } from '@/components/shared/internal-link-section';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { getUnifiedProviders } from '@/lib/search/providers';

export type SearchPageLocale = 'hr' | 'en';

export const SEARCH_PAGE_COPY = {
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
    { href: '/veterinari/en', title: 'Veterinarians in Croatia', description: 'Official directory of veterinary stations and clinics with contact details.', badge: 'Directory' },
    { href: '/dog-friendly/en', title: 'Dog-friendly places', description: 'Cafés, parks, and other dog-friendly places worth bookmarking.', badge: 'Lifestyle' },
  ];
}

interface SearchPageShellProps {
  locale: SearchPageLocale;
}

export async function SearchPageShell({ locale }: SearchPageShellProps) {
  const params = {};
  const providers = await getUnifiedProviders({});
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
        className: 'hidden md:block',
      }}
    >
      <Suspense fallback={<div className="container mx-auto px-6 md:px-10 lg:px-16 py-16">{copy.loadingLabel}</div>}>
        <SearchStaticContent providers={providers} />
      </Suspense>
    </DiscoveryPageShell>
  );
}
