'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MessageCircle, Heart, Pin, Flame, Plus, TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/shared/image-upload';
import { FORUM_CATEGORIES, type ForumCategorySlug, type ForumTopic } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';

function timeAgo(dateStr: string, isEn: boolean) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return isEn ? `${minutes} min ago` : `prije ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isEn ? `${hours}h ago` : `prije ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return isEn ? 'yesterday' : 'jučer';
  if (days < 7) return isEn ? `${days} days ago` : `prije ${days} dana`;
  return new Date(dateStr).toLocaleDateString(isEn ? 'en-GB' : 'hr-HR', { day: 'numeric', month: 'short' });
}

function NewPostForm({ onCreated }: { onCreated: (topic: ForumTopic) => void }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [, setUploadedImages] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!title.trim() || !category || !content.trim()) {
      toast.error(isEn ? 'Please fill in all required fields.' : 'Molimo ispunite sva obavezna polja.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category_slug: category,
          body: content,
        }),
      });
      if (res.status === 401) {
        toast.error(isEn ? 'Please sign in to publish.' : 'Prijavite se da biste objavili temu.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.topic) {
        throw new Error(data?.error || 'Create topic failed');
      }
      onCreated(data.topic as ForumTopic);
      toast.success(isEn ? 'Post published!' : 'Post je objavljen!');
      setTitle('');
      setCategory('');
      setContent('');
    } catch (error) {
      console.error('Forum create topic failed:', error);
      toast.error(isEn ? 'Failed to publish post.' : 'Objava teme nije uspjela.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="post-title">{isEn ? 'Title' : 'Naslov'}</Label>
        <Input id="post-title" placeholder={isEn ? 'Enter a post title...' : 'Unesite naslov posta...'} className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="post-category">{isEn ? 'Category' : 'Kategorija'}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder={isEn ? 'Choose a category' : 'Odaberite kategoriju'} />
          </SelectTrigger>
          <SelectContent>
            {FORUM_CATEGORIES.map(cat => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.emoji} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="post-content">{isEn ? 'Content' : 'Sadržaj'}</Label>
        <Textarea id="post-content" placeholder={isEn ? 'Write your post...' : 'Napišite svoj post...'} className="mt-1.5 min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div>
        <Label>{isEn ? 'Image (optional)' : 'Slika (opcionalno)'}</Label>
        <div className="mt-1.5">
          <ImageUpload variant="dropzone" maxFiles={3} bucket="pet-photos" entityId="forum" onUploadComplete={(urls) => setUploadedImages(urls)} />
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl font-semibold">
        {submitting ? (isEn ? 'Publishing...' : 'Objavljujem...') : (isEn ? 'Publish post' : 'Objavi post')}
      </Button>
    </div>
  );
}

interface ForumContentProps {
  initialTopics: ForumTopic[];
  initialTrending: ForumTopic[];
}

export function ForumContent({ initialTopics, initialTrending }: ForumContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ForumCategorySlug | 'sve'>('sve');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicsState, setTopicsState] = useState(initialTopics);
  const [trendingState, setTrendingState] = useState(initialTrending);
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  const topics = useMemo(() => {
    let result = activeCategory === 'sve'
      ? topicsState
      : topicsState.filter(t => t.category_slug === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.author_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery, topicsState]);

  const trending = trendingState;

  const handleTopicCreated = (topic: ForumTopic) => {
    setTopicsState((prev) => [topic, ...prev]);
    setTrendingState((prev) => {
      const next = [topic, ...prev.filter((item) => item.id !== topic.id)];
      return next.slice(0, 5);
    });
    setPostDialogOpen(false);
    router.refresh();
  };

  const getCategoryInfo = (slug: ForumCategorySlug) =>
    FORUM_CATEGORIES.find(c => c.slug === slug);

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <Link href="/izgubljeni" className="block mb-8 group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 p-5 md:p-6 text-white shadow-lg shadow-red-200/40 dark:shadow-red-900/30 hover:shadow-xl hover:shadow-red-200/50 dark:hover:shadow-red-900/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-10">
            <AlertTriangle className="w-full h-full" />
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="flex-shrink-0 bg-white/20 rounded-xl p-3">
              <AlertTriangle className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold mb-1">{isEn ? '🔍 Lost pets' : '🔍 Izgubljeni ljubimci'}</h3>
              <p className="text-sm md:text-base text-white/85">
                {isEn
                  ? 'Report a missing pet or help identify one. The map and reports are live, with more alerts coming later.'
                  : 'Prijavite ili pronađite izgubljenog ljubimca. Mapa i dojave su aktivni, a dodatne obavijesti dolaze kasnije.'}
              </p>
            </div>
            <ArrowRight className="h-6 w-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder={isEn ? 'Search posts...' : 'Pretraži postove...'}
            className="pl-10 rounded-xl border-border focus-visible:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
          <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30 btn-hover rounded-xl font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            {isEn ? 'New post' : 'Novi post'}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEn ? 'New post' : 'Novi post'}</DialogTitle>
            </DialogHeader>
            <NewPostForm onCreated={handleTopicCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setActiveCategory('sve')}>
          <Badge
            variant="outline"
            className={`px-4 py-2 text-sm cursor-pointer hover:shadow-md transition-all ${
              activeCategory === 'sve' ? 'bg-orange-500 text-white border-orange-500' : 'hover:border-orange-300'
            }`}
          >
            {isEn ? 'All' : 'Sve'}
          </Badge>
        </button>
        {FORUM_CATEGORIES.map(cat => (
          <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)}>
            <Badge
              variant="outline"
              className={`px-4 py-2 text-sm cursor-pointer hover:shadow-md transition-all ${
                activeCategory === cat.slug ? cat.color + ' font-semibold shadow-sm' : ''
              }`}
            >
              {cat.emoji} {cat.name}
            </Badge>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {topics.length === 0 && (
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-orange-950/20 dark:via-background dark:to-teal-950/20">
              <CardContent className="text-center py-14 px-6">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-orange-100 dark:bg-background dark:ring-orange-900/40">
                  <MessageCircle className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xl font-bold text-foreground mb-2">
                  {isEn ? 'This conversation space is waiting for its first post' : 'Ovaj kutak zajednice čeka svoju prvu objavu'}
                </p>
                <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
                  {isEn
                    ? 'Ask something useful, share a real tip, or start a casual pet story. The best communities usually begin with one honest question.'
                    : 'Postavi konkretno pitanje, podijeli koristan savjet ili otvori laganu pet temu. Dobre zajednice obično krenu od jednog normalnog pitanja.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-border">{isEn ? 'Questions' : 'Pitanja'}</span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-border">{isEn ? 'Advice' : 'Savjeti'}</span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-border">{isEn ? 'Stories' : 'Priče'}</span>
                  <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-border">{isEn ? 'Lost pets' : 'Izgubljeni ljubimci'}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {topics.map((topic, i) => {
            const cat = getCategoryInfo(topic.category_slug);
            return (
              <Link key={topic.id} href={`/forum/${topic.id}`}>
                <Card className={`group card-hover border border-orange-100/60 dark:border-orange-900/20 shadow-sm hover:shadow-lg hover:-translate-y-0.5 rounded-2xl overflow-hidden bg-white/95 dark:bg-background animate-fade-in-up delay-${((i % 5) + 1) * 100}`}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5">
                        <AvatarFallback className={`bg-gradient-to-br ${topic.author_gradient} text-white text-sm font-medium`}>
                          {topic.author_initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {topic.is_pinned && (
                            <Pin className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                          )}
                          {topic.is_hot && (
                            <Flame className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          )}
                          {cat && (
                            <Badge variant="outline" className={`text-xs ${cat.color}`}>
                              {cat.emoji} {cat.name}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-base group-hover:text-orange-500 transition-colors line-clamp-1 mb-1.5">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                          {isEn
                            ? 'Open the discussion to read replies and join in.'
                            : 'Otvori temu za cijelu raspravu i uključi se komentarom.'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">{topic.author_name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(topic.created_at, isEn)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {topic.comment_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {topic.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="border border-orange-100/60 dark:border-orange-900/20 shadow-sm rounded-2xl overflow-hidden bg-white/95 dark:bg-background">
            <CardContent className="p-5">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                {isEn ? 'Trending' : 'Popularno'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEn ? 'Topics people are most likely to open first.' : 'Teme koje najviše vuku prvi klik i raspravu.'}
              </p>
              <div className="space-y-3">
                {trending.length === 0 && (
                  <div className="rounded-2xl bg-orange-50/80 dark:bg-orange-950/20 px-4 py-5 text-sm text-muted-foreground">
                    {isEn ? 'No trending topics yet — perfect moment for the first good one.' : 'Još nema popularnih tema — idealan trenutak za prvu dobru objavu.'}
                  </div>
                )}
                {trending.map((topic, i) => {
                  const cat = getCategoryInfo(topic.category_slug);
                  return (
                    <Link key={topic.id} href={`/forum/${topic.id}`} className="block group">
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-bold text-muted-foreground/30 flex-shrink-0 w-6 text-right">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-orange-500 transition-colors">
                            {topic.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {cat && <span>{cat.emoji}</span>}
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-3 w-3" /> {topic.likes}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MessageCircle className="h-3 w-3" /> {topic.comment_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-100/60 dark:border-orange-900/20 shadow-sm rounded-2xl overflow-hidden bg-white/95 dark:bg-background">
            <CardContent className="p-5">
              <h3 className="font-bold text-base mb-4">{isEn ? 'Categories' : 'Kategorije'}</h3>
              <div className="space-y-2">
                {FORUM_CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
