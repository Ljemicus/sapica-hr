import Link from 'next/link';
import { Star, MapPin, Clock, Shield, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FavoriteButton } from '@/components/shared/favorite-button';
import type { SitterProfile } from '@/lib/types';
import { SERVICE_LABELS as serviceLabels } from '@/lib/types';
import { VerificationBadge } from '@/components/shared/verification-badge';

const gradients = [
  'from-orange-400 to-amber-300',
  'from-blue-400 to-cyan-300',
  'from-purple-400 to-pink-300',
  'from-green-400 to-emerald-300',
  'from-rose-400 to-orange-300',
  'from-teal-400 to-cyan-300',
];

interface SitterCardProps {
  profile: SitterProfile & { user?: { name: string; avatar_url: string | null } };
}

export function SitterCard({ profile }: SitterCardProps) {
  const lowestPrice = Math.min(...Object.values(profile.prices).filter((p): p is number => typeof p === 'number'));
  const gradientIndex = profile.user?.name ? profile.user.name.charCodeAt(0) % gradients.length : 0;

  return (
    <Link href={`/sitter/${profile.user_id}`}>
      <Card className="group card-hover overflow-hidden cursor-pointer border-0 shadow-sm rounded-2xl">
        <CardContent className="p-0">
          <div className={`relative h-44 bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}>
            <div className="absolute inset-0 paw-pattern opacity-10" />
            <Avatar className="h-22 w-22 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AvatarImage src={profile.user?.avatar_url || ''} alt={profile.user?.name || ''} />
              <AvatarFallback className="bg-white/90 text-gray-700 text-2xl font-bold">
                {profile.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute top-3 left-3">
              <FavoriteButton sitterId={profile.user_id} />
            </div>
            <div className="absolute top-3 right-3 flex gap-1.5">
              {profile.verified && (
                <Badge className="bg-white/90 text-blue-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificiran profil
                </Badge>
              )}
              {profile.superhost && (
                <Badge className="bg-white/90 text-amber-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5 font-semibold">
                  <Award className="h-3 w-3 mr-1" />
                  Top izbor
                </Badge>
              )}
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  {profile.user?.name}
                  <VerificationBadge level={profile.verified_level || (profile.verified ? 'verified' : 'basic')} />
                </h3>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-700">{profile.rating_avg.toFixed(1)}</span>
                  <span className="text-xs text-amber-600/70">({profile.review_count})</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {profile.city}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.services.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs font-normal bg-gray-50">
                  {serviceLabels[service]}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {profile.response_time || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-orange-500">već od {lowestPrice}&euro;</span>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
