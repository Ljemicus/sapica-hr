import { getDogFriendlyLocations } from '@/lib/db/dog-friendly';
import { DogFriendlyContent } from './dog-friendly-content';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';

export type DogFriendlyPageLocale = 'hr' | 'en';

const DOG_FRIENDLY_COPY = {
  hr: {
    breadcrumbLabel: 'Dog-friendly',
    jsonLdName: 'Dog-Friendly lokacije u Hrvatskoj',
    jsonLdDescription: 'Pronađite dog-friendly kafiće, restorane, plaže, parkove i hotele diljem Hrvatske.',
    pathname: '/dog-friendly',
  },
  en: {
    breadcrumbLabel: 'Dog-friendly',
    jsonLdName: 'Dog-friendly places in Croatia',
    jsonLdDescription: 'Find dog-friendly cafés, restaurants, beaches, parks and hotels across Croatia.',
    pathname: '/dog-friendly/en',
  },
} as const;

interface DogFriendlyPageShellProps {
  locale: DogFriendlyPageLocale;
}

export async function DogFriendlyPageShell({ locale }: DogFriendlyPageShellProps) {
  const locations = await getDogFriendlyLocations();
  const copy = DOG_FRIENDLY_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Dog Friendly Places"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
    >
      <DogFriendlyContent locations={locations} forcedLanguage={locale} />
    </DiscoveryPageShell>
  );
}
