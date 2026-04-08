'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, Share2, MoreHorizontal, Send, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { SocialPostWithDetails, SocialCommentWithUser, ReactionType } from '@/lib/types/social';
import { formatDistanceToNow } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/shared/optimized-image';

interface PostCardProps {
  post: SocialPostWithDetails;
  onDelete?: (postId: string) => void;
  userReaction?: ReactionType | null;
  onReactionChange?: (postId: string, reaction: ReactionType | null) => void;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '❤️', label: 'Sviđa mi se' },
  { type: 'paw', emoji: '🐾', label: 'Šapa' },
  { type: 'laugh', emoji: '😂', label: 'Smiješno' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'love', emoji: '🥰', label: 'Prekrasno' },
];

export function PostCard({ post, onDelete, userReaction: initialUserReaction = null, onReactionChange }: PostCardProps) {
  const { user } = useAuth();
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialUserReaction);
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({
    like: post.reactions?.like || 0,
    paw: post.reactions?.paw || 0,
    laugh: post.reactions?.laugh || 0,
    wow: post.reactions?.wow || 0,
    love: post.reactions?.love || 0,
  });
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<SocialCommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleReaction = useCallback(async (reactionType: ReactionType) => {
    if (!user) {
      toast.error('Morate biti prijavljeni da biste reagirali');
      return;
    }

    const previousReaction = userReaction;
    const isRemoving = previousReaction === reactionType;

    // Optimistic update
    setUserReaction(isRemoving ? null : reactionType);
    setReactions(prev => ({
      ...prev,
      [reactionType]: isRemoving ? prev[reactionType] - 1 : prev[reactionType] + 1,
      ...(previousReaction && previousReaction !== reactionType ? { [previousReaction]: prev[previousReaction] - 1 } : {}),
    }));
    setShowReactions(false);

    try {
      const response = await fetch('/api/social/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, reactionType }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle reaction');
      }

      const data = await response.json();
      onReactionChange?.(post.id, data.reaction);
    } catch (error) {
      // Revert on error
      setUserReaction(previousReaction);
      setReactions(prev => ({
        ...prev,
        [reactionType]: isRemoving ? prev[reactionType] + 1 : prev[reactionType] - 1,
        ...(previousReaction && previousReaction !== reactionType ? { [previousReaction]: prev[previousReaction] + 1 } : {}),
      }));
      toast.error('Greška prilikom reagiranja');
    }
  }, [userReaction, post.id, user, onReactionChange]);

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const hasReactions = totalReactions > 0;

  const loadComments = useCallback(async () => {
    if (isLoadingComments) return;
    
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/social/comments?postId=${post.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, isLoadingComments]);

  const handleShowComments = useCallback(() => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  }, [showComments, loadComments]);

  const handleSubmitComment = useCallback(async () => {
    if (!user) {
      toast.error('Morate biti prijavljeni da biste komentirali');
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      } else {
        throw new Error('Failed to submit comment');
      }
    } catch (error) {
      toast.error('Greška prilikom slanja komentara');
    } finally {
      setIsSubmittingComment(false);
    }
  }, [newComment, post.id, user]);

  const handleDelete = useCallback(async () => {
    if (!user || user.id !== post.user_id) return;

    try {
      const response = await fetch(`/api/social/posts?id=${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete?.(post.id);
        toast.success('Objava obrisana');
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      toast.error('Greška prilikom brisanja objave');
    }
  }, [post.id, post.user_id, user, onDelete]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/zajednica?post=${post.id}`);
    toast.success('Link kopiran u međuspremnik');
  }, [post.id]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.avatar_url || undefined} />
              <AvatarFallback>{post.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user?.name || 'Korisnik'}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at))}
              </p>
            </div>
          </div>
          {user?.id === post.user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Obriši objavu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* AI Caption Badge */}
        {post.ai_caption && (
          <div className="flex items-center gap-1 mb-3">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-xs text-muted-foreground italic">{post.ai_caption}</span>
          </div>
        )}

        {/* Content */}
        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid gap-2 mb-3">
            {post.media_urls.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                {url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={url} className="w-full h-full object-cover" controls />
                ) : (
                  <OptimizedImage src={url} alt="" width={600} height={338} className="w-full h-full" objectFit="cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Tags */}
        {post.ai_tags && post.ai_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.ai_tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Reactions Summary */}
        {hasReactions && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex -space-x-1">
              {REACTIONS.filter(r => reactions[r.type] > 0)
                .slice(0, 3)
                .map(r => (
                  <span key={r.type} className="text-sm">{r.emoji}</span>
                ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {totalReactions} {totalReactions === 1 ? 'reakcija' : 'reakcije'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-3 border-t">
          <div 
            className="relative"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                userReaction && "text-primary"
              )}
              onClick={() => userReaction ? handleReaction(userReaction) : setShowReactions(true)}
            >
              {userReaction ? (
                <>
                  <span>{REACTIONS.find(r => r.type === userReaction)?.emoji}</span>
                  <span className="capitalize">{REACTIONS.find(r => r.type === userReaction)?.label}</span>
                </>
              ) : (
                <>
                  <span>❤️</span>
                  <span>Sviđa mi se</span>
                </>
              )}
            </Button>

            {/* Reaction Picker */}
            {showReactions && (
              <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-background border rounded-full px-2 py-1 shadow-lg animate-in fade-in zoom-in duration-200">
                {REACTIONS.map((reaction) => (
                  <button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    title={reaction.label}
                    className={cn(
                      "p-2 hover:scale-125 transition-transform rounded-full",
                      userReaction === reaction.type && "bg-primary/10"
                    )}
                  >
                    <span className="text-xl">{reaction.emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleShowComments}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Komentari ({post.comments_count})</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 ml-auto"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Podijeli</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Comment Input */}
            {user && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any).user_metadata?.avatar_url || undefined} />
                  <AvatarFallback>{(user as any).user_metadata?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Napišite komentar..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-auto"
                    disabled={!newComment.trim() || isSubmittingComment}
                    onClick={handleSubmitComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {isLoadingComments ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Učitavanje komentara...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Još nema komentara. Budite prvi!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.avatar_url || undefined} />
                      <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="text-sm font-medium">{comment.user?.name || 'Korisnik'}</p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
