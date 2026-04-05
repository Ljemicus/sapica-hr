import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
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
    <div className="concept-zero">
      {/* Premium editorial hero */}
      <section className="relative overflow-hidden forum-hero-gradient">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.25em] font-semibold text-warm-orange mb-5 animate-fade-in-up flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <LanguageGate hr="Zajednica" en="Community" />
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              <LanguageGate hr={<>Razgovori koji <span className="text-gradient">zbližavaju</span></>} en={<>Conversations that <span className="text-gradient">bring us closer</span></>} />
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-2 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              <LanguageGate hr={<>Pitanja, savjeti, priče i razgovori — jer svaki ljubimac zaslužuje zajednicu iza sebe.</>} en={<>Questions, advice, stories, and conversations — because every pet deserves a community behind them.</>} />
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
