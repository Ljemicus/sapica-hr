import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { VeterinariPageShell } from './veterinari-page-shell';

// ISR: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Veterinarske stanice i ambulante u Hrvatskoj',
  description: 'Pregled veterinarskih stanica i ambulanti u Hrvatskoj s adresama i kontakt podacima.',
  keywords: ['veterinar', 'veterinarska stanica', 'veterinarska ambulanta', 'veterinari hrvatska', 'petpark veterinari'],
  openGraph: {
    title: 'Veterinarske stanice i ambulante u Hrvatskoj | PetPark',
    description: 'Pregled veterinarskih stanica i ambulanti u Hrvatskoj s adresama i kontakt podacima.',
    type: 'website',
    ...buildLocaleOpenGraph('/veterinari'),
  },
  alternates: buildLocaleAlternates('/veterinari'),
};

export default function VeterinariPage() {
  return <VeterinariPageShell locale="hr" />;
}
