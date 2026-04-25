import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Dog-friendly places coming soon | PetPark' },
  description: 'The dog-friendly guide will return once we have real inventory.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Dog-friendly places coming soon" description="The dog-friendly guide will return once we have real inventory." />;
}
