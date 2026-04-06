import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { MarketingDashboard } from './marketing-dashboard';

export const metadata: Metadata = {
  title: 'Email Marketing | Admin',
  description: 'Upravljanje email kampanjama i marketingom',
};

export default async function MarketingAdminPage() {
  const user = await getAuthUser();
  
  if (!user) {
    redirect('/prijava?redirect=%2Fadmin%2Fmarketing');
  }
  
  if (user.role !== 'admin') {
    redirect('/');
  }

  return <MarketingDashboard />;
}
