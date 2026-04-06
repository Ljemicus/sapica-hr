'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Heart, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { PetUpdate } from '@/lib/types';

interface PhotoGalleryProps {
  updates: PetUpdate[];
  sitterName: string;
  petName: string;
}

export function PhotoGallery({ updates, sitterName, petName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Filter only photo/video updates with actual photos
  const photoUpdates = updates.filter(
    (u) => (u.type === 'photo' || u.type === 'video') && u.photo_url
  );

  if (photoUpdates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Još nema fotografija za ovu rezervaciju.</p>
        <p className="text-sm mt-1">Fotografije koje sitter pošalje pojavit će se ovdje.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : photoUpdates.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < photoUpdates.length - 1 ? selectedIndex + 1 : 0);
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedPhoto = selectedIndex !== null ? photoUpdates[selectedIndex] : null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photoUpdates.map((update, index) => (
          <button
            key={update.id}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group hover:ring-2 hover:ring-orange-400 transition-all"
          >
            <Image
              src={update.photo_url!}
              alt={update.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs truncate">{update.caption}</p>
                <p className="text-white/70 text-[10px]">
                  {format(new Date(update.created_at), 'd. MMM', { locale: hr })}
                </p>
              </div>
            </div>
            {update.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-0">
          {selectedPhoto && (
            <div className="relative">
              {/* Image */}
              <div className="relative aspect-[4/3] md:aspect-video">
                <Image
                  src={selectedPhoto.photo_url!}
                  alt={selectedPhoto.caption}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>

              {/* Controls */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/0 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{selectedPhoto.emoji}</span>
                      <Badge className="bg-white/20 text-white border-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(selectedPhoto.created_at), 'd. MMMM yyyy., HH:mm', { locale: hr })}
                      </Badge>
                    </div>
                    <p className="text-white text-lg">{selectedPhoto.caption}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {petName} • {sitterName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleLike(selectedPhoto.id)}
                      className={`rounded-full ${
                        likedIds.has(selectedPhoto.id) ? 'text-red-500' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${likedIds.has(selectedPhoto.id) ? 'fill-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-white/70 hover:text-white"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedPhoto.photo_url!;
                        link.download = `petpark-${selectedPhoto.id}.jpg`;
                        link.click();
                      }}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Counter */}
                <p className="text-white/40 text-sm mt-4">
                  {selectedIndex! + 1} / {photoUpdates.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
