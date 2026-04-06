import { Edit, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS, type SitterProfile, type ServiceType } from '@/lib/types';

interface Props {
  profile: SitterProfile | null;
  onEdit: () => void;
}

export function SitterProfileTab({ profile, onEdit }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Moj profil</CardTitle>
          <Button onClick={onEdit} variant="outline" size="sm" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
            <Edit className="h-4 w-4 mr-1" /> Uredi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile ? (
          <>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
              <p className="text-sm leading-relaxed">{profile.bio || 'Nije postavljeno'}</p>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Iskustvo</h4>
              <p className="text-sm">{profile.experience_years} godina</p>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Usluge i cijene</h4>
              <div className="flex flex-wrap gap-2">
                {profile.services.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                    {SERVICE_LABELS[s as ServiceType]} — {profile.prices[s]}€
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Grad</h4>
              <p className="text-sm">{profile.city || 'Nije postavljeno'}</p>
            </div>
            <div className="flex gap-2">
              {profile.verified && <Badge className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-50">✓ Verificiran profil</Badge>}
              {profile.superhost && <Badge className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-50">★ Top izbor</Badge>}
              {profile.instant_booking && <Badge className="bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-50"><Zap className="h-3 w-3 mr-1" /> Instant booking</Badge>}
            </div>
          </>
        ) : (
          <EmptyState
            icon={User}
            title="Profil nije postavljen"
            description="Postavite svoj sitter profil da biste primali rezervacije."
            action={<Button onClick={onEdit} className="bg-orange-500 hover:bg-orange-600 btn-hover">Postavi profil</Button>}
          />
        )}
      </CardContent>
    </Card>
  );
}
