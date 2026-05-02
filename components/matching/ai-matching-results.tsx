'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Star, Check, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/i18n/context';

interface MatchResult {
  sitter: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    experienceYears: number;
    rating: number;
    reviewCount: number;
    verified: boolean;
    superhost: boolean;
    instantBooking: boolean;
    city: string | null;
    price: number;
    services: string[];
  };
  matchScore: number;
  matchPercentage: number;
  reasons: string[];
  recommendation: string;
  isTopMatch: boolean;
}

interface AIMatchingResultsProps {
  petId: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  budgetMax?: number;
  onSelectSitter?: (sitterId: string) => void;
  onClose?: () => void;
}

export function AIMatchingResults({
  petId,
  serviceType,
  startDate,
  endDate,
  budgetMax,
  onSelectSitter,
  onClose,
}: AIMatchingResultsProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, serviceType, startDate, endDate]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/matching/find-sitters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          serviceType,
          startDate,
          endDate,
          budgetMax,
          limit: 5,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await res.json();
      setMatches(data.matches || []);
    } catch {
      setError(isEn ? 'Could not find matches' : 'Nije moguće pronaći podudaranja');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="community-section-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-slate-600">
            {isEn ? 'Finding suitable sitters for your pet...' : 'Tražimo prikladne čuvare za vašeg ljubimca...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="community-section-card border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchMatches} variant="outline" className="mt-4">
            {isEn ? 'Try again' : 'Pokušaj ponovno'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="community-section-card">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">
            {isEn 
              ? 'No available sitters found for your criteria. Try different dates or location.'
              : 'Nema dostupnih čuvara za vaše kriterije. Pokušajte druge datume ili lokaciju.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-lg text-slate-900">
            {isEn ? 'AI Recommended Sitters' : 'AI Preporučeni Čuvari'}
          </h3>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          {matches.length} {isEn ? 'matches' : 'podudaranja'}
        </Badge>
      </div>

      {/* Top Match Highlight */}
      {matches[0] && (
        <Card className="community-section-card border-2 border-orange-300 bg-gradient-to-br from-orange-50/50 to-white shadow-eve">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-orange-200">
                  <AvatarImage src={matches[0].sitter.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-700 text-lg">
                    {matches[0].sitter.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {matches[0].sitter.superhost && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    ⭐
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-lg text-slate-900">{matches[0].sitter.name}</h4>
                  {matches[0].sitter.verified && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Check className="h-3 w-3 mr-1" />
                      {isEn ? 'Verified' : 'Verificiran'}
                    </Badge>
                  )}
                  {matches[0].sitter.instantBooking && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      <Zap className="h-3 w-3 mr-1" />
                      {isEn ? 'Instant' : 'Instant'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {matches[0].sitter.rating.toFixed(1)}
                    <span className="text-slate-400">({matches[0].sitter.reviewCount})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {matches[0].sitter.city}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-coral-500 rounded-full"
                        style={{ width: `${matches[0].matchPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      {matches[0].matchPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{matches[0].recommendation}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {matches[0].reasons.map((reason, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  €{matches[0].sitter.price}
                </div>
                <div className="text-xs text-slate-500">/{isEn ? 'day' : 'dan'}</div>
                <Button 
                  size="sm" 
                  className="mt-2 bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 text-white"
                  onClick={() => onSelectSitter?.(matches[0].sitter.id)}
                >
                  {isEn ? 'Select' : 'Odaberi'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Matches */}
      {matches.slice(1).map((match) => (
        <Card key={match.sitter.id} className="community-section-card hover:shadow-eve transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={match.sitter.avatar || undefined} />
                <AvatarFallback className="bg-slate-100 text-slate-600">
                  {match.sitter.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{match.sitter.name}</h4>
                  {match.sitter.superhost && <span className="text-yellow-500">⭐</span>}
                  {match.sitter.verified && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    {match.sitter.rating.toFixed(1)}
                  </span>
                  <span>{match.sitter.city}</span>
                  <span className="text-orange-600 font-medium">{match.matchPercentage}% match</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {match.reasons.slice(0, 2).map((reason, i) => (
                    <span key={i} className="text-xs text-slate-500">{reason}{i < match.reasons.slice(0, 2).length - 1 ? ' • ' : ''}</span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">€{match.sitter.price}</div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onSelectSitter?.(match.sitter.id)}
                >
                  {isEn ? 'Select' : 'Odaberi'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-slate-500">
          {isEn 
            ? 'Matches based on location, experience, ratings, and your pet\'s needs'
            : 'Podudaranja temeljena na lokaciji, iskustvu, ocjenama i potrebama vašeg ljubimca'}
        </p>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isEn ? 'Close' : 'Zatvori'}
          </Button>
        )}
      </div>
    </div>
  );
}
