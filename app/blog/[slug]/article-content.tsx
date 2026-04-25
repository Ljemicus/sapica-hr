'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  ChevronLeft,
  Share2,
  Check,
  ArrowRight,
  Clock,
  BookOpen,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BLOG_CATEGORY_LABELS,
  BLOG_CATEGORY_EMOJI,
  type Article,
  type BlogCategory,
  type BlogComment,
} from '@/lib/types';
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
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[đ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

interface LinkItem {
  title: string;
  href: string;
  description: string;
}

function parseHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4).trim();
      headings.push({ level: 3, text, id: slugify(text) });
    } else if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3).trim();
      headings.push({ level: 2, text, id: slugify(text) });
    }
  }
  return headings;
}

function getAuthorInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AUTHOR_COLORS: Record<string, string> = {
  A: 'bg-orange-500',
  B: 'bg-blue-500',
  C: 'bg-green-500',
  D: 'bg-purple-500',
  E: 'bg-pink-500',
  F: 'bg-teal-500',
  G: 'bg-red-500',
  H: 'bg-indigo-500',
  P: 'bg-orange-500',
};

function getAuthorColor(name: string): string {
  const firstChar = name.charAt(0).toUpperCase();
  return AUTHOR_COLORS[firstChar] || 'bg-orange-500';
}

function getAuthorBio(name: string): string {
  return `${name} je autor i ljubitelj životinja koji redovito piše za PetPark blog. Strastveno dijeli savjete i iskustva iz svijeta kućnih ljubimaca kako bi pomogao vlasnicima pružiti najbolju moguću skrb.`;
}

const CATEGORY_CTA: Record<BlogCategory, {
  kicker: string;
  title: string;
  text: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}> = {
  zdravlje: {
    kicker: 'Zdravlje ljubimca',
    title: 'Trebate veterinara ili hitan savjet?',
    text: 'Ako članak opisuje simptome koje primjećujete kod ljubimca, nemojte ostati samo na čitanju — pronađite veterinara ili otvorite hitne upute.',
    primary: { label: 'Pronađi veterinara', href: '/veterinari' },
    secondary: { label: 'Otvori hitne upute', href: '/hitno' },
  },
  prehrana: {
    kicker: 'Prehrana bez lutanja',
    title: 'Nastavite s boljom rutinom hranjenja bez previše improvizacije',
    text: 'Nakon vodiča o prehrani, najviše koristi donosi dobar plan, provjerene navike i dodatni sadržaj o zdravlju i rutini.',
    primary: { label: 'Savjeti o zdravlju', href: '/blog?category=zdravlje' },
    secondary: { label: 'Pogledaj zajednicu', href: '/forum' },
  },
  dresura: {
    kicker: 'Trening u praksi',
    title: 'Trebate pomoć oko ponašanja ili treninga?',
    text: 'Ako zapnete s reaktivnošću, povlačenjem ili osnovnim naredbama, najbolji rezultat često dolazi uz plan i stručnu pomoć.',
    primary: { label: 'Istraži dresuru', href: '/dresura' },
    secondary: { label: 'Pretraži usluge', href: '/pretraga' },
  },
  putovanje: {
    kicker: 'Planirate izlazak ili put?',
    title: 'Pronađite dog-friendly mjesta i pomoć kad vas nema',
    text: 'Putovanja s ljubimcem postaju puno lakša kad unaprijed znate kamo možete i kome možete povjeriti ljubimca.',
    primary: { label: 'Dog-friendly lokacije', href: '/dog-friendly' },
    secondary: { label: 'Pronađi sittera', href: '/pretraga' },
  },
  zabava: {
    kicker: 'Više zabave, manje dosade',
    title: 'Pretvorite ideje iz članka u stvarne aktivnosti',
    text: 'Ako vaš ljubimac treba više stimulacije, kombinacija aktivnosti, rutine i dobrih mjesta radi čuda.',
    primary: { label: 'Istraži dog-friendly mjesta', href: '/dog-friendly' },
    secondary: { label: 'Pogledaj zajednicu', href: '/forum' },
  },
  psi: {
    kicker: 'Život sa psom',
    title: 'Trebate pomoć oko šetnje, čuvanja ili novog psa?',
    text: 'PetPark nije samo blog — možete pronaći konkretne usluge, provjerene profile i nove rute za život sa psom.',
    primary: { label: 'Pretraži usluge', href: '/pretraga' },
    secondary: { label: 'Pogledaj udomljavanje', href: '/udomljavanje' },
  },
  macke: {
    kicker: 'Život s mačkom',
    title: 'Trebate više praktičnih ideja za mačju rutinu?',
    text: 'Od svakodnevice u stanu do zdravstvenih pitanja, nastavite kroz članke i zajednicu gdje se skupljaju iskustva vlasnika.',
    primary: { label: 'Čitaj mačje članke', href: '/blog?category=macke' },
    secondary: { label: 'Pogledaj zajednicu', href: '/forum' },
  },
};

