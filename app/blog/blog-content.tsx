'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Calendar, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type Article, type BlogCategory } from '@/lib/types';

interface BlogContentProps {
  articles: Article[];
  initialCategory?: string;
}

export function BlogContent({ articles, initialCategory }: BlogContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use URL param as source of truth, fallback to prop
  const currentCategory = searchParams.get('category') || initialCategory || '';
  
  const categories = Object.entries(BLOG_CATEGORY_LABELS) as [BlogCategory, string][];
  
  // Filter articles client-side based on URL category
  const filteredArticles = useMemo(() => {
    if (!currentCategory) return articles;
    return articles.filter((a) => a.category === currentCategory);
  }, [articles, currentCategory]);

  const featuredArticle = filteredArticles[0];
  const remainingArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      {/* Editorial Hero */}
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-warm-orange/10 blur-3xl" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">PetPark magazin</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] leading-[1.05]">
              Savjeti koji vlasnicima stvarno štede vrijeme
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Zdravlje, prehrana, dresura, putovanja i male svakodnevne odluke — složeno kao čitljiv vodič, ne kao arhiva linkova.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12">

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => router.push('/blog')}
          className={`filter-pill ${!currentCategory ? 'bg-warm-orange text-white' : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'}`}
        >
          Sve
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => router.push(`/blog?category=${key}`)}
            className={`filter-pill ${currentCategory === key ? 'bg-warm-orange text-white' : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'}`}
          >
            {BLOG_CATEGORY_EMOJI[key]} {label}
          </button>
        ))}
      </div>

      {/* Featured + Articles grid */}
      {featuredArticle && (
        <Link href={`/blog/${featuredArticle.slug}`} className="group mb-8 block max-w-6xl mx-auto">
          <article className="community-section-card overflow-hidden md:grid md:grid-cols-[0.9fr_1.1fr] animate-fade-in-up">
            <div className="min-h-64 bg-gradient-to-br from-warm-orange/20 via-warm-peach/30 to-warm-teal/15 flex items-center justify-center relative overflow-hidden">
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-warm-orange shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Istaknuto
              </div>
              <span className="text-8xl md:text-9xl transition-transform duration-500 group-hover:scale-110">{featuredArticle.emoji}</span>
            </div>
            <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              <Badge className="mb-5 w-fit bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/10 border-0">
                {BLOG_CATEGORY_EMOJI[featuredArticle.category]} {BLOG_CATEGORY_LABELS[featuredArticle.category]}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] tracking-tight leading-tight group-hover:text-warm-orange transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-lg line-clamp-3">{featuredArticle.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{featuredArticle.author}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(featuredArticle.date).toLocaleDateString('hr-HR')}</span>
                <span className="ml-auto inline-flex items-center gap-2 font-semibold text-warm-orange">Čitaj članak <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </div>
          </article>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {remainingArticles.map((article, i) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <article
              className="community-section-card group cursor-pointer overflow-hidden h-full animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="h-48 bg-gradient-to-br from-warm-peach/30 to-warm-orange/10 flex items-center justify-center relative overflow-hidden">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{article.emoji}</span>
                <Badge className="absolute top-4 left-4 bg-white/90 dark:bg-card/90 text-warm-orange text-xs shadow-sm border-0">
                  {BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}
                </Badge>
              </div>
              <div className="p-5 space-y-3">
                <h2 className="font-semibold text-lg group-hover:text-warm-orange transition-colors line-clamp-2 font-[var(--font-heading)]">
                  {article.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border/30 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.date).toLocaleDateString('hr-HR')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-warm-orange group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Nema članaka u ovoj kategoriji</h3>
          <Button variant="outline" className="mt-4 border-warm-orange/30 text-warm-orange hover:bg-warm-orange/5" onClick={() => router.push('/blog')}>
            Prikaži sve članke
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
