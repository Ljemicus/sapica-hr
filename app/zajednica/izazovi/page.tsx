import { redirect } from 'next/navigation';
import { isFeatureEnabledServer } from '@/lib/feature-flags';

// Challenges page - disabled for initial launch
export default function ChallengesPage() {
  // Check if challenges feature is enabled
  if (!isFeatureEnabledServer('challenges')) {
    redirect('/zajednica');
  }

  // If enabled, this would render the challenges content
  redirect('/zajednica');
}
