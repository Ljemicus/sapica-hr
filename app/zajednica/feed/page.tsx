import { SocialFeedContent } from '@/components/social/social-feed-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zajednica | PetPark',
  description: 'Pridružite se zajednici ljubitelja životinja. Dijelite fotografije, sudjelujte u izazovima i pronađite nove prijatelje za svog ljubimca.',
};

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <SocialFeedContent />
    </div>
  );
}
