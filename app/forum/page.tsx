import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isFeatureEnabledServer } from '@/lib/feature-flags';

export function buildForumMetadata(lang: string = 'hr'): Metadata {
  const titles: Record<string, string> = {
    hr: 'Forum | PetPark Zajednica',
    en: 'Forum | PetPark Community',
  };
  
  const descriptions: Record<string, string> = {
    hr: 'Diskutirajte o ljubimcima, postavljajte pitanja i dijelite iskustva s drugim vlasnicima.',
    en: 'Discuss pets, ask questions, and share experiences with other pet owners.',
  };

  return {
    title: titles[lang] || titles.hr,
    description: descriptions[lang] || descriptions.hr,
  };
}

// Forum page - disabled for initial launch
export default function ForumPage() {
  // Check if forum feature is enabled
  if (!isFeatureEnabledServer('forum')) {
    redirect('/zajednica');
  }

  // If enabled, this would render the forum content
  // For now, we redirect
  redirect('/zajednica');
}
