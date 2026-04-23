'use client';

import { useState, useCallback, useRef } from 'react';
import { ImagePlus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { OptimizedImage } from '@/components/shared/optimized-image';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Pet } from '@/lib/types';
import type { AITags } from '@/lib/types/social';

interface CreatePostProps {
  pets: Pet[];
  onPostCreated: () => void;
  challengeId?: string;
}

// Simulated AI tagging - in production this would call an AI service
async function generateAITags(content: string, _hasImages: boolean): Promise<AITags> {
  const tags: AITags = {
    petTypes: [],
    activities: [],
    locations: [],
  };

  const contentLower = content.toLowerCase();

  // Pet type detection
  if (contentLower.includes('pas') || contentLower.includes('psi') || contentLower.includes('štene')) {
    tags.petTypes.push('dog');
  }
  if (contentLower.includes('mačka') || contentLower.includes('mačke') || contentLower.includes('mačić')) {
    tags.petTypes.push('cat');
  }
  if (contentLower.includes('kunić') || contentLower.includes('zec')) {
    tags.petTypes.push('rabbit');
  }
  if (contentLower.includes('ptica') || contentLower.includes('papagaj')) {
    tags.petTypes.push('bird');
  }

  // Activity detection
  if (contentLower.includes('igra') || contentLower.includes('igramo')) {
    tags.activities.push('playing');
  }
  if (contentLower.includes('spava') || contentLower.includes('san')) {
    tags.activities.push('sleeping');
  }
  if (contentLower.includes('jede') || contentLower.includes('hrana')) {
    tags.activities.push('eating');
  }
  if (contentLower.includes('šetnja') || contentLower.includes('šetamo')) {
    tags.activities.push('walking');
  }
  if (contentLower.includes('plivanje') || contentLower.includes('more')) {
    tags.activities.push('swimming');
  }
  if (contentLower.includes('treniranje') || contentLower.includes('vježba')) {
    tags.activities.push('training');
  }
  if (contentLower.includes('grlim') || contentLower.includes('mazim')) {
    tags.activities.push('cuddling');
  }
  if (contentLower.includes('istražujemo') || contentLower.includes('avantura')) {
    tags.activities.push('exploring');
  }

  // Location detection
  if (contentLower.includes('kuća') || contentLower.includes('doma')) {
    tags.locations.push('home');
  }
  if (contentLower.includes('park')) {
    tags.locations.push('park');
  }
  if (contentLower.includes('plaža') || contentLower.includes('more')) {
    tags.locations.push('beach');
  }
  if (contentLower.includes('planina') || contentLower.includes('šuma')) {
    tags.locations.push('mountain');
  }
  if (contentLower.includes('grad')) {
    tags.locations.push('city');
  }

  return tags;
}

// Simulated AI caption generation
async function generateAICaption(content: string, petName?: string): Promise<string> {
  const captions = [
    `🐾 ${petName || 'Ljubimac'} uživa u svakom trenutku!`,
    `💕 Trenutak koji vrijedi podijeliti`,
    `🌟 Pravi mali zvijezda`,
    `❤️ Ljubav na prvi pogled`,
    `🎉 Dan puni radosti i veselja`,
  ];
  
  return captions[Math.floor(Math.random() * captions.length)];
}

export function CreatePost({ pets, onPostCreated, challengeId }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTags, setAiTags] = useState<AITags | null>(null);
  const [aiCaption, setAiCaption] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, upload to storage and get URLs
    // For now, create object URLs for preview
    const newImages = Array.from(files).slice(0, 4 - images.length).map(file => {
      return URL.createObjectURL(file);
    });

    setImages(prev => [...prev, ...newImages].slice(0, 4));
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleGenerateAI = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Unesite sadržaj objave za AI analizu');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      const [tags, caption] = await Promise.all([
        generateAITags(content, images.length > 0),
        generateAICaption(content, selectedPet?.name),
      ]);

      setAiTags(tags);
      setAiCaption(caption);
      toast.success('AI tagovi generirani!');
    } catch {
      toast.error('Greška prilikom generiranja AI tagova');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [content, images.length, pets, selectedPetId]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Unesite sadržaj objave');
      return;
    }

    if (!user) {
      toast.error('Morate biti prijavljeni');
      return;
    }

    setIsSubmitting(true);
    try {
      const allTags = [
        ...(aiTags?.petTypes || []),
        ...(aiTags?.activities || []),
        ...(aiTags?.locations || []),
      ];

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrls: images,
          petId: selectedPetId || null,
          aiTags: allTags,
          aiCaption: aiCaption || null,
          challengeId: challengeId || null,
        }),
      });

      if (response.ok) {
        toast.success('Objava uspješno objavljena!');
        setContent('');
        setSelectedPetId('');
        setImages([]);
        setAiTags(null);
        setAiCaption('');
        onPostCreated();
      } else {
        throw new Error('Failed to create post');
      }
    } catch {
      toast.error('Greška prilikom objavljivanja');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, user, images, selectedPetId, aiTags, aiCaption, challengeId, onPostCreated]);

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Prijavite se da biste objavljivali na zajednici
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="Podijelite trenutak s vašim ljubimcem..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0 text-base"
            />

            {/* Pet Selector */}
            {pets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-muted-foreground self-center">S ljubimcem:</span>
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(selectedPetId === pet.id ? '' : pet.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                      selectedPetId === pet.id
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span>{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}</span>
                    {pet.name}
                  </button>
                ))}
              </div>
            )}

            {/* Image Preview */}
            {images.length > 0 && (
              <div className={`grid gap-2 mt-3 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {images.map((image, i) => (
                  <div key={i} className="relative aspect-video">
                    <OptimizedImage src={image} alt={`Upload ${i + 1}`} width={400} height={225} className="rounded-lg" objectFit="cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Tags Preview */}
            {aiTags && (
              <div className="flex flex-wrap gap-1 mt-3">
                {aiTags.petTypes.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                    #{tag}
                  </Badge>
                ))}
                {aiTags.activities.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-green-50 text-green-700">
                    #{tag}
                  </Badge>
                ))}
                {aiTags.locations.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* AI Caption Preview */}
            {aiCaption && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI opis: {aiCaption}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 4}
                >
                  <ImagePlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Fotografija</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI || !content.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isGeneratingAI ? 'Generiram...' : 'AI Tagovi'}
                  </span>
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                size="sm"
              >
                {isSubmitting ? 'Objavljujem...' : 'Objavi'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
