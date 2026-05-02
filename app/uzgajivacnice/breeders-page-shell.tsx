import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { BreedersContent } from './breeders-content';
import { getBreeders } from '@/lib/db/breeders';

export type BreedersPageLocale = 'hr' | 'en';

const BREEDERS_COPY = {
  hr: {
    breadcrumbLabel: 'Uzgajivači',
    jsonLdName: 'Uzgajivači',
    jsonLdDescription: 'Pronađite profile uzgajivača pasa i mačaka u Hrvatskoj.',
    pathname: '/uzgajivacnice',
  },
  en: {
    breadcrumbLabel: 'Breeders',
    jsonLdName: 'Breeders',
    jsonLdDescription: 'Find dog and cat breeder profiles in Croatia.',
    pathname: '/uzgajivacnice/en',
  },
} as const;

interface BreedersPageShellProps {
  locale: BreedersPageLocale;
  params: { species?: string; city?: string; breed?: string; sort?: string };
}

export async function BreedersPageShell({ locale, params }: BreedersPageShellProps) {
  const breeders = await getBreeders(params);
  const copy = BREEDERS_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Pet Breeder"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Varaždin']}
    >
      <BreedersContent breeders={breeders} initialParams={params} forcedLanguage={locale === 'en' ? 'en' : undefined} />
    </DiscoveryPageShell>
  );
}
