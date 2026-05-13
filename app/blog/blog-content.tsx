'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Mail, Search, Sparkles, UsersRound } from 'lucide-react';
import { BLOG_CATEGORY_EMOJI, BLOG_CATEGORY_LABELS, type Article, type BlogCategory } from '@/lib/types';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

interface BlogContentProps {
  articles: Article[];
  initialCategory?: string;
}

const categoryTabs: Array<{ label: string; value: '' | BlogCategory; aliases?: BlogCategory[] }> = [
  { label: 'Svi', value: '' },
  { label: 'Savjeti', value: 'psi', aliases: ['psi', 'macke', 'zabava'] },
  { label: 'Zdravlje', value: 'zdravlje' },
  { label: 'Obuka', value: 'dresura' },
  { label: 'Prehrana', value: 'prehrana' },
  { label: 'Putovanja', value: 'putovanje' },
];

function readingTime(article: Article) {
  const words = `${article.title} ${article.excerpt} ${article.body || ''}`.split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 180))} min čitanja`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
}

function ArticleVisual({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden border-b border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-sage-surface)]', large ? 'min-h-[300px]' : 'h-56')}>
      <span className={cn('transition duration-500 group-hover:scale-110', large ? 'text-9xl' : 'text-7xl')} aria-hidden>{article.emoji}</span>
      <PawDecoration className="right-5 top-5 size-12 opacity-70" />
      <Badge variant="orange" className="absolute left-4 top-4">
        {BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}
      </Badge>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="28" interactive className="h-full overflow-hidden">
        <ArticleVisual article={article} />
        <div className="p-5">
          <h2 className="line-clamp-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{article.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{article.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-black text-[color:var(--pp-color-muted-text)]">
            <span>{readingTime(article)}</span>
            <span>·</span>
            <span>{formatDate(article.date)}</span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[color:var(--pp-color-warm-border)] pt-4">
            <span className="text-sm font-black text-[color:var(--pp-color-orange-primary)]">Pogledaj članak</span>
            <ArrowRight className="size-4 text-[color:var(--pp-color-orange-primary)] transition group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function BlogContent({ articles, initialCategory }: BlogContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const currentCategory = (searchParams.get('category') || initialCategory || '') as '' | BlogCategory;

  const filteredArticles = useMemo(() => {
    const activeTab = categoryTabs.find((tab) => tab.value === currentCategory || tab.aliases?.includes(currentCategory as BlogCategory));
    const allowed = activeTab?.aliases || (currentCategory ? [currentCategory] : []);
    const q = query.toLowerCase().trim();

    return articles.filter((article) => {
      if (allowed.length && !allowed.includes(article.category)) return false;
      if (q && !`${article.title} ${article.excerpt} ${article.author}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, currentCategory, query]);

  const featuredArticle = filteredArticles[0] || articles[0];
  const remainingArticles = featuredArticle ? filteredArticles.filter((article) => article.slug !== featuredArticle.slug) : [];
  const popularArticles = articles.slice(0, 4);

  return (
    <main data-petpark-route="blog" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[760px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[400px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" shadow="small" className="relative overflow-hidden p-6 sm:p-8 lg:p-9">
            <div className="absolute right-8 top-8 hidden size-28 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
            <div className="relative grid gap-7 xl:grid-cols-[1fr_460px] xl:items-end">
              <div>
                <Badge variant="orange"><BookOpen className="size-3" /> PetPark magazin</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl lg:text-7xl">PetPark savjeti</h1>
                <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                  Praktični vodiči o zdravlju, prehrani, treningu, putovanjima i svakodnevici s ljubimcima.
                </p>
              </div>
              <Card radius="28" tone="cream" className="p-4 sm:p-5">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <Input placeholder="Pretraži savjete..." value={query} onChange={(event) => setQuery(event.target.value)} className="pl-12" />
                </label>
              </Card>
            </div>
          </Card>

          <Card radius="24" className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categoryTabs.map((tab) => {
                const active = tab.value === currentCategory || Boolean(tab.aliases?.includes(currentCategory as BlogCategory)) || (!tab.value && !currentCategory);
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => router.push(tab.value ? `/blog?category=${tab.value}` : '/blog')}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-[var(--pp-radius-control)] px-4 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
                      active ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]' : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {featuredArticle ? (
            <Link href={`/blog/${featuredArticle.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
              <Card radius="28" interactive className="overflow-hidden xl:grid xl:grid-cols-[0.9fr_1.1fr]">
                <ArticleVisual article={featuredArticle} large />
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <Badge variant="teal"><Sparkles className="size-3" /> Istaknuti članak</Badge>
                  <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)] sm:text-5xl">{featuredArticle.title}</h2>
                  <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">{featuredArticle.excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-black text-[color:var(--pp-color-muted-text)]">
                    <span>{featuredArticle.author}</span>
                    <span>·</span>
                    <span>{readingTime(featuredArticle)}</span>
                    <span>·</span>
                    <span>{formatDate(featuredArticle.date)}</span>
                  </div>
                  <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-orange-primary)] px-5 py-3 text-sm font-black text-white shadow-[var(--pp-shadow-button-glow)]">Pogledaj članak <ArrowRight className="size-4" /></span>
                </div>
              </Card>
            </Link>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Najnovije</p>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Članci i vodiči</h2>
              </div>

              {filteredArticles.length ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {remainingArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}
                  {!remainingArticles.length && featuredArticle ? <ArticleCard article={featuredArticle} /> : null}
                </div>
              ) : (
                <Card radius="28" tone="sage" className="p-10 text-center">
                  <BookOpen className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" />
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Nema članaka u ovoj kategoriji.</h2>
                  <Button className="mt-6" variant="secondary" onClick={() => router.push('/blog')}>Prikaži sve članke</Button>
                </Card>
              )}
            </section>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <Card radius="28" tone="cream" className="p-6">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><Sparkles className="size-5 text-[color:var(--pp-color-orange-primary)]" /> Popularni članci</h2>
                <div className="mt-4 space-y-3">
                  {popularArticles.map((article) => (
                    <Link key={article.slug} href={`/blog/${article.slug}`} className="block rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] p-4 text-sm font-black leading-5 text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] transition hover:text-[color:var(--pp-color-orange-primary)]">
                      {article.emoji} {article.title}
                    </Link>
                  ))}
                </div>
              </Card>

              <Card radius="28" tone="sage" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><Mail className="size-5 text-[color:var(--pp-color-teal-accent)]" /> Newsletter</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Uskoro: tjedni PetPark savjeti bez spama i bez vanjskog slanja u ovom prolazu.</p>
                <Input disabled placeholder="email@primjer.com" className="mt-4" />
                <Button disabled className="mt-3 w-full">Prijavi me</Button>
              </Card>

              <Card radius="28" tone="orange" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><UsersRound className="size-5 text-[color:var(--pp-color-orange-primary)]" /> Zajednica</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Imaš pitanje nakon članka? Pitaj vlasnike i providere u zajednici.</p>
                <ButtonLink href="/zajednica" className="mt-5 w-full" variant="secondary">Otvori zajednicu</ButtonLink>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
