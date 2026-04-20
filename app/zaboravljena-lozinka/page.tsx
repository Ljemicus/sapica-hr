import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Zaboravljena lozinka',
  description: 'Zatražite poveznicu za resetiranje lozinke',
  alternates: { canonical: 'https://petpark.hr/zaboravljena-lozinka' },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
