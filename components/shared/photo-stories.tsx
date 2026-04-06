'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { PetUpdate } from '@/lib/types';

interface Story {
  id: string;
  photo_url: string;
  caption: string;
  emoji: string;
  created_at: string;
  sitterName: string;
  petName: string;
}

interface PhotoStoriesProps {
  updates: PetUpdate[];
  sitterName: string;
  petName: string;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function PhotoStories({ updates, sitterName, petName }: PhotoStoriesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Filter stories from last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const stories: Story[] = updates
    .filter(
      (u) =>
        (u.type === 'photo' || u.type === 'video') &&
        u.photo_url &&
        new Date(u.created_at) >= twentyFourHoursAgo
    )
    .map((u) => ({
      id: u.id,
      photo_url: u.photo_url!,
      caption: u.caption,
      emoji: u.emoji,
      created_at: u.created_at,
      sitterName,
      petName,
    }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const currentStory = stories[currentIndex];

  // Auto-advance stories
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // Close when done
            setIsOpen(false);
            return 0;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, stories.length]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const toggleLike = () => {
    if (!currentStory) return;
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentStory.id)) next.delete(currentStory.id);
      else next.add(currentStory.id);
      return next;
    });
  };

  if (stories.length === 0) return null;

  return (
    <>
      {/* Story Preview Bar */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => {
                setCurrentIndex(index);
                setIsOpen(true);
              }}
              className="flex-shrink-0 relative"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 to-pink-500">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-100">
                  <Image
                    src={story.photo_url}
                    alt={story.caption}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-xs text-center mt-1 truncate max-w-[64px]">
                {formatDistanceToNow(new Date(story.created_at), { locale: hr, addSuffix: false })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Full Screen Story Viewer */}
      {isOpen && currentStory && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentStory.emoji}</span>
              <div>
                <p className="text-white font-medium">{currentStory.petName}</p>
                <p className="text-white/60 text-sm">
                  {formatDistanceToNow(new Date(currentStory.created_at), { locale: hr, addSuffix: true })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={currentStory.photo_url}
              alt={currentStory.caption}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Navigation Zones */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
            disabled={currentIndex === 0}
          />
          <button
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
          />

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Bottom Info */}
          <div className="absolute bottom-8 left-4 right-4 z-10">
            <p className="text-white text-lg mb-4">{currentStory.caption}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLike}
                  className={`rounded-full ${
                    likedIds.has(currentStory.id)
                      ? 'text-red-500'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Heart
                    className={`h-6 w-6 ${likedIds.has(currentStory.id) ? 'fill-red-500' : ''}`}
                  />
                </Button>
              </div>
              <p className="text-white/40 text-sm">
                {currentIndex + 1} / {stories.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
