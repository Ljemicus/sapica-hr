import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthPage } from '@/components/shared/petpark/auth-page';

export const metadata: Metadata = {
  title: 'Prijava | PetPark',
  description: 'Prijavite se na svoj PetPark račun',
  alternates: { canonical: 'https://petpark.hr/prijava' },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
