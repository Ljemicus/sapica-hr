import type { Metadata } from 'next';
import { getGroomers } from '@/lib/mock-data';
import { GroomingContent } from './grooming-content';

export const metadata: Metadata = {
  title: 'Grooming — saloni za uljepšavanje ljubimaca',
  description: 'Pronađite profesionalne groomere za šišanje, kupanje, trimanje i spa tretmane vašeg ljubimca.',
};

interface GroomingPageProps {
  searchParams: Promise<{ city?: string; service?: string }>;
}

export default async function GroomingPage({ searchParams }: GroomingPageProps) {
  const params = await searchParams;
  const groomers = getGroomers({ city: params.city, service: params.service });

  return <GroomingContent groomers={groomers} initialParams={params} />;
}
