import Link from 'next/link';
import { Star, MapPin, Clock, Shield, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SitterProfile } from '@/lib/types';
import { SERVICE_LABELS as serviceLabels } from '@/lib/types';

interface SitterCardProps {
  profile: SitterProfile & { user?: { name: string; avatar_url: string | null } };
}

export function SitterCard({ profile }: SitterCardProps) {
  const lowestPrice = Math.min(...Object.values(profile.prices).filter((p): p is number => typeof p === 'number'));

  return (
    <Link href={`/sitter/${profile.user_id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md group-hover:scale-105 transition-transform">
              <AvatarImage src={profile.user?.avatar_url || ''} alt={profile.user?.name || ''} />
              <AvatarFallback className="bg-orange-200 text-orange-700 text-2xl">
                {profile.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute top-3 right-3 flex gap-1">
              {profile.verified && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificiran
                </Badge>
              )}
              {profile.superhost && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Superhost
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">
                {profile.user?.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {profile.city}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-sm">{profile.rating_avg.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({profile.review_count} recenzija)</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.services.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs font-normal">
                  {serviceLabels[service]}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {profile.response_time || 'N/A'}
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-orange-500">od {lowestPrice}&euro;</span>
                <span className="text-xs text-muted-foreground">/usluga</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
