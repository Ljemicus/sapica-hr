import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Adoption coming soon | PetPark' },
  description: 'We will list adoption profiles only when the inventory and rescue partners are properly verified.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Adoption coming soon" description="We will list adoption profiles only when the inventory and rescue partners are properly verified." />;
}
