'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/shared/optimized-image';
import type { SocialChallenge, ChallengeEntryWithDetails } from '@/lib/types/social';

interface ChallengeCardProps {
  challenge: SocialChallenge;
  onVote?: (entryId: string, voted: boolean) => void;
  userVotes?: Set<string>;
}

function ChallengeCard({ challenge, onVote, userVotes = new Set() }: ChallengeCardProps) {
  const [entries, setEntries] = useState<ChallengeEntryWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEntries, setShowEntries] = useState(false);

  const loadEntries = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/social/challenges/${challenge.id}/entries?sort=votes`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [challenge.id, isLoading]);

  const handleShowEntries = useCallback(() => {
    if (!showEntries) {
      loadEntries();
    }
    setShowEntries(!showEntries);
  }, [showEntries, loadEntries]);

  const handleVote = useCallback(async (entryId: string) => {
    try {
      const response = await fetch(`/api/social/challenges/${challenge.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });

      if (response.ok) {
        const data = await response.json();
        onVote?.(entryId, data.voted);
        
        // Update local entries
        setEntries(prev => prev.map(entry => {
          if (entry.id === entryId) {
            return {
              ...entry,
              votes_count: data.voted ? entry.votes_count + 1 : entry.votes_count - 1,
            };
          }
          return entry;
        }));
        
        toast.success(data.voted ? 'Glas dodan!' : 'Glas uklonjen');
      }
    } catch {
      toast.error('Greška prilikom glasanja');
    }
  }, [challenge.id, onVote]);

  const isActive = new Date(challenge.end_date) >= new Date() && challenge.is_active;
  const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="overflow-hidden">
      <div className={`h-32 bg-gradient-to-r from-orange-400 to-pink-500 relative ${challenge.image_url ? '' : 'flex items-center justify-center'}`}>
        {challenge.image_url ? (
          <OptimizedImage src={challenge.image_url} alt={challenge.title} width={400} height={128} className="w-full h-full" objectFit="cover" />
        ) : (
          <Trophy className="h-16 w-16 text-white/50" />
        )}
        {isActive && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">
            Aktivan
          </Badge>
        )}
        {challenge.is_featured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popularno
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{challenge.title}</CardTitle>
        {challenge.description && (
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {isActive ? (
              <span className="text-green-600 font-medium">{daysLeft} dana preostalo</span>
            ) : (
              <span>Završen</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {entries.length} sudionika
          </div>
        </div>

        {challenge.prize_description && (
          <div className="bg-amber-50 rounded-lg p-3 text-sm">
            <span className="font-medium text-amber-800">🏆 Nagrada:</span>{' '}
            <span className="text-amber-700">{challenge.prize_description}</span>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleShowEntries}
        >
          {showEntries ? 'Sakrij prijave' : 'Pogledaj prijave'}
        </Button>

        {showEntries && (
          <div className="space-y-3 pt-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center">Učitavanje...</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">Još nema prijava</p>
            ) : (
              entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.post.user.avatar_url || undefined} />
                    <AvatarFallback>{entry.post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.post.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.post.content.slice(0, 50)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{entry.votes_count}</p>
                    <p className="text-xs text-muted-foreground">glasova</p>
                  </div>
                  {isActive && (
                    <Button
                      size="sm"
                      variant={userVotes.has(entry.id) ? 'default' : 'outline'}
                      onClick={() => handleVote(entry.id)}
                    >
                      {userVotes.has(entry.id) ? 'Glasano' : 'Glasaj'}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ChallengeListProps {
  limit?: number;
}

export function ChallengeList({ limit }: ChallengeListProps) {
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  const loadChallenges = useCallback(async () => {
    try {
      const response = await fetch('/api/social/challenges?active=true');
      if (response.ok) {
        const data = await response.json();
        setChallenges(limit ? data.challenges.slice(0, limit) : data.challenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleVote = useCallback((entryId: string, voted: boolean) => {
    setUserVotes(prev => {
      const newVotes = new Set(prev);
      if (voted) {
        newVotes.add(entryId);
      } else {
        newVotes.delete(entryId);
      }
      return newVotes;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="h-64 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Trenutno nema aktivnih izazova</p>
          <p className="text-sm text-muted-foreground">Pratite nas za nove izazove uskoro!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onVote={handleVote}
          userVotes={userVotes}
        />
      ))}
    </div>
  );
}
