'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n/context';
import { VET_SERVICE_LABELS, type VetServiceType, type VetReview } from '@/lib/types/vet-reviews';

interface ReviewFormProps {
  vetId: string;
  onSubmitted: (review: VetReview) => void;
  onCancel: () => void;
}

export function ReviewForm({ vetId, onSubmitted, onCancel }: ReviewFormProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [serviceType, setServiceType] = useState<VetServiceType>('pregled');
  const [comment, setComment] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(isEn ? 'Please select a rating' : 'Odaberite ocjenu');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/vets/${vetId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment || null,
          service_type: serviceType,
          price_paid: pricePaid ? parseFloat(pricePaid) : null,
          visit_date: visitDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || (isEn ? 'Failed to submit review' : 'Greška pri slanju recenzije'));
      }

      const newReview = await res.json();
      onSubmitted(newReview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">
          {isEn ? 'Write a review' : 'Napiši recenziju'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label>
              {isEn ? 'Your rating' : 'Vaša ocjena'} *
            </Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Service Type */}
          <div>
            <Label htmlFor="service-type">
              {isEn ? 'Service type' : 'Vrsta usluge'} *
            </Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as VetServiceType)}>
              <SelectTrigger id="service-type" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VET_SERVICE_LABELS) as VetServiceType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {VET_SERVICE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">
              {isEn ? 'Your experience (optional)' : 'Vaše iskustvo (opcionalno)'}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isEn 
                ? 'Describe your experience with this veterinarian...'
                : 'Opišite svoje iskustvo s ovim veterinarom...'
              }
              className="mt-2"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000
            </p>
          </div>

          {/* Price and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">
                {isEn ? 'Price paid (€)' : 'Plaćeno (€)'}
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                placeholder="50.00"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="visit-date">
                {isEn ? 'Visit date' : 'Datum posjeta'}
              </Label>
              <Input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEn ? 'Submit review' : 'Pošalji recenziju'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {isEn ? 'Cancel' : 'Odustani'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
