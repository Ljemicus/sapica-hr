import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type Article, type BlogCategory } from '@/lib/types';

interface BlogContentProps {
  articles: Article[];
  initialCategory?: string;
}

export function BlogContent({ articles, initialCategory = '' }: BlogContentProps) {
  const currentCategory = initialCategory;
  const categories = Object.entries(BLOG_CATEGORY_LABELS) as [BlogCategory, string][];
  const filteredArticles = currentCategory
    ? articles.filter((article) => article.category === currentCategory)
    : articles;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-8 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-kicker">Blog</p>
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 md:mb-6 font-[var(--font-heading)] leading-[1.08]">
              Savjeti za vlasnike
            </h1>
            <p className="hidden md:block text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Korisni članci o zdravlju, prehrani, školovanju pasa i svemu što vaš ljubimac treba
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-8 md:py-12">
        <div className="hidden md:flex flex-wrap justify-center gap-2 mb-8 md:mb-10">
          <Link prefetch={false} href="/blog" className={`filter-pill ${!currentCategory ? 'bg-warm-orange text-white' : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'}`}>
            Sve
          </Link>
          {categories.map(([key, label]) => (
            <Link prefetch={false} key={key} href={`/blog?category=${key}`} className={`filter-pill ${currentCategory === key ? 'bg-warm-orange text-white' : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'}`}>
              {BLOG_CATEGORY_EMOJI[key]} {label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {filteredArticles.map((article) => (
            <Link prefetch={false} key={article.slug} href={`/blog/${article.slug}`}>
              <article className="community-section-card group cursor-pointer overflow-hidden h-full">
                <div className="h-40 md:h-48 bg-gradient-to-br from-warm-peach/30 to-warm-orange/10 flex items-center justify-center relative overflow-hidden">
                  <span className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-300">{article.emoji}</span>
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
                      <span>{article.author}</span>
                      <span>{new Date(article.date).toLocaleDateString('hr-HR')}</span>
                    </div>
                    <span className="text-muted-foreground/40 group-hover:text-warm-orange transition-colors">→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 text-4xl text-muted-foreground/30">📖</div>
            <h3 className="text-lg font-semibold text-muted-foreground">Nema članaka u ovoj kategoriji</h3>
            <Link prefetch={false} href="/blog" className="mt-4 inline-flex rounded-md border px-4 py-2 text-sm font-medium text-warm-orange hover:bg-warm-orange/5">
              Prikaži sve članke
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
