import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Izazovi uskoro | PetPark' },
  description: 'Izazovi se vraćaju kad community modul bude spreman.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Izazovi uskoro" description="Izazovi se vraćaju kad community modul bude spreman." />;
}
