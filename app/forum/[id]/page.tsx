import { cache } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Heart, Clock, Pin, Flame, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getForumTopicPageData } from './forum-topic-data';
import { FORUM_CATEGORIES } from '@/lib/types';
import { getCoverStyle } from '@/lib/forum/cover-images';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { CommentForm } from './comment-form';
import { ForumTopicActions } from './topic-actions';
import { ForumModerateControls } from './moderate-controls';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { SEARCH_DISCOVERY_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { LOCALE_HEADER } from '@/lib/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

const getCachedTopic = cache(async (id: string) => (await getForumTopicPageData(id)).topic);

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
  const now = new Date();
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
  const topic = await getCachedTopic(id);
  if (!topic) return { title: 'Post nije pronađen' };
  return {
    title: `${topic.title} — Forum`,
    description: `Diskusija: ${topic.title}`,
    openGraph: {
      title: `${topic.title} — Forum | PetPark`,
      description: `Diskusija: ${topic.title}`,
      url: `${BASE_URL}/forum/${id}`,
      type: 'article',
      images: [topic.cover_image_url || '/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.title} — Forum | PetPark`,
      description: `Diskusija: ${topic.title}`,
      images: [topic.cover_image_url || '/opengraph-image'],
    },
    alternates: {
      canonical: `${BASE_URL}/forum/${id}`,
    },
  };
}

export default async function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { topic, comments, related, category: cat } = await getForumTopicPageData(id);
  if (!topic) notFound();

  const locale = (await headers()).get(LOCALE_HEADER) === 'en' ? 'en' : 'hr';
  const isEn = locale === 'en';
  const forumListingHref = isEn ? '/forum/en' : '/forum';

  const copy = {
    forum: isEn ? 'Forum' : 'Forum',
    back: isEn ? 'Back to forum' : 'Natrag na forum',
    pinned: isEn ? 'Pinned' : 'Prikvačeno',
    hot: isEn ? 'Trending' : 'Popularno',
    commentsCount: isEn ? 'comments' : 'komentara',
    commentsTitle: isEn ? 'Comments' : 'Komentari',
    reply: isEn ? 'Reply' : 'Odgovori',
    related: isEn ? 'Related topics' : 'Slične teme',
    needHelpEyebrow: isEn ? 'Need concrete help?' : 'Trebate konkretnu pomoć?',
    needHelpTitle: isEn ? 'From discussion to action' : 'Od rasprave do akcije',
    needHelpDescription: isEn ? 'If you found what you needed in this topic, here is where to go next.' : 'Ako ste u temi pronašli ono što trebate — evo kako možete dalje.',
    originalPost: isEn ? 'Original post' : 'Originalna objava',
  };

  const cover = getCoverStyle(topic.category_slug);

  return (
    <div className="concept-zero">
      <Breadcrumbs items={[
        { label: copy.forum, href: forumListingHref },
        ...(cat ? [{ label: cat.name, href: `${forumListingHref}?category=${topic.category_slug}` }] : []),
        { label: topic.title, href: `/forum/${id}` },
      ]} />

      {/* Cover image or premium category gradient banner */}
      {topic.cover_image_url ? (
        <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden">
          <img src={topic.cover_image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cover.gradient}`} />
        </div>
      ) : (
        <div className={`relative h-2 bg-gradient-to-r ${cover.gradient}`} />
      )}

      {/* Hero — editorial topic header */}
      <section className="relative overflow-hidden forum-hero-gradient">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10 md:py-14 relative">
          <div className="max-w-3xl">
            <Link href={forumListingHref}>
              <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 -ml-3 rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {copy.back}
              </Button>
            </Link>

            {/* Status badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {topic.is_pinned && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-3 py-1.5 rounded-full">
                  <Pin className="h-3 w-3" /> {copy.pinned}
                </span>
              )}
              {topic.is_hot && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-3 py-1.5 rounded-full">
                  <Flame className="h-3 w-3" /> {copy.hot}
                </span>
              )}
              {topic.status === 'hidden' && (
                <Badge variant="outline" className="border-red-200 text-red-500 bg-red-50 dark:bg-red-950/30 rounded-full">
                  Skriveno
                </Badge>
              )}
              {cat && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${cat.color}`}>
                  {cat.emoji} {cat.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-6 animate-fade-in-up font-[var(--font-heading)] leading-tight">
              {topic.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-4 animate-fade-in-up delay-100">
              <Avatar className="h-12 w-12 ring-2 ring-border/20">
                <AvatarFallback className={`bg-gradient-to-br ${topic.author_gradient} text-white font-semibold`}>
                  {topic.author_initial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{topic.author_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(topic.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {topic.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {topic.comment_count} {copy.commentsCount}
                  </span>
                  <ForumTopicActions topicId={topic.id} initialLikes={topic.likes} />
                  <ForumModerateControls targetType="topic" targetId={topic.id} status={topic.status ?? 'active'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content area — 2-col layout */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Original post body */}
            {topic.body && (
              <div className="forum-original-post p-6 md:p-8 mb-10 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-warm-orange flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {copy.originalPost}
                  </span>
                </div>
                <p className="text-[15px] md:text-base leading-8 text-foreground/90 whitespace-pre-wrap">
                  {topic.body}
                </p>
              </div>
            )}

            {/* Comments section */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground mb-6 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-orange-500" />
                {copy.commentsTitle} ({comments.length})
              </p>

              <div className="space-y-4 mb-10">
                {comments.map((comment, i) => (
                  <div key={comment.id} className={`forum-comment-card p-5 md:p-6 animate-fade-in-up delay-${((i % 5) + 1) * 100} ${'status' in comment && comment.status === 'hidden' ? 'opacity-60' : ''}`}>
                    <div className="flex gap-3.5">
                      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-border/15">
                        <AvatarFallback className={`bg-gradient-to-br ${getGradient(comment.author_name)} text-white text-sm font-semibold`}>
                          {comment.author_initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-sm">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                          {'status' in comment && comment.status === 'hidden' && (
                            <Badge variant="outline" className="text-xs border-red-200 text-red-500 bg-red-50 dark:bg-red-950/30 rounded-full">Skriveno</Badge>
                          )}
                        </div>
                        <p className="text-[15px] text-foreground/85 leading-7">{comment.content}</p>
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/20">
                          <ForumTopicActions commentId={comment.id} initialLikes={comment.likes} compact />
                          <button className="text-xs text-muted-foreground hover:text-orange-500 transition-colors font-medium">
                            {copy.reply}
                          </button>
                          <ForumModerateControls targetType="comment" targetId={comment.id} status={'status' in comment ? (comment.status as 'active' | 'hidden') ?? 'active' : 'active'} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              <div className="forum-original-post p-6 md:p-7">
                <CommentForm topicId={id} />
              </div>
            </div>
          </div>

          {/* Sidebar — related topics */}
          <div>
            {related.length > 0 && (
              <div className="forum-sidebar-panel p-6 sticky top-20">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground mb-5 flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-orange-500" />
                  {copy.related}
                </p>
                <div className="space-y-3">
                  {related.map(t => {
                    const relCat = FORUM_CATEGORIES.find(c => c.slug === t.category_slug);
                    return (
                      <Link key={t.id} href={`/forum/${t.id}`} className="group block">
                        <div className="flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-accent/50">
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-border/20">
                            <AvatarFallback className={`bg-gradient-to-br ${t.author_gradient} text-white text-xs font-semibold`}>
                              {t.author_initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">{t.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                              {relCat && <span>{relCat.emoji}</span>}
                              <span>{t.author_name}</span>
                              <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {t.likes}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <InternalLinkSection
        eyebrow={copy.needHelpEyebrow}
        title={copy.needHelpTitle}
        description={copy.needHelpDescription}
        items={[
          ...SEARCH_DISCOVERY_LINKS.slice(0, 3),
          ...CONTENT_DISCOVERY_LINKS.slice(0, 2),
        ]}
      />
    </div>
  );
}
