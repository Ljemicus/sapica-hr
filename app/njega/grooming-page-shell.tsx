import { GroomingContent, type PublicGroomingListingItem } from '@/app/grooming/grooming-content';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { getProviderGroomers } from '@/lib/db/provider-groomers';
import type { Groomer, GroomingServiceType } from '@/lib/types';

export type GroomingPageLocale = 'hr' | 'en';

export const GROOMING_PAGE_COPY = {
  hr: {
    breadcrumbLabel: 'Njega ljubimaca',
    jsonLdName: 'Njega ljubimaca',
    jsonLdDescription: 'Pronađite profesionalne groomere za šišanje, kupanje, trimanje i njegu noktiju ljubimaca u Hrvatskoj.',
    pathname: '/njega',
  },
  en: {
    breadcrumbLabel: 'Pet Grooming',
    jsonLdName: 'Pet Grooming',
    jsonLdDescription: 'Find professional groomers for haircuts, bathing, trimming and nail care for your pet in Croatia.',
    pathname: '/njega/en',
  },
} as const;


function toPublicGroomingListingItem(groomer: Groomer): PublicGroomingListingItem {
  return {
    id: groomer.id,
    name: groomer.name,
    city: groomer.city,
    services: groomer.services,
    prices: groomer.prices,
    rating: groomer.review_count > 0 ? groomer.rating : null,
    review_count: groomer.review_count,
    bio: groomer.bio,
    verified: groomer.verified,
    specialization: groomer.specialization,
  };
}

interface GroomingPageShellProps {
  searchParams: Promise<{ city?: string; service?: string }>;
  locale: GroomingPageLocale;
}

export async function GroomingPageShell({ searchParams, locale }: GroomingPageShellProps) {
  const params = await searchParams;
  const groomers = (await getProviderGroomers({ city: params.city, service: params.service as GroomingServiceType | undefined })).map(toPublicGroomingListingItem);
  const copy = GROOMING_PAGE_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Pet Grooming"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
    >
      <GroomingContent groomers={groomers} initialParams={params} forcedLanguage={locale} />
    </DiscoveryPageShell>
  );
}
