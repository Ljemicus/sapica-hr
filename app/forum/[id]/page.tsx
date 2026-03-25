import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Heart, Clock, Pin, Flame, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { FORUM_CATEGORIES, type ForumCategorySlug } from '@/lib/types';
import { getTopic, getPosts, getTopics } from '@/lib/db';

const gradients = [
  'from-orange-400 to-amber-300',
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-purple-400 to-pink-300',
  'from-rose-400 to-orange-300',
  'from-teal-400 to-cyan-300',
];

function getGradient(name: string) {
  return gradients[name.charCodeAt(0) % gradients.length];
}

function timeAgo(dateStr: string) {
  const now = new Date('2026-03-24T12:00:00Z');
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `prije ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `prije ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'jučer';
  if (days < 7) return `prije ${days} dana`;
  return new Date(dateStr).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) return { title: 'Post nije pronađen' };
  return {
    title: `${topic.title} — Forum`,
    description: `Diskusija: ${topic.title}`,
  };
}

export default async function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();

  const comments = await getPosts(id);
  const cat = FORUM_CATEGORIES.find(c => c.slug === topic.category_slug);

  // Related topics from same category
  const allCategoryTopics = await getTopics(topic.category_slug);
  const related = allCategoryTopics
    .filter(t => t.id !== topic.id)
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-10 md:py-16 relative">
          <div className="max-w-3xl mx-auto">
            <Link href="/forum">
              <Button variant="ghost" className="mb-6 text-gray-600 hover:text-orange-500 hover:bg-orange-50 -ml-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Natrag na forum
              </Button>
            </Link>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {topic.is_pinned && (
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  <Pin className="h-3 w-3 mr-1" /> Prikvačeno
                </Badge>
              )}
              {topic.is_hot && (
                <Badge className="bg-red-100 text-red-700 border-0">
                  <Flame className="h-3 w-3 mr-1" /> Popularno
                </Badge>
              )}
              {cat && (
                <Badge variant="outline" className={cat.color}>
                  {cat.emoji} {cat.name}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
              {topic.title}
            </h1>

            <div className="flex items-center gap-4 animate-fade-in-up delay-100">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`bg-gradient-to-br ${topic.author_gradient} text-white font-medium`}>
                  {topic.author_initial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{topic.author_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(topic.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {topic.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {topic.comment_count} komentara
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-500" />
            Komentari ({comments.length})
          </h2>

          <div className="space-y-4 mb-10">
            {comments.map((comment, i) => (
              <Card key={comment.id} className={`border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${((i % 5) + 1) * 100}`}>
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className={`bg-gradient-to-br ${getGradient(comment.author_name)} text-white text-sm font-medium`}>
                        {comment.author_initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                          <Heart className="h-3.5 w-3.5" />
                          {comment.likes}
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-orange-500 transition-colors">
                          Odgovori
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply form */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm mb-3">Dodaj komentar</h3>
              <Textarea placeholder="Napišite svoj komentar..." className="min-h-[80px] mb-3 rounded-xl" />
              <div className="flex justify-end">
                <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl">
                  <Send className="h-4 w-4 mr-2" />
                  Objavi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related topics */}
          {related.length > 0 && (
            <div className="mt-14 pt-10 border-t">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                Slične teme
              </h2>
              <div className="space-y-3">
                {related.map(t => {
                  const relCat = FORUM_CATEGORIES.find(c => c.slug === t.category_slug);
                  return (
                    <Link key={t.id} href={`/forum/${t.id}`}>
                      <Card className="group card-hover border-0 shadow-sm rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className={`bg-gradient-to-br ${t.author_gradient} text-white text-xs font-medium`}>
                              {t.author_initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium group-hover:text-orange-500 transition-colors line-clamp-1">{t.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {relCat && <span>{relCat.emoji}</span>}
                              <span>{t.author_name}</span>
                              <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {t.likes}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
