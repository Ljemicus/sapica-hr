import { getActiveAdoptionListings } from '@/lib/db/adoption-listings';
import { AdoptionBrowseContent } from './adoption-browse-content';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';

export type AdoptionPageLocale = 'hr' | 'en';

const ADOPTION_COPY = {
  hr: {
    breadcrumbLabel: 'Udomljavanje',
    jsonLdName: 'Udomljavanje',
    jsonLdDescription: 'Pregledajte pse, mačke i druge životinje za udomljavanje diljem Hrvatske. Prvo upoznajte ljubimca, a zatim udrugu koja o njemu brine.',
    pathname: '/udomljavanje',
  },
  en: {
    breadcrumbLabel: 'Adoption',
    jsonLdName: 'Adoption',
    jsonLdDescription: 'Browse dogs, cats and other pets available for adoption across Croatia. Meet the pet first, then learn about the rescue caring for them.',
    pathname: '/udomljavanje/en',
  },
} as const;

interface AdoptionPageShellProps {
  locale: AdoptionPageLocale;
}

export async function AdoptionPageShell({ locale }: AdoptionPageShellProps) {
  const listings = await getActiveAdoptionListings();
  const copy = ADOPTION_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Pet Adoption"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
    >
      <AdoptionBrowseContent listings={listings} forcedLanguage={locale} />
    </DiscoveryPageShell>
  );
}
