import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Veterinari uskoro | PetPark' },
  description: 'Veterinarski directory ćemo otvoriti kad postoji realan i provjeren content pipeline.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Veterinari uskoro" description="Veterinarski directory ćemo otvoriti kad postoji realan i provjeren content pipeline." />;
}
