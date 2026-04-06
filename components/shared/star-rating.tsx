'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  onRatingChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= rating;
        const partial = !filled && starValue - 1 < rating && rating < starValue;
        const partialWidth = partial ? (rating - (starValue - 1)) * 100 : 0;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive) {
                onChange?.(starValue);
                onRatingChange?.(starValue);
              }
            }}
            className={cn(
              'relative',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                'text-gray-300',
                filled && 'text-yellow-400 fill-yellow-400',
                partial && 'text-gray-300'
              )}
            />
            
            {/* Partial fill overlay */}
            {partial && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${partialWidth}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    'text-yellow-400 fill-yellow-400'
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StarRatingDisplay({
  rating,
  reviewCount,
  size = 'md',
}: {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? 'recenzija' : reviewCount < 5 ? 'recenzije' : 'recenzija'})
        </span>
      )}
    </div>
  );
}
