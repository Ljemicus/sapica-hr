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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4 text-orange-600 bg-orange-50 border-0">Blog</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Savjeti za vlasnike ljubimaca</h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Korisni članci o zdravlju, prehrani, školovanju pasa i svemu što vaš ljubimac treba
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <Button
          variant={!initialCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => router.push('/blog')}
          className={!initialCategory ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-orange-50 hover:text-orange-600'}
        >
          Sve
        </Button>
        {categories.map(([key, label]) => (
          <Button
            key={key}
            variant={initialCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => router.push(`/blog?category=${key}`)}
            className={initialCategory === key ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-orange-50 hover:text-orange-600'}
          >
            {BLOG_CATEGORY_EMOJI[key]} {label}
          </Button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {articles.map((article, i) => (
          <Link key={article.slug} href={`/blog/${article.slug}`}>
            <Card className={`group card-hover h-full border-0 shadow-sm rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up delay-${(i + 1) * 100}`}>
              <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center relative">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{article.emoji}</span>
                  <Badge className="absolute top-3 left-3 bg-white/90 text-orange-600 text-xs shadow-sm hover:bg-white/90">
                    {BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}
                  </Badge>
                </div>
                <div className="p-5 space-y-3">
                  <h2 className="font-semibold text-lg group-hover:text-orange-500 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
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
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Nema članaka u ovoj kategoriji</h3>
          <Button variant="outline" className="mt-4 hover:bg-orange-50 hover:text-orange-600" onClick={() => router.push('/blog')}>
            Prikaži sve članke
          </Button>
        </div>
      )}
    </div>
  );
}
