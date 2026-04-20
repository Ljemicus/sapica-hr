import type { Metadata } from 'next';
import { getActiveRescueAppeals, getRescueOrganizations } from '@/lib/db';
import { RescueOrganizationsContent } from './rescue-organizations-content';
import { ItemListJsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: { absolute: 'Rescue udruge i organizacije | PetPark' },
  description: 'Pregled aktivnih rescue organizacija na PetParku spojen na stvarne podatke iz baze. Pretražuj i filtriraj po gradu i pronađi udrugu za donaciju ili udomljavanje.',
  openGraph: {
    title: 'Rescue udruge i organizacije | PetPark',
    description: 'Pregled aktivnih rescue organizacija na PetParku. Pretražuj i filtriraj po gradu.',
    type: 'website',
    url: '/udruge',
    siteName: 'PetPark',
    locale: 'hr_HR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rescue udruge i organizacije | PetPark',
    description: 'Pregled aktivnih rescue organizacija na PetParku. Pretražuj i filtriraj po gradu.',
  },
  alternates: {
    canonical: `${BASE_URL}/udruge`,
  },
};

export default async function RescueOrganizationsPage() {
  const [organizations, activeAppeals] = await Promise.all([
    getRescueOrganizations('active'),
    getActiveRescueAppeals(),
  ]);

  const jsonLdItems = organizations.map((org) => ({
    name: org.display_name,
    url: `${BASE_URL}/udruge/${org.slug}`,
    description: org.description || `Rescue organizacija ${org.display_name} iz ${org.city || 'Hrvatske'}`,
  }));

  return (
    <>
      <ItemListJsonLd items={jsonLdItems} />
      <Breadcrumbs items={[{ label: 'Udruge', href: '/udruge' }]} />
      <RescueOrganizationsContent 
        organizations={organizations} 
        activeAppeals={activeAppeals} 
      />
    </>
  );
}
