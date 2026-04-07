'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, PawPrint, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Pet } from '@/lib/types';
import type { PlaydateRequestWithDetails } from '@/lib/types/social';

interface PlaydateMatch {
  pet: Pet;
  distance: number; // in km
  compatibility: number; // 0-100
}

interface PlaydateMatchingProps {
  userPets: Pet[];
}

export function PlaydateMatching({ userPets }: PlaydateMatchingProps) {
  const { user } = useAuth();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(userPets[0] || null);
  const [matches, setMatches] = useState<PlaydateMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<PlaydateRequestWithDetails[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PlaydateRequestWithDetails[]>([]);

  // Load playdate requests
  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        fetch('/api/social/playdates?type=sent'),
        fetch('/api/social/playdates?type=received'),
      ]);

      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setReceivedRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  // Simulate finding nearby pets
  const findMatches = useCallback(async () => {
    if (!selectedPet) return;
    
    setIsLoading(true);
    // In production, this would call an API to find nearby pets
    // For now, simulate with mock data
    setTimeout(() => {
      const mockMatches: PlaydateMatch[] = [
        {
          pet: {
            id: 'mock-1',
            owner_id: 'other-user',
            name: 'Bella',
            species: selectedPet.species,
            breed: 'Labrador',
            age: 3,
            photo_url: null,
            weight: null,
            special_needs: null,
            created_at: new Date().toISOString(),
          },
          distance: 1.2,
          compatibility: 85,
        },
        {
          pet: {
            id: 'mock-2',
            owner_id: 'other-user-2',
            name: 'Max',
            species: selectedPet.species,
            breed: 'Miješanac',
            age: 2,
            photo_url: null,
            weight: null,
            special_needs: null,
            created_at: new Date().toISOString(),
          },
          distance: 2.5,
          compatibility: 72,
        },
      ];
      setMatches(mockMatches);
      setIsLoading(false);
    }, 1000);
  }, [selectedPet]);

  const handleRequestPlaydate = useCallback(async (targetPet: Pet) => {
    if (!user || !selectedPet) {
      toast.error('Morate biti prijavljeni');
      return;
    }

    try {
      const response = await fetch('/api/social/playdates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPetId: targetPet.id,
          requesterPetId: selectedPet.id,
          message: `Bok! ${selectedPet.name} bi volio/la igrati se s ${targetPet.name}.`,
        }),
      });

      if (response.ok) {
        toast.success('Zahtjev za druženje poslan!');
        loadRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Greška prilikom slanja zahtjeva');
      }
    } catch (error) {
      toast.error('Greška prilikom slanja zahtjeva');
    }
  }, [user, selectedPet]);

  const handleRespondToRequest = useCallback(async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/social/playdates/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(status === 'accepted' ? 'Zahtjev prihvaćen!' : 'Zahtjev odbijen');
        loadRequests();
      }
    } catch (error) {
      toast.error('Greška prilikom odgovaranja na zahtjev');
    }
  }, []);

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Prijavite se da biste pronašli druženja za vašeg ljubimca</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pet Selector */}
      {userPets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Odaberite ljubimca:</h4>
          <div className="flex flex-wrap gap-2">
            {userPets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedPet?.id === pet.id
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={pet.photo_url || undefined} />
                  <AvatarFallback className="text-xs">{pet.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {pet.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Find Matches Button */}
      {selectedPet && (
        <Button onClick={findMatches} disabled={isLoading} className="w-full">
          {isLoading ? 'Tražim...' : 'Pronađi ljubimce u blizini'}
        </Button>
      )}

      {/* Matches */}
      {matches.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Pronađeni ljubimci:</h4>
          <div className="space-y-3">
            {matches.map((match) => (
              <Card key={match.pet.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.pet.photo_url || undefined} />
                      <AvatarFallback>{match.pet.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{match.pet.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{match.pet.breed}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.distance} km
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700">
                        {match.compatibility}% match
                      </Badge>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleRequestPlaydate(match.pet)}
                      >
                        Pozovi na druženje
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Received Requests */}
      {receivedRequests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Primljeni zahtjevi ({receivedRequests.filter(r => r.status === 'pending').length})
          </h4>
          <div className="space-y-3">
            {receivedRequests.filter(r => r.status === 'pending').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.requester_user.avatar_url || undefined} />
                      <AvatarFallback>{request.requester_user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{request.requester_user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        želi druženje s {request.target_pet.name}
                      </p>
                      {request.message && (
                        <p className="text-sm mt-1 italic">"{request.message}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespondToRequest(request.id, 'rejected')}
                      >
                        Odbij
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRespondToRequest(request.id, 'accepted')}
                      >
                        Prihvati
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Poslani zahtjevi
          </h4>
          <div className="space-y-2">
            {sentRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={request.target_pet.photo_url || undefined} />
                    <AvatarFallback className="text-xs">{request.target_pet.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{request.target_pet.name}</p>
                    <Badge variant={
                      request.status === 'accepted' ? 'default' :
                      request.status === 'rejected' ? 'destructive' :
                      'secondary'
                    } className="text-xs">
                      {request.status === 'pending' ? 'Na čekanju' :
                       request.status === 'accepted' ? 'Prihvaćeno' :
                       request.status === 'rejected' ? 'Odbijeno' : 'Otkazano'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
