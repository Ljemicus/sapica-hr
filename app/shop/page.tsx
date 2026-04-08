import { redirect } from 'next/navigation';
import { isFeatureEnabledServer } from '@/lib/feature-flags';

// Shop page - disabled for initial launch
export default function ShopPage() {
  // Check if shop feature is enabled
  if (!isFeatureEnabledServer('shop')) {
    redirect('/');
  }

  // If enabled, this would render the shop content
  // For now, we redirect
  redirect('/');
}
