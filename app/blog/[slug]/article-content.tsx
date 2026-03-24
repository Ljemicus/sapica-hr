'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, ChevronLeft, Share2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type Article } from '@/lib/types';

interface ArticleContentProps {
  article: Article;
  relatedArticles: Article[];
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

  const paragraphs = article.body.split('\n\n').filter(Boolean);

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
        </div>
      </div>

      {/* Hero emoji */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl flex items-center justify-center mb-8">
        <span className="text-8xl">{article.emoji}</span>
      </div>

      {/* Article body */}
      <div className="prose prose-lg max-w-none mb-10">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-gray-700 leading-relaxed mb-5">{paragraph}</p>
        ))}
      </div>

      {/* Share */}
      <div className="flex items-center gap-3 mb-10 pb-8 border-b">
        <span className="text-sm text-muted-foreground">Podijelite članak:</span>
        <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-orange-50 hover:text-orange-600">
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
          {copied ? 'Kopirano!' : 'Kopiraj link'}
        </Button>
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
