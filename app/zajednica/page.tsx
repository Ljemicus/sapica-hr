import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { getArticles } from '@/lib/db';
import { SEARCH_DISCOVERY_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_EMOJI, type BlogCategory } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Zajednica — Savjeti za vlasnike ljubimaca',
  description: 'Članci, savjeti i priče za vlasnike pasa i mačaka. Zdravlje, prehrana, školovanje pasa i putovanja s ljubimcima.',
  alternates: { canonical: 'https://petpark.hr/zajednica' },
};

const categoryColors: Record<BlogCategory, string> = {
  psi: 'bg-orange-50 text-orange-700 border-orange-200',
  macke: 'bg-purple-50 text-purple-700 border-purple-200',
  zdravlje: 'bg-green-50 text-green-700 border-green-200',
  prehrana: 'bg-amber-50 text-amber-700 border-amber-200',
  dresura: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  putovanje: 'bg-blue-50 text-blue-700 border-blue-200',
  zabava: 'bg-pink-50 text-pink-700 border-pink-200',
};

const categoryGradients: Record<BlogCategory, string> = {
  psi: 'from-orange-500 to-amber-500',
  macke: 'from-purple-500 to-pink-500',
  zdravlje: 'from-green-500 to-emerald-500',
  prehrana: 'from-amber-500 to-orange-500',
  dresura: 'from-indigo-500 to-blue-500',
  putovanje: 'from-blue-500 to-cyan-500',
  zabava: 'from-pink-500 to-rose-500',
};

export default async function ZajednicaPage() {
  const articles = await getArticles();
  const categories = Object.entries(BLOG_CATEGORY_LABELS) as [BlogCategory, string][];
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-green-50">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-sm px-5 py-2 animate-fade-in-up">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Zajednica
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
              Savjeti za{' '}
              <span className="text-gradient">vlasnike ljubimaca</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed">
              Članci, vodiči i priče iz zajednice. Sve što trebate znati o
              brizi za svog ljubimca — na jednom mjestu.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map(([key, label]) => (
            <Link key={key} href={`/zajednica?kategorija=${key}`}>
              <Badge variant="outline" className={`px-4 py-2 text-sm cursor-pointer hover:shadow-md transition-all ${categoryColors[key]}`}>
                {BLOG_CATEGORY_EMOJI[key]} {label}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Featured article */}
        {featured && (
          <Link href={`/zajednica/${featured.slug}`}>
            <Card className="group card-hover overflow-hidden border-0 shadow-sm rounded-2xl mb-10 animate-fade-in-up">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-96 min-h-[240px] bg-gradient-to-br ${categoryGradients[featured.category]} flex items-center justify-center flex-shrink-0 relative`}>
                    <div className="absolute inset-0 paw-pattern opacity-10" />
                    <span className="text-8xl relative">{featured.emoji}</span>
                  </div>
                  <div className="flex-1 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className={`text-xs ${categoryColors[featured.category]}`}>
                        {BLOG_CATEGORY_EMOJI[featured.category]} {BLOG_CATEGORY_LABELS[featured.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(featured.date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-orange-500 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Autor: {featured.author}</span>
                      <span className="text-sm font-medium text-orange-500 flex items-center gap-1">
                        Čitaj dalje <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article, i) => (
            <Link key={article.slug} href={`/zajednica/${article.slug}`}>
              <Card className={`group card-hover overflow-hidden cursor-pointer border-0 shadow-sm rounded-2xl h-full animate-fade-in-up delay-${((i % 3) + 1) * 100}`}>
                <CardContent className="p-0">
                  <div className={`h-40 bg-gradient-to-br ${categoryGradients[article.category]} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 paw-pattern opacity-10" />
                    <span className="text-6xl relative group-hover:scale-110 transition-transform duration-300">{article.emoji}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={`text-xs ${categoryColors[article.category]}`}>
                        {BLOG_CATEGORY_LABELS[article.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(article.date).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground">{article.author}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="Još nema članaka"
            description="Uskoro objavljujemo korisne savjete za vlasnike ljubimaca. Pratite nas!"
          />
        )}
      </div>

      <InternalLinkSection
        eyebrow="Od čitanja do akcije"
        title="Treba vam i konkretna usluga?"
        description="Ako ste spremni za sljedeći korak — pronađite usluge, lokacije i savjete za svog ljubimca."
        items={[
          ...SEARCH_DISCOVERY_LINKS.slice(0, 4),
          ...CONTENT_DISCOVERY_LINKS.slice(1),
        ]}
      />
    </div>
  );
}
