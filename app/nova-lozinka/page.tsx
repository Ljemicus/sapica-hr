import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Nova lozinka',
  description: 'Postavite novu lozinku za svoj PetPark račun',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
