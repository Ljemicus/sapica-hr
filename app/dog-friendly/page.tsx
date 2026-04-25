import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Dog-friendly mjesta uskoro | PetPark' },
  description: 'Dog-friendly vodič vraćamo kad imamo stvaran inventory, ne prazne landing stranice.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Dog-friendly mjesta uskoro" description="Dog-friendly vodič vraćamo kad imamo stvaran inventory, ne prazne landing stranice." />;
}
