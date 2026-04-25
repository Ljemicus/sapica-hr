import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Profil udruge uskoro | PetPark' },
  description: 'Profil udruge je privremeno skriven dok ne potvrdimo javne podatke.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Profil udruge uskoro" description="Profil udruge je privremeno skriven dok ne potvrdimo javne podatke." />;
}
