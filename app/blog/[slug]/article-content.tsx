'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  MessageCircle,
  RefreshCcw,
  Share2,
  Sparkles,
  UserRound,
} from 'lucide-react';
import {
  BLOG_CATEGORY_EMOJI,
  BLOG_CATEGORY_LABELS,
  type Article,
  type BlogCategory,
  type BlogComment,
} from '@/lib/types';
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { BlogComments } from './blog-comments';

interface ArticleContentProps {
  article: Article;
  relatedArticles: Article[];
  comments: BlogComment[];
  currentUser: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: 'owner' | 'sitter' | 'admin';
  } | null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[čć]/g, 'c').replace(/[š]/g, 's').replace(/[ž]/g, 'z').replace(/[đ]/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

function readingTime(article: Article) {
  const words = `${article.title} ${article.excerpt} ${article.body || ''}`.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 190));
}

function parseHeadings(body: string) {
  return body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('## ')).map((line) => {
    const text = line.replace(/^##\s+/, '').trim();
    return { text, id: slugify(text) };
  });
}

const CATEGORY_CTA: Record<BlogCategory, { title: string; text: string; primary: { label: string; href: string }; secondary: { label: string; href: string } }> = {
  zdravlje: { title: 'Zdravlje prvo, savjet odmah iza toga.', text: 'Ako članak opisuje simptome koje vidite kod ljubimca, provjerite veterinara ili pitajte zajednicu za iskustva.', primary: { label: 'Pronađi veterinara', href: '/veterinari' }, secondary: { label: 'Pitaj zajednicu', href: '/zajednica' } },
  prehrana: { title: 'Dobra rutina hranjenja počinje malim koracima.', text: 'Usporedite navike, pratite reakcije ljubimca i nastavite kroz povezane zdravstvene savjete.', primary: { label: 'Zdravlje', href: '/blog?category=zdravlje' }, secondary: { label: 'Zajednica', href: '/zajednica' } },
  dresura: { title: 'Teoriju pretvorite u trening.', text: 'Ako zapnete s ponašanjem, kombinirajte vodič s trenerom ili iskustvima drugih vlasnika.', primary: { label: 'Pretraži usluge', href: '/pretraga?category=usluge' }, secondary: { label: 'Forum', href: '/forum' } },
  putovanje: { title: 'Plan puta je pola mirnog putovanja.', text: 'Provjerite dog-friendly opcije i dogovorite skrb ako ljubimac ne ide s vama.', primary: { label: 'Dog-friendly', href: '/dog-friendly' }, secondary: { label: 'Pronađi sittera', href: '/pretraga' } },
  zabava: { title: 'Više igre, manje dosade.', text: 'Dobre aktivnosti najviše vrijede kad ih lako ubacite u dnevnu rutinu.', primary: { label: 'Zajednica', href: '/zajednica' }, secondary: { label: 'Još savjeta', href: '/blog' } },
  psi: { title: 'Život sa psom je lakši uz dobru podršku.', text: 'Od šetnje do čuvanja, PetPark može spojiti savjet s konkretnom uslugom.', primary: { label: 'Usluge', href: '/usluge' }, secondary: { label: 'Udomljavanje', href: '/udomljavanje' } },
  macke: { title: 'Mačja rutina voli mir i dosljednost.', text: 'Nastavite kroz mačje članke ili pitajte zajednicu za praktična iskustva.', primary: { label: 'Mačji članci', href: '/blog?category=macke' }, secondary: { label: 'Zajednica', href: '/zajednica' } },
};

function BodyBlock({ text, index }: { text: string; index: number }) {
  const trimmed = text.trim();
  if (trimmed.startsWith('### ')) {
    const heading = trimmed.slice(4).trim();
    return <h3 id={slugify(heading)} className="mt-8 scroll-mt-24 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{heading}</h3>;
  }
  if (trimmed.startsWith('## ')) {
    const heading = trimmed.slice(3).trim();
    return <h2 id={slugify(heading)} className="mt-10 scroll-mt-24 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{heading}</h2>;
  }
  if (index === 2) {
    return (
      <Card radius="24" tone="orange" className="my-8 p-5">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-orange-primary)]">PetPark savjet</p>
        <p className="mt-2 text-base font-semibold leading-8 text-[color:var(--pp-color-forest-text)]">{trimmed}</p>
      </Card>
    );
  }
  return <p className="text-lg font-semibold leading-9 text-[color:var(--pp-color-muted-text)]">{trimmed}</p>;
}

function RelatedCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="24" interactive className="h-full overflow-hidden">
        <div className="flex h-32 items-center justify-center border-b border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-sage-surface)]">
          <span className="text-5xl transition group-hover:scale-110" aria-hidden>{article.emoji}</span>
        </div>
        <div className="p-4">
          <Badge variant="orange">{BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}</Badge>
          <h3 className="mt-3 line-clamp-2 text-base font-black text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{article.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{article.excerpt}</p>
        </div>
      </Card>
    </Link>
  );
}

