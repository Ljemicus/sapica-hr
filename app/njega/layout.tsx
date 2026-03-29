import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Grooming saloni za pse i mačke',
  description: 'Pronađite profesionalne grooming salone za šišanje, kupanje, trimanje i njegu noktiju vašeg ljubimca u Hrvatskoj.',
  keywords: ['grooming', 'šišanje pasa', 'kupanje pasa', 'trimanje', 'njega ljubimaca', 'grooming salon'],
  openGraph: {
    title: 'Grooming saloni za pse i mačke | PetPark',
    description: 'Pronađite profesionalne grooming salone za šišanje, kupanje i njegu vašeg ljubimca.',
    url: 'https://petpark.hr/njega',
    type: 'website',
  },
  alternates: {
    canonical: 'https://petpark.hr/njega',
  },
};

export default function NjegaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceJsonLd
        name="Grooming saloni"
        description="Pronađite profesionalne grooming salone za šišanje, kupanje, trimanje i njegu noktiju vašeg ljubimca."
        url="https://petpark.hr/njega"
        serviceType="Pet Grooming"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Grooming', href: '/njega' }]} />
      {children}
    </>
  );
}
