'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MessageCircle, Heart, Pin, Flame, Plus, TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/shared/image-upload';
import { FORUM_CATEGORIES, type ForumCategorySlug, type ForumTopic } from '@/lib/types';
import { getCoverStyle } from '@/lib/forum/cover-images';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/context';
import { ForumModerateControls } from './[id]/moderate-controls';

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
  return new Date(dateStr).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
}

interface NewPostFormProps {
  onSuccess: (topic: ForumTopic) => void;
}

function NewPostForm({ onSuccess }: NewPostFormProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

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
        body: JSON.stringify({ title, category_slug: category, body: content, ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}) }),
      });

      if (res.status === 401) {
        toast.error(isEn ? 'Please log in to post.' : 'Prijavite se da biste objavili post.');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Server error');
      }

      const data = await res.json();
      toast.success(isEn ? 'Post published!' : 'Post je objavljen!');
      setTitle('');
      setCategory('');
      setContent('');
      setCoverImageUrl(null);
      onSuccess(data.topic as ForumTopic);
    } catch (err) {
      toast.error(isEn ? 'Failed to publish post.' : 'Greška pri objavi posta.');
      console.error('NewPostForm error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 mt-4">
      <div>
        <Label htmlFor="post-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isEn ? 'Title' : 'Naslov'}</Label>
        <Input id="post-title" placeholder={isEn ? 'Enter post title...' : 'Unesite naslov posta...'} className="mt-2 h-12 rounded-xl border-border/60 focus-visible:ring-orange-500" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="post-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isEn ? 'Category' : 'Kategorija'}</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
          <SelectTrigger className="mt-2 h-12 rounded-xl border-border/60">
            <SelectValue placeholder={isEn ? 'Choose category' : 'Odaberite kategoriju'} />
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
        <Label htmlFor="post-content" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isEn ? 'Content' : 'Sadržaj'}</Label>
        <Textarea id="post-content" placeholder={isEn ? 'Write your post...' : 'Napišite svoj post...'} className="mt-2 min-h-[120px] rounded-xl border-border/60" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isEn ? 'Cover image (optional)' : 'Naslovna slika (opcionalno)'}</Label>
        <div className="mt-2">
          <ImageUpload variant="dropzone" maxFiles={1} bucket="pet-photos" entityId="forum" onUploadComplete={(urls) => setCoverImageUrl(urls[0] ?? null)} />
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl h-12 font-semibold text-base btn-hover">
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
  const [activeCategory, setActiveCategory] = useState<ForumCategorySlug | 'sve'>('sve');
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<ForumTopic[]>(initialTopics);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTopics = useMemo(() => {
    let result = activeCategory === 'sve'
      ? topics
      : topics.filter(t => t.category_slug === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.author_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery, topics]);

  const trending = initialTrending;

  const getCategoryInfo = (slug: ForumCategorySlug) =>
    FORUM_CATEGORIES.find(c => c.slug === slug);

  const handleNewTopic = (newTopic: ForumTopic) => {
    setTopics(prev => [newTopic, ...prev]);
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10 md:py-14">
      {/* Lost Pets Banner — premium editorial */}
      <Link href="/izgubljeni" className="block mb-10 group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 p-6 md:p-7 text-white shadow-lg shadow-red-200/30 dark:shadow-red-900/20 hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.07]">
            <AlertTriangle className="w-full h-full" />
          </div>
          <div className="flex items-center gap-5 relative">
            <div className="flex-shrink-0 bg-white/15 rounded-2xl p-3.5 backdrop-blur-sm">
              <AlertTriangle className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold mb-1 font-[var(--font-heading)]">{isEn ? 'Lost pets' : 'Izgubljeni ljubimci'}</h3>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {isEn ? 'Report or find a lost pet. The map and reports are live, with more notifications coming later.' : 'Prijavite ili pronađite izgubljenog ljubimca. Mapa i dojave su aktivni, a dodatne obavijesti dolaze kasnije.'}
              </p>
            </div>
            <ArrowRight className="h-6 w-6 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </Link>

      {/* Search + New Post — premium toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder={isEn ? 'Search posts...' : 'Pretraži postove...'}
            className="forum-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-md shadow-orange-200/40 dark:shadow-orange-900/20 btn-hover rounded-xl h-12 px-6 font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            {isEn ? 'New post' : 'Novi post'}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="font-[var(--font-heading)] text-xl">{isEn ? 'New post' : 'Novi post'}</DialogTitle>
            </DialogHeader>
            <NewPostForm onSuccess={handleNewTopic} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Category pills — premium toggles */}
      <div className="flex flex-wrap gap-2.5 mb-10">
        <button onClick={() => setActiveCategory('sve')}>
          <span
            className={`forum-category-pill inline-flex items-center cursor-pointer ${
              activeCategory === 'sve'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-card border border-border/40 text-foreground/70 hover:text-foreground'
            }`}
            data-active={activeCategory === 'sve'}
          >
            {isEn ? 'All' : 'Sve'}
          </span>
        </button>
        {FORUM_CATEGORIES.map(cat => (
          <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)}>
            <span
              className={`forum-category-pill inline-flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.slug
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-card border border-border/40 text-foreground/70 hover:text-foreground'
              }`}
              data-active={activeCategory === cat.slug}
            >
              {cat.emoji} {cat.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Post list — editorial cards */}
        <div className="lg:col-span-2 space-y-4">
          {filteredTopics.length === 0 && (
            <div className="forum-topic-card overflow-hidden">
              <div className="bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-orange-950/20 dark:via-card dark:to-teal-950/20 text-center py-16 px-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border/30 dark:bg-card">
                  <MessageCircle className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-xl font-bold text-foreground mb-2 font-[var(--font-heading)]">
                  {isEn ? 'This corner of the community is ready for a fresh topic' : 'Ovaj kutak zajednice čeka svježu temu'}
                </p>
                <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-7 leading-relaxed">
                  {isEn ? 'Ask something useful, share a real-life tip, or open a fun pet story.' : 'Postavi korisno pitanje, podijeli stvarni savjet ili otvori zabavnu pet priču.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <span className="rounded-full bg-white/80 dark:bg-card px-4 py-2 shadow-sm ring-1 ring-border/30">{isEn ? 'Questions' : 'Pitanja'}</span>
                  <span className="rounded-full bg-white/80 dark:bg-card px-4 py-2 shadow-sm ring-1 ring-border/30">{isEn ? 'Advice' : 'Savjeti'}</span>
                  <span className="rounded-full bg-white/80 dark:bg-card px-4 py-2 shadow-sm ring-1 ring-border/30">{isEn ? 'Stories' : 'Priče'}</span>
                </div>
              </div>
            </div>
          )}
          {filteredTopics.map((topic, i) => {
            const cat = getCategoryInfo(topic.category_slug);
            const cover = getCoverStyle(topic.category_slug);
            return (
              <Link key={topic.id} href={`/forum/${topic.id}`}>
                <article className={`group forum-topic-card overflow-hidden animate-fade-in-up delay-${((i % 5) + 1) * 100}`}>
                  {/* Cover image or category accent strip */}
                  {topic.cover_image_url ? (
                    <div className="relative h-36 md:h-40 overflow-hidden">
                      <Image src={topic.cover_image_url} alt="" fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cover.gradient}`} />
                    </div>
                  ) : (
                    <div className={`relative h-1.5 bg-gradient-to-r ${cover.gradient}`} />
                  )}
                  <div className="p-5 md:p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-11 w-11 flex-shrink-0 mt-0.5 ring-2 ring-border/20">
                        <AvatarFallback className={`bg-gradient-to-br ${topic.author_gradient} text-white text-sm font-semibold`}>
                          {topic.author_initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {topic.is_pinned && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                              <Pin className="h-3 w-3" />
                            </span>
                          )}
                          {topic.is_hot && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                              <Flame className="h-3 w-3" />
                            </span>
                          )}
                          {topic.status === 'hidden' && (
                            <Badge variant="outline" className="text-xs border-red-200 text-red-500 bg-red-50 dark:bg-red-950/30 rounded-full">
                              Skriveno
                            </Badge>
                          )}
                          {cat && (
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cat.color}`}>
                              {cat.emoji} {cat.name}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base md:text-[17px] group-hover:text-orange-500 transition-colors line-clamp-2 mb-2 font-[var(--font-heading)]">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {topic.body || (isEn ? 'Open the discussion and join the replies.' : 'Otvori raspravu i uključi se u komentare.')}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">{topic.author_name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(topic.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {topic.comment_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {topic.likes}
                          </span>
                          <ForumModerateControls targetType="topic" targetId={topic.id} status={topic.status ?? 'active'} />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Sidebar — premium glass panels */}
        <div className="space-y-6">
          {/* Trending */}
          <div className="forum-sidebar-panel p-6">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-warm-orange mb-1.5 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              {isEn ? 'Trending' : 'Popularno'}
            </p>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {isEn ? 'Topics with enough pull to spark more replies.' : 'Teme koje povlače još odgovora.'}
            </p>
            <div className="space-y-4">
              {trending.length === 0 && (
                <div className="rounded-xl bg-warm-cream/60 dark:bg-warm-cream/5 px-4 py-5 text-sm text-muted-foreground leading-relaxed">
                  {isEn ? 'Nothing is trending yet — ideal time to start the next good one.' : 'Još ništa ne trenda — idealan trenutak za sljedeću dobru temu.'}
                </div>
              )}
              {trending.map((topic, i) => {
                const cat = getCategoryInfo(topic.category_slug);
                return (
                  <Link key={topic.id} href={`/forum/${topic.id}`} className="group flex items-start gap-3">
                    <span className="forum-trending-rank flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
                        {topic.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        {cat && <span>{cat.emoji}</span>}
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3 w-3" /> {topic.likes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="h-3 w-3" /> {topic.comment_count}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Category overview */}
          <div className="forum-sidebar-panel p-6">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground mb-5">{isEn ? 'Categories' : 'Kategorije'}</p>
            <div className="space-y-1">
              {FORUM_CATEGORIES.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`flex items-center gap-3.5 w-full p-3 rounded-xl transition-all text-left ${
                    activeCategory === cat.slug
                      ? 'bg-orange-50 dark:bg-orange-950/30 shadow-sm'
                      : 'hover:bg-accent/60'
                  }`}
                >
                  <span className="text-xl leading-none">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${activeCategory === cat.slug ? 'text-orange-600 dark:text-orange-400' : ''}`}>{cat.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
