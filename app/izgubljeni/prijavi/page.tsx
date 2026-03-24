import type { Metadata } from 'next';
import { ReportLostPetContent } from './report-content';

export const metadata: Metadata = {
  title: 'Prijavi nestanak ljubimca',
  description: 'Prijavite nestanak vašeg ljubimca i pokrenite potragu. Zajednica će pomoći!',
};

export default function ReportLostPetPage() {
  return <ReportLostPetContent />;
}
