import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { StarRating } from '@/components/shared/star-rating';
import type { Review } from '@/lib/types';

interface Props {
  reviews: (Review & { reviewer: { name: string; avatar_url: string | null } })[];
}

export function SitterReviewsTab({ reviews }: Props) {
  if (reviews.length === 0) {
    return <EmptyState icon={Star} title="Još nema recenzija" description="Recenzije od vaših klijenata će se pojaviti ovdje." />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {reviews.map((review) => (
        <Card key={review.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{review.reviewer?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{review.reviewer?.name}</span>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">{format(new Date(review.created_at), 'd. MMMM yyyy.', { locale: hr })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
