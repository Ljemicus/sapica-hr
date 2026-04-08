import { isFeatureEnabledServer } from '@/lib/feature-flags';
import { redirect } from 'next/navigation';

// Community page - simplified for initial launch
export default function ZajednicaPage() {
  // If social feed is disabled, show coming soon
  if (!isFeatureEnabledServer('socialFeed')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Zajednica uskoro dolazi!</h1>
          <p className="text-gray-600 mb-6">
            Radimo na izgradnji zajednice za sve ljubitelje životinja.
          </p>
          <p className="text-gray-500">
            U međuvremenu, pronađite savršenog čuvara za svog ljubimca.
          </p>
        </div>
      </div>
    );
  }

  // If enabled, redirect to full social feed
  redirect('/zajednica/feed');
}
