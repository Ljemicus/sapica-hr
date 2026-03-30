'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, ChevronLeft, Share2, Check, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type Article } from '@/lib/types';

interface ArticleContentProps {
  article: Article;
  relatedArticles: Article[];
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
};

function getAuthorColor(name: string): string {
  const firstChar = name.charAt(0).toUpperCase();
  return AUTHOR_COLORS[firstChar] || 'bg-orange-500';
}

function getAuthorBio(name: string): string {
  return `${name} je autor i ljubitelj životinja koji redovito piše za PetPark blog. Strastveno dijeli savjete i iskustva iz svijeta kućnih ljubimaca kako bi pomogao vlasnicima pružiti najbolju moguću skrb.`;
}

export function ArticleContent({ article, relatedArticles }: ArticleContentProps) {
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

  // Calculate reading time (200 words/min for Croatian)
  const wordCount = useMemo(() => article.body.split(/\s+/).filter(Boolean).length, [article.body]);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Parse headings for TOC
  const headings = useMemo(() => parseHeadings(article.body), [article.body]);
  const showToc = wordCount > 500 && headings.length > 0;

  // Parse body into blocks (paragraphs and headings)
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2 hover:bg-orange-50 hover:text-orange-600">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Natrag na blog
      </Button>

      {/* Article header */}
      <div className="mb-8">
        <Badge className="mb-4 bg-orange-50 text-orange-600 border-0 hover:bg-orange-50">
          {BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {article.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(article.date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {readingTime} min čitanja
          </span>
        </div>
      </div>

      {/* Hero emoji */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl flex items-center justify-center mb-8">
        <span className="text-8xl">{article.emoji}</span>
      </div>

      {/* Table of Contents */}
      {showToc && (
        <Card className="mb-8 border border-orange-100 shadow-sm rounded-2xl">
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

      {/* Article body */}
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

      {/* Author bio */}
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
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mt-2 font-medium">
              Pogledaj sve članke
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="flex items-center gap-3 mb-10 pb-8 border-b">
        <span className="text-sm text-muted-foreground">Podijelite članak:</span>
        <div className="flex items-center gap-2">
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

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6">Povezani članci</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link key={related.slug} href={`/blog/${related.slug}`}>
                <Card className="group card-hover h-full border-0 shadow-sm rounded-2xl overflow-hidden cursor-pointer">
                  <CardContent className="p-0">
                    <div className="h-24 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{related.emoji}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm group-hover:text-orange-500 transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{BLOG_CATEGORY_LABELS[related.category]}</span>
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

      {/* Zadnje objave */}
      {relatedArticles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6">Zadnje objave</h2>
          <div className="space-y-3">
            {relatedArticles.slice(0, 5).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50 transition-colors">
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{post.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(post.date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}&middot;{' '}
                      {BLOG_CATEGORY_LABELS[post.category]}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-400 transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-400">
        <CardContent className="p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Pronađite sittera za svog ljubimca</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Verificirani čuvari ljubimaca u vašem gradu. Rezervirajte online u par klikova.
          </p>
          <Link href="/pretraga">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-black/10 btn-hover font-semibold">
              Pretraži sittere
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
