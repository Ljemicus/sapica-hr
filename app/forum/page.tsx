import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { LanguageGate } from '@/components/shared/language-gate';
import { getTopics, getTrendingTopics } from '@/lib/db/content';
import { SEARCH_DISCOVERY_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { ForumContent } from './forum-content';

export function buildForumMetadata(locale: 'hr' | 'en'): Metadata {
  const isEn = locale === 'en';
  const pathname = isEn ? '/forum/en' : '/forum';

  return {
    title: isEn ? 'Pet community forum' : 'Forum za ljubitelje životinja',
    description: isEn
      ? 'Questions, advice, stories, and conversations from the PetPark community. Browse the forum interface in English; topics stay in their original language.'
      : 'Pitanja, savjeti, priče i razgovori zajednice ljubitelja životinja. Pridružite se diskusiji na PetPark forumu!',
    keywords: isEn
      ? ['pet forum croatia', 'pet community forum', 'dog questions', 'cat advice', 'petpark forum']
      : ['forum ljubimci', 'pitanja o psima', 'savjeti za mačke', 'zajednica ljubitelja životinja'],
    openGraph: {
      title: isEn ? 'Pet community forum | PetPark' : 'Forum za ljubitelje životinja | PetPark',
      description: isEn
        ? 'Questions, advice, and community stories for pet owners. Interface available in English; user topics remain in their original language.'
        : 'Pitanja, savjeti i razgovori zajednice ljubitelja životinja. Pridružite se!',
      type: 'website',
      ...buildLocaleOpenGraph(pathname),
    },
    alternates: buildLocaleAlternates(pathname),
  };
}

export const metadata: Metadata = buildForumMetadata('hr');

export default async function ForumPage() {
  const topics = await getTopics();
  const trending = await getTrendingTopics();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50 dark:from-teal-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up rounded-full font-semibold">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Forum
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              <LanguageGate hr={<>Zajednica <span className="text-gradient">ljubitelja životinja</span></>} en={<>A community of <span className="text-gradient">animal lovers</span></>} />
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              <LanguageGate hr={<>Postavite pitanje, podijelite savjet ili ispričajte priču. Ovdje smo jedni za druge — i za naše ljubimce.</>} en={<>Ask a question, share advice, or tell a story. We’re here for each other — and for our pets.</>} />
            </p>
          </div>
        </div>
      </section>

      <ForumContent initialTopics={topics} initialTrending={trending} />

      <InternalLinkSection
        eyebrow="Treba vam više od rasprave?"
        title="Prijeđite s foruma na konkretnu pomoć"
        description="Pronađite usluge, lokacije i vodiče koji vam mogu pomoći."
        items={[
          ...SEARCH_DISCOVERY_LINKS.slice(0, 4),
          ...CONTENT_DISCOVERY_LINKS,
        ]}
      />
    </div>
  );
}
