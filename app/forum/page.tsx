import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTopics, getTrendingTopics } from '@/lib/db/content';
import { ForumContent } from './forum-content';

export const metadata: Metadata = {
  title: 'Forum za ljubitelje životinja',
  description: 'Pitanja, savjeti, priče i razgovori zajednice ljubitelja životinja. Pridružite se diskusiji na PetPark forumu!',
  keywords: ['forum ljubimci', 'pitanja o psima', 'savjeti za mačke', 'zajednica ljubitelja životinja'],
  openGraph: {
    title: 'Forum za ljubitelje životinja | PetPark',
    description: 'Pitanja, savjeti i razgovori zajednice ljubitelja životinja. Pridružite se!',
    url: 'https://petpark.hr/forum',
    type: 'website',
  },
};

export default async function ForumPage() {
  const topics = await getTopics();
  const trending = await getTrendingTopics();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50 dark:from-teal-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up rounded-full font-semibold">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Forum
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Zajednica{' '}
              <span className="text-gradient">ljubitelja životinja</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              Postavite pitanje, podijelite savjet ili ispričajte priču.
              Ovdje smo jedni za druge — i za naše ljubimce.
            </p>
          </div>
        </div>
      </section>

      <ForumContent initialTopics={topics} initialTrending={trending} />
    </div>
  );
}
