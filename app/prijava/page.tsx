import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Prijava',
  description: 'Prijavite se na svoj PetPark račun',
  alternates: { canonical: 'https://petpark.hr/prijava' },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
