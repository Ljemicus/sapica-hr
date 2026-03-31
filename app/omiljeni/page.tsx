import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getSitters } from '@/lib/db';
import { OmiljeniContent } from './omiljeni-content';

export const metadata: Metadata = {
  title: 'Omiljeni sitteri',
  description: 'Vaši omiljeni sitteri na jednom mjestu.',
};

export default async function OmiljeniPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fomiljeni');

  const sitters = await getSitters();
  return <OmiljeniContent sitters={sitters} />;
}
