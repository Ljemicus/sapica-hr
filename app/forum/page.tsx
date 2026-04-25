import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Forum uskoro | PetPark' },
  description: 'Forum je privremeno skriven dok backend i moderacija nisu spremni.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Forum uskoro" description="Forum je privremeno skriven dok backend i moderacija nisu spremni." />;
}
