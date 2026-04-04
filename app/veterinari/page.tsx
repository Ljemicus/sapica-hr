import type { Metadata } from 'next';
import { VeterinariContent } from './veterinari-content';
import { getVeterinarians } from '@/lib/db/veterinarians';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Veterinarske stanice i ambulante u Hrvatskoj',
  description: 'Službeni registar veterinarskih stanica i ambulanti u Hrvatskoj s adresama i kontakt podacima.',
  keywords: ['veterinar', 'veterinarska stanica', 'veterinarska ambulanta', 'veterinari hrvatska', 'petpark veterinari'],
  openGraph: {
    title: 'Veterinarske stanice i ambulante u Hrvatskoj | PetPark',
    description: 'Službeni registar veterinarskih stanica i ambulanti u Hrvatskoj s adresama i kontakt podacima.',
    type: 'website',
    ...buildLocaleOpenGraph('/veterinari'),
  },
  alternates: buildLocaleAlternates('/veterinari'),
};

export default async function VeterinariPage() {
  const veterinarians = await getVeterinarians();

  return <VeterinariContent veterinarians={veterinarians} />;
}
