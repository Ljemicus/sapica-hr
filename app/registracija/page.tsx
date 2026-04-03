import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Registracija',
  description: 'Kreirajte svoj PetPark račun',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
