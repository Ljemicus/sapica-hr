'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, MapPin, Star, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n/context';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';

interface AIMatch {
  sitter: {
    userId: string;
    name: string;
    avatar: string | null;
    city: string | null;
    bio: string | null;
    experienceYears: number;
    rating: number;
    reviewCount: number;
    superhost: boolean;
    verified: boolean;
    services: ServiceType[];
    prices: Record<ServiceType, number>;
    photos: string[];
  };
  score: number;
  matchPercentage: number;
  reasons: string[];
  matchFactors: {
    location: number;
    service: number;
    experience: number;
    rating: number;
    responseTime: number;
    specialNeeds: number;
  };
}

const CROATIAN_CITIES = [
  'Zagreb',
  'Split',
  'Rijeka',
  'Osijek',
  'Zadar',
  'Dubrovnik',
  'Pula',
  'Šibenik',
  'Varaždin',
  'Karlovac',
  'Sisak',
  'Slavonski Brod',
  'Vukovar',
  'Kaštela',
  'Velika Gorica',
  'Samobor',
  'Zaprešić',
];

export function AIMatchingContent() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('boarding');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindMatches = async () => {
    if (!city) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('/api/ai-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          serviceType,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
      
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="organizations-hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            {isEn ? 'AI Powered' : 'Pokreće AI'}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)] text-white">
            {isEn ? 'Find a Strong Match' : 'Pronađite Dobrog Čuvara'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {isEn 
              ? 'Our AI compares experience, ratings, response time, and location to suggest suitable sitters for your pet.'
              : 'Naš AI uspoređuje iskustvo, ocjene, vrijeme odgovora i lokaciju kako bi predložio prikladne čuvare za vašeg ljubimca.'}
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="container mx-auto px-4 -mt-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isEn ? 'City' : 'Grad'}
                </label>
                <Select value={city} onValueChange={(v) => setCity(v || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder={isEn ? 'Select city' : 'Odaberite grad'} />
                  </SelectTrigger>
                  <SelectContent>
                    {CROATIAN_CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isEn ? 'Service' : 'Usluga'}
                </label>
                <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleFindMatches} 
                  disabled={!city || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEn ? 'Analyzing...' : 'Analiziram...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isEn ? 'Find Best Matches' : 'Pronađi Najbolje'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-12">
        {hasSearched && !loading && matches.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isEn ? 'No matches found' : 'Nema pronađenih čuvara'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isEn 
                ? 'Try selecting a different city or service. New sitters join every day!'
                : 'Pokušajte odabrati drugi grad ili uslugu. Novi čuvari se pridružuju svaki dan!'}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {isEn ? 'Top Matches' : 'Najbolji Čuvari'}
              </h2>
              <Badge variant="secondary">
                {matches.length} {isEn ? 'found' : 'pronađeno'}
              </Badge>
            </div>

            <div className="space-y-4">
              {matches.map((match, index) => (
                <Card 
                  key={match.sitter.userId} 
                  className={`overflow-hidden transition-all hover:shadow-md ${
                    index === 0 ? 'border-2 border-amber-400 bg-amber-50/30' : ''
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Avatar & Score */}
                      <div className="bg-muted/50 p-6 flex flex-col items-center justify-center md:w-48 border-b md:border-b-0 md:border-r">
                        <div className="relative mb-3">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-sm">
                            {match.sitter.avatar ? (
                              <Image
                                src={match.sitter.avatar}
                                alt={match.sitter.name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-orange/20 to-warm-teal/20 text-2xl">
                                {match.sitter.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              #1
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreColor(match.score)} text-white font-bold text-xl mb-1`}>
                            {match.matchPercentage}%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {isEn ? 'Match Score' : 'Podudaranje'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Details */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold">{match.sitter.name}</h3>
                              {match.sitter.superhost && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Superhost
                                </Badge>
                              )}
                              {match.sitter.verified && (
                                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {isEn ? 'Verified' : 'Verificiran'}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {match.sitter.city}
                              </span>
                              {match.sitter.rating > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  {match.sitter.rating.toFixed(1)} ({match.sitter.reviewCount})
                                </span>
                              )}
                            </div>

                            {match.sitter.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {match.sitter.bio}
                              </p>
                            )}

                            {/* Match Reasons */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {match.reasons.map((reason, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-warm-orange">
                                {match.sitter.prices[serviceType] || match.sitter.prices.boarding || 0} €
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isEn ? 'per day' : 'po danu'}
                              </p>
                            </div>
                            <Link href={`/sitter/${match.sitter.userId}`}>
                              <Button>
                                {isEn ? 'View Profile' : 'Pogledaj Profil'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isEn ? 'How AI Matching Works' : 'Kako AI Podudaranje Funkcionira'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-warm-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-warm-orange" />
              </div>
              <h3 className="font-semibold mb-2">{isEn ? 'Location' : 'Lokacija'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? 'Prioritizes sitters in your city and nearby areas'
                  : 'Prioritet čuvarima u vašem gradu i blizini'}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-warm-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-warm-teal" />
              </div>
              <h3 className="font-semibold mb-2">{isEn ? 'Experience & Rating' : 'Iskustvo i Ocjene'}</h3>
              <p className="text-sm text-muted-foreground">
                {isEn 
                  ? 'Considers years of experience and review signals'
                  : 'Uzima u obzir godine iskustva i signale iz recenzija'}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-warm-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-warm-coral" />
              </div>
              <h3 className="font-semibold mb-2">{isEn ? 'Response Time' : 'Vrijeme Odgovora'}</h3>
              <p className="f text-sm text-muted-foreground">
                {isEn 
                  ? 'Favors sitters who respond quickly to inquiries'
                  : 'Preferira čuvare koji brzo odgovaraju na upite'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
