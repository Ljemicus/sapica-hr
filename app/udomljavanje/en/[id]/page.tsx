import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Adoption listing coming soon | PetPark' },
  description: 'Adoption listings are temporarily hidden until the inventory is verified.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Adoption listing coming soon" description="Adoption listings are temporarily hidden until the inventory is verified." />;
}
