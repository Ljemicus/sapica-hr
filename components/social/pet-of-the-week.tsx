'use client';

import { useState, useEffect, useCallback } from 'react';
import { Crown, Trophy, Star, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PetOfTheWeekWithDetails } from '@/lib/types/social';
import { OptimizedImage } from '@/components/shared/optimized-image';

interface PetOfTheWeekProps {
  showHistory?: boolean;
}

export function PetOfTheWeek({ showHistory = false }: PetOfTheWeekProps) {
  const [currentPet, setCurrentPet] = useState<PetOfTheWeekWithDetails | null>(null);
  const [pastPets, setPastPets] = useState<PetOfTheWeekWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPetOfTheWeek = useCallback(async () => {
    try {
      const [currentResponse, historyResponse] = await Promise.all([
        fetch('/api/social/pet-of-week?current=true'),
        showHistory ? fetch('/api/social/pet-of-week?limit=5') : Promise.resolve(null),
      ]);

      if (currentResponse.ok) {
        const data = await currentResponse.json();
        setCurrentPet(data.petsOfWeek?.[0] || null);
      }

      if (historyResponse && historyResponse.ok) {
        const data = await historyResponse.json();
        setPastPets(data.petsOfWeek?.slice(1) || []);
      }
    } catch (error) {
      console.error('Error loading pet of the week:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showHistory]);

  useEffect(() => {
    loadPetOfTheWeek();
  }, [loadPetOfTheWeek]);

  if (isLoading) {
    return (
      <Card className="h-64 animate-pulse bg-muted" />
    );
  }

  if (!currentPet) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Uskoro objavljujemo ljubimca tjedna!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Pet of the Week */}
      <Card className="overflow-hidden border-2 border-yellow-400/50">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            <h3 className="font-bold text-lg">Ljubimac tjedna</h3>
          </div>
          <p className="text-white/80 text-sm">
            {new Date(currentPet.week_start).toLocaleDateString('hr-HR', { 
              day: 'numeric', 
              month: 'long' 
            })} - {new Date(currentPet.week_end).toLocaleDateString('hr-HR', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
        
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-yellow-400">
                <AvatarImage src={currentPet.pet.photo_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {currentPet.pet.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h4 className="text-2xl font-bold">{currentPet.pet.name}</h4>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="secondary">
                  {currentPet.pet.species === 'dog' ? '🐕 Pas' : 
                   currentPet.pet.species === 'cat' ? '🐈 Mačka' : '🐾 Ljubimac'}
                </Badge>
                {currentPet.pet.breed && (
                  <Badge variant="outline">{currentPet.pet.breed}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {currentPet.votes_count} glasova
              </p>
            </div>
          </div>

          {currentPet.post && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{currentPet.post.content.slice(0, 150)}...&rdquo;
              </p>
              {currentPet.post.media_urls && currentPet.post.media_urls.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {currentPet.post.media_urls.slice(0, 3).map((url, i) => (
                    <OptimizedImage
                      key={i}
                      src={url}
                      alt={`${currentPet.pet.name} ${i + 1}`}
                      width={64}
                      height={64}
                      className="rounded-lg"
                      objectFit="cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Winners */}
      {showHistory && pastPets.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Prošli pobjednici
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {pastPets.map((petOfWeek) => (
              <Card key={petOfWeek.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={petOfWeek.pet.photo_url || undefined} />
                      <AvatarFallback>{petOfWeek.pet.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{petOfWeek.pet.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(petOfWeek.week_start).toLocaleDateString('hr-HR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {petOfWeek.votes_count} glasova
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
