'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type Article, type BlogCategory } from '@/lib/types';

interface BlogContentProps {
  articles: Article[];
  initialCategory?: string;
}

export function BlogContent({ articles, initialCategory }: BlogContentProps) {
  const router = useRouter();
  const categories = Object.entries(BLOG_CATEGORY_LABELS) as [BlogCategory, string][];

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Hero */}
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">Blog</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] leading-[1.05]">
              Savjeti za vlasnike
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Korisni članci o zdravlju, prehrani, školovanju pasa i svemu što vaš ljubimac treba
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12">

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => router.push('/blog')}
          className={`filter-pill ${!initialCategory ? 'bg-warm-orange text-white' : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'}`}
        >
          Sve
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => router.push(`/blog?category=${key}`)}
            className={`filter-pill ${initialCategory === key ? 'bg-warm-orange text-white' : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'}`}
          >
            {BLOG_CATEGORY_EMOJI[key]} {label}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {articles.map((article, i) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <div 
              className="community-section-card group cursor-pointer overflow-hidden h-full animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
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
            </div>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
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
