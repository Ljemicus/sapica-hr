'use client';

import { format } from 'date-fns';
import { hr, enUS } from 'date-fns/locale';
import { Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/shared/star-rating';
import { useLanguage } from '@/lib/i18n/context';
import type { PublicProviderReview } from '@/lib/types/public-provider';

interface ReviewBlockProps {
  reviews: PublicProviderReview[];
  serviceLabel?: (service: string) => string;
  reviewServiceType?: string;
}

export function ReviewBlock({ reviews, serviceLabel, reviewServiceType }: ReviewBlockProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;

  const copy = {
    kicker: isEn ? 'What others say' : 'Što kažu drugi',
    title: isEn ? 'Reviews' : 'Recenzije',
    noReviews: isEn ? 'No reviews yet' : 'Još nema recenzija',
    beFirst: isEn ? 'Be the first to share an experience.' : 'Budite prvi koji će podijeliti iskustvo.',
    newOnPetPark: isEn ? 'New on PetPark' : 'Novo na PetParku',
    noReviewsYet: isEn ? 'No reviews yet' : 'još nema recenzija',
  };

  return (
    <section className="animate-fade-in-up delay-300">
      <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.kicker}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
        {copy.title}
        <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5 w-fit">
          {reviews.length}
        </Badge>
      </h2>

      {reviews.length === 0 ? (
        <div className="detail-section-card p-10 md:p-12 text-center">
          <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
            <Star className="h-7 w-7 text-warm-orange" />
          </div>
          <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">
            {copy.newOnPetPark} · {copy.noReviewsYet}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.beFirst}</p>
        </div>
      ) : (
        <div className="space-y-0">
          {reviews.map((review, i) => (
            <div key={review.id} className={`detail-section-card p-6 md:p-7 ${i > 0 ? 'mt-4' : ''}`}>
              <div className="flex items-start gap-4">
                <Avatar className="h-11 w-11 border-2 border-border/20 flex-shrink-0">
                  <AvatarImage src={''} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm font-semibold">
                    {review.authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm">{review.authorName}</span>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    {reviewServiceType && serviceLabel && (
                      <>
                        <span className="inline-flex rounded-full px-2 py-0.5 font-medium bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                          {serviceLabel(reviewServiceType)}
                        </span>
                        <span>·</span>
                      </>
                    )}
                    <span>{format(new Date(review.createdAt), isEn ? 'MMM d, yyyy' : 'd. MMM yyyy.', { locale })}</span>
                  </div>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