const CATEGORY_INTERNAL_LINKS: Record<BlogCategory, LinkItem[]> = {
  zdravlje: [
    { title: 'Veterinari', href: '/veterinari', description: 'Brži korak kad želite stručan pregled ili drugu procjenu.' },
    { title: 'Hitne upute', href: '/hitno', description: 'Otvorite hitni vodič ako sumnjate na trovanje, ubod ili druge rizične simptome.' },
    { title: 'Više članaka o zdravlju', href: '/blog?category=zdravlje', description: 'Nastavite kroz povezane teme bez vraćanja na početak.' },
  ],
  prehrana: [
    { title: 'Članci o zdravlju', href: '/blog?category=zdravlje', description: 'Prehrana i zdravlje idu zajedno — ovdje je najlogičniji nastavak.' },
    { title: 'Forum zajednica', href: '/forum', description: 'Pogledajte iskustva drugih vlasnika oko hrane, rutine i osjetljivih trbuha.' },
    { title: 'FAQ', href: '/faq', description: 'Brzi odgovori za česta pitanja oko platforme i usluga.' },
  ],
  dresura: [
    { title: 'Dresura', href: '/dresura', description: 'Pregled postojećih training ruta i ulaza u relevantne usluge.' },
    { title: 'Pretraži usluge', href: '/pretraga', description: 'Ako želite prijeći s teorije na praksu, ovo je najbrži korak.' },
    { title: 'Članci za vlasnike pasa', href: '/blog?category=psi', description: 'Povežite trening s rutinom, šetnjom i ponašanjem.' },
  ],
  putovanje: [
    { title: 'Dog-friendly vodič', href: '/dog-friendly', description: 'Mjesta i ideje koja podržavaju izlete i kraće gradske planove.' },
    { title: 'Pronađi sittera', href: '/pretraga', description: 'Kad ipak ne možete voditi ljubimca sa sobom, olakšajte si logistiku.' },
    { title: 'Članci za pse', href: '/blog?category=psi', description: 'Dodatni sadržaj za rutinu, šetnju i pripremu prije puta.' },
  ],
  zabava: [
    { title: 'Dog-friendly mjesta', href: '/dog-friendly', description: 'Iskoristite ideje iz članka i pretvorite ih u stvarni izlazak.' },
    { title: 'Forum zajednica', href: '/forum', description: 'Pogledajte kako drugi vlasnici rješavaju dosadu i obogaćenje rutine.' },
    { title: 'Članci za školovanje', href: '/blog?category=dresura', description: 'Kad zabava preraste u trening, ovo je prirodan sljedeći korak.' },
  ],
  psi: [
    { title: 'Pretraži usluge', href: '/pretraga', description: 'Šetnja, čuvanje i ostale praktične usluge na jednom mjestu.' },
    { title: 'Udomljavanje', href: '/udomljavanje', description: 'Ako razmišljate o novom članu obitelji, krenite ovdje.' },
    { title: 'Članci o dresuri', href: '/blog?category=dresura', description: 'Nastavite s treninzima, rutinom i svakodnevnim ponašanjem.' },
  ],
  macke: [
    { title: 'Mačji članci', href: '/blog?category=macke', description: 'Brz ulaz u još relevantnih tekstova za vlasnike mačaka.' },
    { title: 'Forum zajednica', href: '/forum', description: 'Pitanja, iskustva i savjeti koje vrijedi pročitati prije iduće odluke.' },
    { title: 'Članci o zdravlju', href: '/blog?category=zdravlje', description: 'Kad vas zanimaju simptomi, preventiva i veterinarski kontekst.' },
  ],
};

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ArticleContent({ article, relatedArticles, comments, currentUser }: ArticleContentProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silently
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  const wordCount = useMemo(() => article.body.split(/\s+/).filter(Boolean).length, [article.body]);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const headings = useMemo(() => parseHeadings(article.body), [article.body]);
  const showToc = wordCount > 500 && headings.length > 0;

  const bodyBlocks = useMemo(() => {
    const segments = article.body.split('\n\n').filter(Boolean);
    return segments.map((segment: string) => {
      const trimmed = segment.trim();
      if (trimmed.startsWith('### ')) {
        const text = trimmed.slice(4).trim();
        return { type: 'h3' as const, text, id: slugify(text) };
      }
      if (trimmed.startsWith('## ')) {
        const text = trimmed.slice(3).trim();
        return { type: 'h2' as const, text, id: slugify(text) };
      }
      return { type: 'p' as const, text: trimmed, id: '' };
    });
  }, [article.body]);

  const categoryCta = CATEGORY_CTA[article.category];
  const internalLinks = CATEGORY_INTERNAL_LINKS[article.category];
  const updatedAt = article.updatedAt ?? article.date;
  const heroGradient = article.coverGradient ?? 'from-orange-500 via-amber-500 to-teal-500';
  const sameDayUpdate = updatedAt === article.date;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2 hover:bg-orange-50 hover:text-orange-600">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Natrag na blog
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${heroGradient} p-6 md:p-8 text-white mb-8 shadow-sm`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_30%)]" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <Badge className="mb-4 bg-white/15 text-white border-white/15 hover:bg-white/15">
                  {BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{article.title}</h1>
                <p className="text-white/85 text-base md:text-lg max-w-2xl">{article.excerpt}</p>
              </div>
              <div className="shrink-0 self-start md:self-auto rounded-3xl bg-white/10 backdrop-blur-sm px-6 py-5 text-center border border-white/15">
                <div className="text-6xl md:text-7xl leading-none">{article.emoji}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70">PetPark blog</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">{article.author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Objavljeno {formatLongDate(article.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCcw className="h-4 w-4" />
              Ažurirano {formatLongDate(updatedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingTime} min čitanja
            </span>
            {!sameDayUpdate && (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-0">
                Osvježeno izdanje
              </Badge>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px] xl:items-start">
            <div className="min-w-0">
              <div className="prose prose-lg max-w-none mb-10">
                {bodyBlocks.map((block, i) => {
                  if (block.type === 'h2') {
                    return (
                      <h2 key={i} id={block.id} className="text-2xl font-bold mt-8 mb-4 scroll-mt-20">
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === 'h3') {
                    return (
                      <h3 key={i} id={block.id} className="text-xl font-semibold mt-6 mb-3 scroll-mt-20">
                        {block.text}
                      </h3>
                    );
                  }
                  return (
                    <p key={i} className="text-gray-700 leading-relaxed mb-5">
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-20">
              {showToc && (
                <Card className="border border-orange-100 shadow-sm rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold text-sm">Sadržaj</span>
                    </div>
                    <nav>
                      <ul className="space-y-1.5">
                        {headings.map((heading, i) => (
                          <li key={i} className={heading.level === 3 ? 'ml-4' : ''}>
                            <a
                              href={`#${heading.id}`}
                              className="text-sm text-muted-foreground hover:text-orange-600 transition-colors"
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-sm rounded-2xl bg-slate-50/80">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <p className="font-semibold text-sm">Brzi nastavak</p>
                  </div>
                  <div className="space-y-3">
                    {internalLinks.map((item) => (
                      <Link prefetch={false} key={item.href} href={item.href} className="block rounded-xl border bg-white p-3 hover:border-orange-200 hover:bg-orange-50/60 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-sm text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          <div className="rounded-[28px] bg-gradient-to-r from-orange-50 to-teal-50 p-6 md:p-8 mb-10 border border-orange-100/70">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-3">{categoryCta.kicker}</p>
              <h2 className="text-2xl font-bold mb-2">{categoryCta.title}</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-5 leading-relaxed">{categoryCta.text}</p>
              <div className="flex flex-wrap gap-3">
                <Link prefetch={false} href={categoryCta.primary.href}>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                    {categoryCta.primary.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link prefetch={false} href={categoryCta.secondary.href}>
                  <Button variant="outline" className="rounded-full hover:bg-white hover:text-orange-600 hover:border-orange-200">
                    {categoryCta.secondary.label}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-10 pb-8 border-b">
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                <AvatarFallback className={`${getAuthorColor(article.author)} text-white font-semibold`}>
                  {getAuthorInitials(article.author)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{article.author}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {getAuthorBio(article.author)}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                  <Link prefetch={false} href="/blog" className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium">
                    Pogledaj sve članke
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link prefetch={false} href={`/blog?category=${article.category}`} className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium">
                    Više iz kategorije {BLOG_CATEGORY_LABELS[article.category].toLowerCase()}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-10 pb-8 border-b">
            <span className="text-sm text-muted-foreground">Podijelite članak:</span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-orange-50 hover:text-orange-600">
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
                {copied ? 'Kopirano!' : 'Kopiraj link'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareFacebook} className="hover:bg-blue-50 hover:text-blue-600">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareTwitter} className="hover:bg-sky-50 hover:text-sky-600">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </Button>
            </div>
          </div>

          <BlogComments articleSlug={article.slug} initialComments={comments} currentUser={currentUser} />

          {relatedArticles.length > 0 && (
            <div className="mb-10">
              <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold">Nastavite čitati</h2>
                  <p className="text-sm text-muted-foreground mt-1">Još korisnog sadržaja iz sličnih ili susjednih tema.</p>
                </div>
                <Link prefetch={false} href={`/blog?category=${article.category}`} className="text-sm font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1">
                  Više iz kategorije
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((related) => (
                  <Link prefetch={false} key={related.slug} href={`/blog/${related.slug}`}>
                    <Card className="group card-hover h-full border-0 shadow-sm rounded-2xl overflow-hidden cursor-pointer">
                      <CardContent className="p-0">
                        <div className={`h-28 bg-gradient-to-br ${related.coverGradient ?? 'from-orange-100 to-amber-50'} flex items-center justify-center relative`}>
                          <Badge className="absolute top-3 left-3 bg-white/90 text-orange-600 text-xs shadow-sm hover:bg-white/90 border-0">
                            {BLOG_CATEGORY_EMOJI[related.category]} {BLOG_CATEGORY_LABELS[related.category]}
                          </Badge>
                          <span className="text-4xl group-hover:scale-110 transition-transform">{related.emoji}</span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm group-hover:text-orange-500 transition-colors line-clamp-2">
                            {related.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{related.excerpt}</p>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{formatLongDate(related.updatedAt ?? related.date)}</span>
                            <ArrowRight className="h-3 w-3 group-hover:text-orange-400 transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="hidden lg:block space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">Zašto ovo vrijedi pročitati do kraja?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ovaj članak je dio PetPark baze praktičnih vodiča koji vas vode od savjeta do konkretne akcije — usluge, dodatni članci i korisne rute su odmah pri ruci.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
