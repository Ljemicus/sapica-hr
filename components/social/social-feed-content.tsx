'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Trophy, Crown, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { CreatePost } from '@/components/social/create-post';
import { PostCard } from '@/components/social/post-card';
import { ChallengeList } from '@/components/social/challenge-list';
import { PetOfTheWeek } from '@/components/social/pet-of-the-week';
import { PlaydateMatching } from '@/components/social/playdate-matching';
import type { Pet } from '@/lib/types';
import type { SocialPostWithDetails } from '@/lib/types/social';

export function SocialFeedContent() {
  const { user } = useAuth();
  
  return <SocialFeedInner user={user} />;
}

function SocialFeedInner({ user }: { user: import('@/lib/types').User | null }) {
  const [posts, setPosts] = useState<SocialPostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userReactions, setUserReactions] = useState<Record<string, import('@/lib/types/social').ReactionType>>({});
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const LIMIT = 10;

  // Load user's pets
  useEffect(() => {
    if (user) {
      loadUserPets();
    }
  }, [user]);

  const loadUserPets = async () => {
    try {
      const response = await fetch('/api/pets');
      if (response.ok) {
        const data = await response.json();
        setUserPets(data.pets || []);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  // Load posts
  const loadPosts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/social/posts?limit=${LIMIT}&offset=${currentOffset}`);
      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts || [];
        
        if (reset) {
          setPosts(newPosts);
          setOffset(LIMIT);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          setOffset(currentOffset + LIMIT);
        }
        
        setHasMore(newPosts.length === LIMIT);

        // Check which posts have reactions from current user
        if (user && newPosts.length > 0) {
          const postIds = newPosts.map((p: SocialPostWithDetails) => p.id);
          checkUserReactions(postIds);
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [offset, user]);

  const checkUserReactions = async (postIds: string[]) => {
    try {
      const response = await fetch(`/api/social/reactions?postIds=${postIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setUserReactions(prev => ({ ...prev, ...data.reactions }));
      }
    } catch (error) {
      console.error('Error checking reactions:', error);
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, []);

  const handlePostCreated = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  const handleDeletePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const handleReactionChange = useCallback((postId: string, reaction: import('@/lib/types/social').ReactionType | null) => {
    setUserReactions(prev => {
      const newReactions = { ...prev };
      if (reaction) {
        newReactions[postId] = reaction;
      } else {
        delete newReactions[postId];
      }
      return newReactions;
    });
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadPosts(false);
    }
  }, [isLoadingMore, hasMore, loadPosts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-orange-500" />
            Zajednica ljubimaca
          </h1>
          <p className="text-muted-foreground">
            Podijelite trenutke, sudjelujte u izazovima i pronađite druženja za vaše ljubimce
          </p>
        </div>

        {/* Create Post */}
        <div className="mb-6">
          <CreatePost 
            pets={userPets} 
            onPostCreated={handlePostCreated}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Izazovi</span>
            </TabsTrigger>
            <TabsTrigger value="pet-of-week" className="gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Najbolji</span>
            </TabsTrigger>
            <TabsTrigger value="playdates" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Druženja</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Još nema objava</p>
                <p className="text-sm text-muted-foreground">Budite prvi koji će podijeliti trenutak!</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userReaction={userReactions[post.id] || null}
                    onDelete={handleDeletePost}
                    onReactionChange={handleReactionChange}
                  />
                ))}
                
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Učitavanje...
                        </>
                      ) : (
                        'Učitaj više'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="challenges">
            <ChallengeList />
          </TabsContent>

          <TabsContent value="pet-of-week">
            <PetOfTheWeek showHistory />
          </TabsContent>

          <TabsContent value="playdates">
            <PlaydateMatching userPets={userPets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
