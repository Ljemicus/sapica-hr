import { LostPetsContent } from './lost-pets-content';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';

export type LostPetsPageLocale = 'hr' | 'en';

const LOST_PETS_COPY = {
  hr: {
    breadcrumbLabel: 'Izgubljeni ljubimci',
    jsonLdName: 'Izgubljeni ljubimci',
    jsonLdDescription: 'Pomozite pronaći izgubljene ljubimce u Hrvatskoj. Prijavite nestanak, pretražite oglase i podijelite — svako dijeljenje pomaže.',
    pathname: '/izgubljeni',
  },
  en: {
    breadcrumbLabel: 'Lost pets',
    jsonLdName: 'Lost pets',
    jsonLdDescription: 'Help find lost pets in Croatia. Report a missing pet, browse active notices and share them quickly — every share helps.',
    pathname: '/izgubljeni/en',
  },
} as const;

interface LostPetsPageShellProps {
  locale: LostPetsPageLocale;
}

export function LostPetsPageShell({ locale }: LostPetsPageShellProps) {
  const copy = LOST_PETS_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Lost Pets"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
    >
      <LostPetsContent forcedLanguage={locale} />
    </DiscoveryPageShell>
  );
}
