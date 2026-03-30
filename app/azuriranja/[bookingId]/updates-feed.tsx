'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Heart, Filter, ArrowLeft, Camera, Send, Image, Video, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

import { ImageUpload } from '@/components/shared/image-upload';
import type { PetUpdate } from '@/lib/types';

interface Props {
  updates: PetUpdate[];
  bookingId: string;
  sitterName: string;
  petName: string;
  currentDay: number;
  totalDays: number;
  sitterId: string;
}

const typeIcons: Record<string, React.ElementType> = {
  photo: Image,
  video: Video,
  text: FileText,
};

const typeLabels: Record<string, string> = {
  photo: 'Fotografija',
  video: 'Video',
  text: 'Tekst',
};

export function UpdatesFeed({ updates, bookingId, sitterName, petName, currentDay, totalDays }: Props) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [filterDay, setFilterDay] = useState<string>('all');
  const [showSitterForm, setShowSitterForm] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newEmoji, setNewEmoji] = useState('🐕');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group by day
  const days = [...new Set(updates.map(u => format(new Date(u.created_at), 'yyyy-MM-dd')))].sort();

  const filtered = filterDay === 'all'
    ? updates
    : updates.filter(u => format(new Date(u.created_at), 'yyyy-MM-dd') === filterDay);

  const emojiOptions = ['🐕', '🌳', '🏖️', '😴', '🦴', '🐾', '🎾', '💤', '🍽️', '💊'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
      </Link>

      {/* Header Stats */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Ažuriranja za {petName}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-orange-100 text-orange-700 border-0">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Dan {currentDay} od {totalDays}
          </Badge>
          <span className="text-sm text-muted-foreground">Sitter: {sitterName}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{updates.length} ažuriranja</span>
        </div>
      </div>

      {/* Day Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in-up delay-100">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <button
          onClick={() => setFilterDay('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
            filterDay === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sve
        </button>
        {days.map(day => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
              filterDay === day ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {format(new Date(day), 'd. MMM', { locale: hr })}
          </button>
        ))}
      </div>

      {/* Sitter Form Toggle */}
      <div className="mb-6 animate-fade-in-up delay-100">
        <Button
          variant="outline"
          className="w-full hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
          onClick={() => setShowSitterForm(!showSitterForm)}
        >
          <Camera className="h-4 w-4 mr-2" />
          {showSitterForm ? 'Zatvori formu' : 'Pošalji ažuriranje (sitter)'}
        </Button>
        {showSitterForm && (
          <Card className="mt-3 border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {emojiOptions.map(e => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={`text-2xl p-1.5 rounded-lg transition-colors ${newEmoji === e ? 'bg-orange-100 ring-2 ring-orange-300' : 'hover:bg-gray-100'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Textarea
                value={newCaption}
                onChange={e => setNewCaption(e.target.value)}
                placeholder="Opišite što se trenutno događa..."
                rows={3}
                className="focus:border-orange-300"
              />
              <ImageUpload variant="dropzone" maxFiles={3} bucket="pet-photos" entityId={`updates/${bookingId}`} onUploadComplete={(urls) => setUploadedImages(urls)} />
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover"
                  onClick={() => { setNewCaption(''); setShowSitterForm(false); }}
                  disabled={!newCaption.trim()}
                >
                  <Send className="h-4 w-4 mr-1" /> Pošalji
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline Feed */}
      <div className="relative animate-fade-in-up delay-200">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-orange-200" />

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nema ažuriranja za odabrani dan.
            </div>
          ) : (
            filtered.map((update) => {
              const Icon = typeIcons[update.type];
              return (
                <div key={update.id} className="relative flex gap-4 pl-2">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 border-2 border-orange-300 mt-3 flex-shrink-0">
                    <span className="text-sm">{update.emoji}</span>
                  </div>
                  {/* Card */}
                  <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Emoji visual placeholder */}
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 mb-3 text-center border border-orange-100/50">
                        <span className="text-5xl">{update.emoji}</span>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs bg-white/80">
                            <Icon className="h-3 w-3 mr-1" />
                            {typeLabels[update.type]}
                          </Badge>
                        </div>
                      </div>
                      {/* Caption */}
                      <p className="text-sm leading-relaxed mb-3">{update.caption}</p>
                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {format(new Date(update.created_at), 'd. MMM, HH:mm', { locale: hr })}
                        </span>
                        <button
                          onClick={() => toggleLike(update.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                            likedIds.has(update.id)
                              ? 'text-red-500 bg-red-50'
                              : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${likedIds.has(update.id) ? 'fill-red-500' : ''}`} />
                          {likedIds.has(update.id) ? '1' : ''}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