export function ArticleContent({ article, relatedArticles, comments, currentUser }: ArticleContentProps) {
  const [copied, setCopied] = useState(false);
  const headings = useMemo(() => parseHeadings(article.body), [article.body]);
  const blocks = useMemo(() => article.body.split('\n\n').filter(Boolean), [article.body]);
  const cta = CATEGORY_CTA[article.category];
  const minutes = readingTime(article);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <main data-petpark-route="blog-detail" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <section className="relative px-5 pb-12 pt-8 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[720px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[420px] hidden size-16 rotate-12 opacity-35 xl:block" />

        <div className="mx-auto max-w-[1320px] space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-[color:var(--pp-color-muted-text)]">
            <Link href="/blog" className="hover:text-[color:var(--pp-color-orange-primary)]">Blog</Link>
            <span>/</span>
            <Link href={`/blog?category=${article.category}`} className="hover:text-[color:var(--pp-color-orange-primary)]">{BLOG_CATEGORY_LABELS[article.category]}</Link>
            <span>/</span>
            <span className="line-clamp-1 text-[color:var(--pp-color-forest-text)]">{article.title}</span>
          </div>

          <ButtonLink href="/blog" variant="ghost" size="sm"><ChevronLeft className="size-4" /> Natrag na blog</ButtonLink>

          <Card radius="28" className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute right-8 top-8 hidden size-32 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_360px] xl:items-end">
              <div>
                <Badge variant="orange">{BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}</Badge>
                <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.055em] text-[color:var(--pp-color-forest-text)] sm:text-6xl lg:text-7xl">{article.title}</h1>
                <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">{article.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-black text-[color:var(--pp-color-muted-text)]">
                  <span className="inline-flex items-center gap-1"><UserRound className="size-4" /> {article.author}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" /> {formatLongDate(article.date)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-4" /> {minutes} min čitanja</span>
                  {article.updatedAt ? <span className="inline-flex items-center gap-1"><RefreshCcw className="size-4" /> ažurirano {formatLongDate(article.updatedAt)}</span> : null}
                </div>
                <div className="mt-7 flex flex-wrap gap-2">
                  <Button onClick={handleShare} variant="secondary"><Share2 className="size-4" /> {copied ? 'Kopirano!' : 'Kopiraj link'} {copied ? <Check className="size-4" /> : null}</Button>
                  <ButtonLink href="/zajednica" variant="teal"><MessageCircle className="size-4" /> Pitaj zajednicu</ButtonLink>
                </div>
              </div>

              <Card radius="28" tone="sage" className="flex min-h-[280px] items-center justify-center p-8">
                <span className="text-9xl" aria-hidden>{article.emoji}</span>
              </Card>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,760px)_280px] xl:items-start xl:justify-center">
            <aside className="hidden xl:block xl:sticky xl:top-28">
              <Card radius="24" tone="cream" className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]"><BookOpen className="size-4" /> Sadržaj</h2>
                <nav className="mt-4 space-y-2">
                  {headings.length ? headings.map((heading) => (
                    <a key={heading.id} href={`#${heading.id}`} className="block rounded-[var(--pp-radius-control)] px-3 py-2 text-sm font-bold text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]">{heading.text}</a>
                  )) : <p className="text-sm font-semibold text-[color:var(--pp-color-muted-text)]">Kratki vodič bez dodatnih poglavlja.</p>}
                </nav>
              </Card>
            </aside>

            <article className="min-w-0">
              <Card radius="28" className="p-6 sm:p-8 lg:p-10">
                <div className="space-y-6">
                  {blocks.map((block, index) => <BodyBlock key={`${index}-${block.slice(0, 12)}`} text={block} index={index} />)}
                </div>
              </Card>

              <Card radius="28" tone="orange" className="mt-6 p-6 sm:p-7">
                <Badge variant="teal"><Sparkles className="size-3" /> Sljedeći korak</Badge>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{cta.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{cta.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink href={cta.primary.href}>{cta.primary.label} <ArrowRight className="size-4" /></ButtonLink>
                  <ButtonLink href={cta.secondary.href} variant="secondary">{cta.secondary.label}</ButtonLink>
                </div>
              </Card>

              <Card radius="28" tone="cream" className="mt-6 p-6">
                <div className="flex items-start gap-4">
                  <Avatar initials={initials(article.author)} alt={article.author} size="lg" />
                  <div>
                    <h2 className="text-xl font-black text-[color:var(--pp-color-forest-text)]">{article.author}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Autor PetPark vodiča s fokusom na praktične savjete koje vlasnici mogu odmah primijeniti.</p>
                  </div>
                </div>
              </Card>

              <div className="mt-8">
                <BlogComments articleSlug={article.slug} initialComments={comments} currentUser={currentUser} />
              </div>

              {relatedArticles.length ? (
                <section className="mt-10 space-y-5">
                  <div>
                    <h2 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Nastavite čitati</h2>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--pp-color-muted-text)]">Još korisnih PetPark vodiča iz sličnih tema.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {relatedArticles.map((related) => <RelatedCard key={related.slug} article={related} />)}
                  </div>
                </section>
              ) : null}
            </article>

            <aside className="space-y-5 xl:sticky xl:top-28">
              <Card radius="24" tone="sage" className="p-5">
                <h2 className="text-lg font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Zašto pročitati do kraja?</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">PetPark članci vode od savjeta do konkretne akcije: usluge, zajednica i povezani vodiči su odmah pri ruci.</p>
              </Card>
              <Card radius="24" tone="teal" className="p-5">
                <h2 className="text-lg font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Pitanje nakon članka?</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Otvori zajednicu i pitaj druge vlasnike ili providere.</p>
                <ButtonLink href="/zajednica" className="mt-5 w-full" variant="secondary">Pitaj zajednicu</ButtonLink>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
