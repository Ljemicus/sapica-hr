import type { Metadata } from 'next';
import { getGroomers } from '@/lib/db/extensions';
import { GroomingContent } from './grooming-content';
import type { GroomingServiceType } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Grooming — saloni za uljepšavanje ljubimaca',
  description: 'Pronađite profesionalne groomere za šišanje, kupanje, trimanje i njegu noktiju vašeg ljubimca u Hrvatskoj.',
  keywords: ['grooming', 'groomer', 'šišanje pasa', 'kupanje pasa', 'salon za pse'],
  openGraph: {
    title: 'Grooming — saloni za uljepšavanje ljubimaca | PetPark',
    description: 'Pronađite profesionalne groomere za šišanje, kupanje i njegu vašeg ljubimca.',
    url: 'https://petpark.hr/grooming',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/grooming' },
};

interface GroomingPageProps {
  searchParams: Promise<{ city?: string; service?: string }>;
}

export default async function GroomingPage({ searchParams }: GroomingPageProps) {
  const params = await searchParams;
  const groomers = await getGroomers({ city: params.city, service: params.service as GroomingServiceType | undefined });

  return <GroomingContent groomers={groomers} initialParams={params} />;
}
