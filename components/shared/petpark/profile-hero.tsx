'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, Check, MapPin, Star, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useState } from 'react';

export type ProfileHeroBadge = {
  icon: 'specialization' | 'verified' | 'certified' | 'superhost' | 'instant' | 'custom';
  label: string;
  customIcon?: React.ReactNode;
};

interface ProfileHeroProps {
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  profileImage?: string | null;
  badges?: ProfileHeroBadge[];
  extraMeta?: Array<{ icon: React.ReactNode; label: string }>;
  hasPhotoBackground?: boolean;
}

export function ProfileHero({
  name,
  city,
  rating,
  reviewCount,
  profileImage,
  badges = [],
  extraMeta = [],
  hasPhotoBackground = false,
}: ProfileHeroProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link kopiran!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nije moguće kopirati link');
    }
  };

  const textColor = hasPhotoBackground ? 'text-white' : 'text-foreground';
  const mutedColor = hasPhotoBackground ? 'text-white/85' : 'text-muted-foreground';

  return (
    <section className="relative overflow-hidden min-h-[70vh] md:min-h-[75vh] flex flex-col">
      {/* Background */}
      {!hasPhotoBackground && (
        <>
          <div className="absolute inset-0 detail-hero-gradient" />
          <div className="absolute inset-0 paw-pattern opacity-[0.04]" />
        </>
      )}

      {/* Navigation bar */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pt-6 md:pt-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className={`rounded-full h-10 px-4 ${hasPhotoBackground ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'}`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Natrag
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className={`rounded-full h-10 px-4 ${hasPhotoBackground ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'}`}
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
            {copied ? 'Kopirano!' : 'Podijeli'}
          </Button>
        </div>
      </div>

      {/* Hero content — pushed to bottom */}
      <div className="flex-1" />
      <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-3xl">
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5 animate-fade-in-up">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm ${
                    hasPhotoBackground
                      ? 'bg-white/95 text-orange-600'
                      : 'bg-warm-peach text-orange-700 dark:bg-warm-orange/20 dark:text-orange-400'
                  }`}
                >
                  {badge.icon === 'verified' && <Shield className="h-3 w-3" />}
                  {badge.icon === 'certified' && <Award className="h-3 w-3" />}
                  {badge.icon === 'custom' && badge.customIcon}
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* Identity */}
          <div className="flex items-end gap-5 md:gap-6 animate-fade-in-up delay-100">
            <div className="avatar-gradient-border flex-shrink-0 animate-scale-in">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-white shadow-2xl">
                {profileImage && <AvatarImage src={profileImage} alt={name} />}
                <AvatarFallback className="bg-white text-gray-700 text-3xl md:text-4xl font-bold">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="pb-1">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] leading-[1.05] mb-3 ${hasPhotoBackground ? 'text-white drop-shadow-md' : textColor}`}>
                {name}
              </h1>
              <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${mutedColor}`}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className={`h-4 w-4 ${hasPhotoBackground ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400'}`} />
                  {rating.toFixed(1)}
                  <span className="opacity-70">({reviewCount})</span>
                </span>
                {extraMeta.map((meta, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {meta.icon}
                    {meta.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
