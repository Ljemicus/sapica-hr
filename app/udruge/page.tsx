import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Udruge uskoro | PetPark' },
  description: 'Directory udruga vraćamo kad imamo dovoljno provjerenih organizacija i aktivnih podataka.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Udruge uskoro" description="Directory udruga vraćamo kad imamo dovoljno provjerenih organizacija i aktivnih podataka." />;
}
