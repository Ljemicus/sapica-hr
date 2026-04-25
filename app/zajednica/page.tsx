import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Zajednica uskoro | PetPark' },
  description: 'Zajednicu vraćamo kad social backend i moderacija budu spremni.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Zajednica uskoro" description="Zajednicu vraćamo kad social backend i moderacija budu spremni." />;
}
