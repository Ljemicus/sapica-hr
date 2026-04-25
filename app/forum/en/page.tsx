import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Forum coming soon | PetPark' },
  description: 'The forum is temporarily hidden until backend and moderation are ready.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Forum coming soon" description="The forum is temporarily hidden until backend and moderation are ready." />;
}
