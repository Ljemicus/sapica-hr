import { redirect } from 'next/navigation';

/**
 * Legacy sitter onboarding wizard — replaced by the unified provider
 * onboarding flow at /onboarding/provider which includes admin review,
 * Stripe Connect, and draft-save support.
 */
export default function SitterOnboardingPage() {
  redirect('/onboarding/provider?source=sitter-dashboard');
}
