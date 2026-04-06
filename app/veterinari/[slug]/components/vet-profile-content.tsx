'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Globe, Building2, Clock, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/shared/star-rating';
import { useLanguage } from '@/lib/i18n/context';
import type { Veterinarian } from '@/lib/db/veterinarian-helpers';
import type { VetReview, VetReviewStats, VetServiceType } from '@/lib/types/vet-reviews';
import { VET_SERVICE_LABELS } from '@/lib/types/vet-reviews';
import { ReviewForm } from './review-form';
import { formatDistanceToNow } from 'date-fns';

interface VetProfileContentProps {
  vet: Veterinarian;
  initialReviews: VetReview[];
  initialStats: VetReviewStats | null;
}

export function VetProfileContent({ vet, initialReviews, initialStats }: VetProfileContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [reviews, setReviews] = useState<VetReview[]>(initialReviews);
  const [stats, setStats] = useState<VetReviewStats | null>(initialStats);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterService, setFilterService] = useState<VetServiceType | 'all'>('all');

  const filteredReviews = filterService === 'all' 
    ? reviews 
    : reviews.filter(r => r.service_type === filterService);

  const handleReviewSubmitted = (newReview: VetReview) => {
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    // Update stats optimistically
    if (stats) {
      const newCount = stats.review_count + 1;
      const newAvg = ((stats.avg_rating * stats.review_count) + newReview.rating) / newCount;
      setStats({
        ...stats,
        review_count: newCount,
        avg_rating: Math.round(newAvg * 10) / 10,
      });
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/vets/${vet.id}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      if (res.ok) {
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        ));
      }
    } catch {
      // silently fail
    }
  };

  const handleFlag = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/vets/${vet.id}/reviews/${reviewId}/flag`, {
        method: 'POST',
      });
      if (res.ok) {
        alert(isEn ? 'Review flagged for moderation' : 'Recenzija prijavljena za moderaciju');
      }
    } catch {
      // silently fail
    }
  };

  const displayPhone = vet.emergency_phone || vet.phone;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="organizations-hero-gradient py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{vet.name}</h1>
                {vet.organization_name && vet.organization_name !== vet.name && (
                  <p className="text-white/80 text-lg">{vet.organization_name}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Building2 className="h-3 w-3 mr-1" />
                    {vet.type === 'veterinarska_stanica' 
                      ? (isEn ? 'Veterinary Station' : 'Veterinarska stanica')
                      : (isEn ? 'Veterinary Clinic' : 'Veterinarska ambulanta')
                    }
                  </Badge>
                  {vet.verified && (
                    <Badge className="bg-emerald-500 text-white border-0">
                      {isEn ? 'Verified' : 'Verificirano'}
                    </Badge>
                  )}
                </div>
              </div>
              
              {stats && stats.review_count > 0 && (
                <div className="text-center bg-white/10 rounded-xl p-4">
                  <div className="text-4xl font-bold text-white">{stats.avg_rating.toFixed(1)}</div>
                  <StarRating rating={stats.avg_rating} size="sm" className="justify-center mt-1" />
                  <div className="text-white/70 text-sm mt-1">
                    {stats.review_count} {isEn ? 'reviews' : 'recenzija'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isEn ? 'Contact' : 'Kontakt'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vet.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">{vet.address}</p>
                      <p className="text-sm text-muted-foreground">{vet.postal_code} {vet.city}</p>
                    </div>
                  </div>
                )}
                
                {displayPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${displayPhone.replace(/\s/g, '')}`} className="text-sm hover:underline">
                      {displayPhone}
                    </a>
                  </div>
                )}
                
                {vet.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${vet.email}`} className="text-sm hover:underline break-all">
                      {vet.email}
                    </a>
                  </div>
                )}
                
                {vet.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={vet.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline break-all">
                      {vet.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {vet.emergency_verified && vet.emergency_mode && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {isEn ? 'Emergency' : 'Hitna pomoć'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700">
                    {vet.emergency_mode === 'open_24h' && (isEn ? 'Open 24/7' : 'Otvoreno 0-24')}
                    {vet.emergency_mode === 'on_call' && (isEn ? 'On call' : 'Dežurni')}
                    {vet.emergency_mode === 'emergency_contact' && (isEn ? 'Emergency contact' : 'Hitni kontakt')}
                    {vet.emergency_mode === 'emergency_intake' && (isEn ? 'Emergency intake' : 'Hitni prijem')}
                  </p>
                  {vet.emergency_phone && vet.emergency_phone !== vet.phone && (
                    <a 
                      href={`tel:${vet.emergency_phone.replace(/\s/g, '')}`}
                      className="text-lg font-bold text-red-700 hover:underline block mt-2"
                    >
                      {vet.emergency_phone}
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setShowReviewForm(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isEn ? 'Write a review' : 'Napiši recenziju'}
            </Button>
          </div>

          {/* Right column - Reviews */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="reviews">
              <TabsList className="mb-4">
                <TabsTrigger value="reviews">
                  {isEn ? 'Reviews' : 'Recenzije'} ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="space-y-4">
                {showReviewForm && (
                  <ReviewForm 
                    vetId={vet.id}
                    onSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}

                {/* Filter */}
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filterService === 'all' ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setFilterService('all')}
                  >
                    {isEn ? 'All' : 'Sve'}
                  </Badge>
                  {(Object.keys(VET_SERVICE_LABELS) as VetServiceType[]).map((type) => (
                    <Badge 
                      key={type}
                      variant={filterService === type ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => setFilterService(type)}
                    >
                      {VET_SERVICE_LABELS[type]}
                    </Badge>
                  ))}
                </div>

                {filteredReviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {isEn 
                          ? 'No reviews yet. Be the first to write one!' 
                          : 'Još nema recenzija. Budite prvi koji će napisati!'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {review.user?.avatar_url ? (
                                <Image 
                                  src={review.user.avatar_url} 
                                  alt={review.user.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {review.user?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.user?.name || 'Korisnik'}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <StarRating rating={review.rating} size="sm" />
                                <span>•</span>
                                <span>{formatDistanceToNow(review.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {VET_SERVICE_LABELS[review.service_type]}
                            </Badge>
                            {review.is_verified && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                {isEn ? 'Verified visit' : 'Verificirana posjeta'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="mt-3 text-sm">{review.comment}</p>
                        )}

                        {review.price_paid && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {isEn ? 'Price paid' : 'Plaćeno'}: {review.price_paid.toFixed(2)} €
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                          <button 
                            onClick={() => handleMarkHelpful(review.id)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            {isEn ? 'Helpful' : 'Korisno'} ({review.helpful_count})
                          </button>
                          <button 
                            onClick={() => handleFlag(review.id)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Flag className="h-4 w-4" />
                            {isEn ? 'Report' : 'Prijavi'}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
