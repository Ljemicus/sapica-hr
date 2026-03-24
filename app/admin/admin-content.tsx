'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Users, ClipboardList, Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/page-header';
import { createClient } from '@/lib/supabase/client';
import { STATUS_LABELS, SERVICE_LABELS, type User, type Booking, type SitterProfile, type BookingStatus, type ServiceType } from '@/lib/types';
import { toast } from 'sonner';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const roleColors: Record<string, string> = {
  owner: 'bg-blue-100 text-blue-700',
  sitter: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
};

interface Props {
  users: User[];
  bookings: (Booking & { owner: { name: string }; sitter: { name: string } })[];
  sitters: (SitterProfile & { user: { name: string; email: string } })[];
}

export function AdminContent({ users, bookings, sitters }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('sitter_profiles')
      .update({ verified: !currentStatus })
      .eq('user_id', userId);

    if (error) toast.error('Greška pri ažuriranju');
    else { toast.success(!currentStatus ? 'Sitter verificiran!' : 'Verifikacija uklonjena'); router.refresh(); }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader title="Admin panel" description="Upravljajte korisnicima, rezervacijama i verifikacijama" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Korisnika</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sitters.length}</p>
            <p className="text-xs text-muted-foreground">Sittera</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Rezervacija</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sitters.filter(s => s.verified).length}</p>
            <p className="text-xs text-muted-foreground">Verificiranih</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Korisnici</TabsTrigger>
          <TabsTrigger value="bookings"><ClipboardList className="h-4 w-4 mr-1" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="verification"><Shield className="h-4 w-4 mr-1" /> Verifikacija</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Pretraži korisnike..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatar_url || ''} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">{u.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[u.role]}>{u.role}</Badge>
                    <span className="text-xs text-muted-foreground">{u.city || '—'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-2">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm"><span className="font-medium">{b.owner?.name}</span> → <span className="font-medium">{b.sitter?.name}</span></p>
                    <p className="text-xs text-muted-foreground">
                      {SERVICE_LABELS[b.service_type as ServiceType]} · {format(new Date(b.start_date), 'd. MMM', { locale: hr })} — {format(new Date(b.end_date), 'd. MMM yyyy.', { locale: hr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[b.status as BookingStatus]}>{STATUS_LABELS[b.status as BookingStatus]}</Badge>
                    <span className="font-semibold text-sm text-orange-500">{b.total_price}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="verification" className="space-y-2">
          {sitters.map((s) => (
            <Card key={s.user_id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{s.user?.email} · {s.city} · {s.experience_years} god. iskustva · {s.review_count} recenzija</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.verified ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verificiran
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Neverificiran</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={s.verified ? 'outline' : 'default'}
                    className={!s.verified ? 'bg-green-600 hover:bg-green-700' : 'text-red-500'}
                    onClick={() => toggleVerification(s.user_id, s.verified)}
                  >
                    {s.verified ? <><XCircle className="h-3 w-3 mr-1" /> Ukloni</> : <><CheckCircle className="h-3 w-3 mr-1" /> Verificiraj</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
