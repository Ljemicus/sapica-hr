import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getArticle, getRelatedArticles } from '@/lib/db';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type BlogCategory } from '@/lib/types';

const categoryColors: Record<BlogCategory, string> = {
  zdravlje: 'bg-green-50 text-green-700 border-green-200',
  prehrana: 'bg-amber-50 text-amber-700 border-amber-200',
  dresura: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  putovanje: 'bg-blue-50 text-blue-700 border-blue-200',
  zabava: 'bg-pink-50 text-pink-700 border-pink-200',
};

const categoryGradients: Record<BlogCategory, string> = {
  zdravlje: 'from-green-500 to-emerald-500',
  prehrana: 'from-amber-500 to-orange-500',
  dresura: 'from-indigo-500 to-blue-500',
  putovanje: 'from-blue-500 to-cyan-500',
  zabava: 'from-pink-500 to-rose-500',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Članak nije pronađen' };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(slug, 3);

  return (
    <div>
      {/* Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${categoryGradients[article.category]} py-16 md:py-24`}>
        <div className="absolute inset-0 paw-pattern opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Link href="/zajednica">
              <Button variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Natrag na zajednicu
              </Button>
            </Link>
            <span className="text-7xl block mb-6">{article.emoji}</span>
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/20 border-0">
              {BLOG_CATEGORY_EMOJI[article.category]} {BLOG_CATEGORY_LABELS[article.category]}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/70 text-sm">
              <span>{article.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(article.date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <article className="prose prose-lg max-w-none">
            {article.body.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-6">{paragraph}</p>
            ))}
          </article>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                Povezani članci
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((rel) => (
                  <Link key={rel.slug} href={`/zajednica/${rel.slug}`}>
                    <Card className="group card-hover overflow-hidden border-0 shadow-sm rounded-2xl h-full">
                      <CardContent className="p-0">
                        <div className={`h-28 bg-gradient-to-br ${categoryGradients[rel.category]} flex items-center justify-center relative`}>
                          <div className="absolute inset-0 paw-pattern opacity-10" />
                          <span className="text-4xl relative">{rel.emoji}</span>
                        </div>
                        <div className="p-4">
                          <Badge variant="outline" className={`text-xs mb-2 ${categoryColors[rel.category]}`}>
                            {BLOG_CATEGORY_LABELS[rel.category]}
                          </Badge>
                          <h3 className="font-semibold text-sm group-hover:text-orange-500 transition-colors line-clamp-2">
                            {rel.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
