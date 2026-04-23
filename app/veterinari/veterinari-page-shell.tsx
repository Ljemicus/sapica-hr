import { VeterinariContent } from './veterinari-content';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { getVeterinarians } from '@/lib/db/veterinarians';

export type VeterinariPageLocale = 'hr' | 'en';

const VETERINARI_COPY = {
  hr: {
    breadcrumbLabel: 'Veterinari',
    jsonLdName: 'Veterinarske stanice i ambulante u Hrvatskoj',
    jsonLdDescription: 'Službeni registar veterinarskih stanica i ambulanti u Hrvatskoj s adresama i kontakt podacima.',
    pathname: '/veterinari',
  },
  en: {
    breadcrumbLabel: 'Veterinarians',
    jsonLdName: 'Veterinary stations and clinics in Croatia',
    jsonLdDescription: 'Official directory of veterinary stations and clinics in Croatia with addresses and contact details.',
    pathname: '/veterinari/en',
  },
} as const;

interface VeterinariPageShellProps {
  locale: VeterinariPageLocale;
}

export async function VeterinariPageShell({ locale }: VeterinariPageShellProps) {
  const veterinarians = await getVeterinarians();
  const copy = VETERINARI_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Veterinary Directory"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
    >
      <VeterinariContent veterinarians={veterinarians} forcedLanguage={locale} />
    </DiscoveryPageShell>
  );
}
