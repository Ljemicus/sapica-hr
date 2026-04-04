'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Users, ClipboardList, Shield, CheckCircle, XCircle, Search, MapPin, FileCheck, ShieldCheck, Eye, EyeOff, LayoutDashboard, ArrowRight, MessageSquare, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { STATUS_LABELS, SERVICE_LABELS, PROVIDER_APPLICATION_STATUS_LABELS, PROVIDER_APPLICATION_STATUS_COLORS, type User, type Booking, type SitterProfile, type BookingStatus, type ServiceType, type ProviderApplication, type ProviderApplicationStatus, type ForumTopic, type ForumComment } from '@/lib/types';
import type { PublicStatus } from '@/lib/types/trust';

const PUBLIC_STATUS_LABELS: Record<PublicStatus, string> = {
  draft: 'Skica',
  pending_review: 'Na pregledu',
  public: 'Javno',
  hidden: 'Skriveno',
  suspended: 'Suspendirano',
};
import { toast } from 'sonner';
import { AdminVerificationQueue } from '@/components/admin-verification-queue';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
};

const roleColors: Record<string, string> = {
  owner: 'bg-blue-50 text-blue-700 border-blue-200',
  sitter: 'bg-green-50 text-green-700 border-green-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
};

const roleLabels: Record<string, string> = {
  owner: 'Vlasnik',
  sitter: 'Sitter',
  admin: 'Admin',
};

interface Props {
  users: User[];
  bookings: (Booking & { owner: { name: string }; sitter: { name: string } })[];
  sitters: (SitterProfile & { user: { name: string; email: string } })[];
  providerApplications: ProviderApplication[];
  forumTopics: ForumTopic[];
  forumComments: ForumComment[];
}

export function AdminContent({ users, bookings, sitters, providerApplications, forumTopics, forumComments }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const router = useRouter();

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    const response = await fetch('/api/admin/sitter-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, verified: !currentStatus }),
    });
    if (!response.ok) toast.error('Greška pri ažuriranju');
    else { toast.success(!currentStatus ? 'Sitter verificiran!' : 'Verifikacija uklonjena'); router.refresh(); }
  };

  const reviewProviderApplication = async (applicationId: string, status: ProviderApplicationStatus) => {
    setReviewingId(applicationId);
    const response = await fetch('/api/admin/provider-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status, adminNotes: adminNotes[applicationId] || '' }),
    });
    if (!response.ok) toast.error('Greška pri ažuriranju prijave');
    else { toast.success(status === 'active' ? 'Prijava odobrena!' : status === 'rejected' ? 'Prijava odbijena' : 'Status ažuriran'); router.refresh(); }
    setReviewingId(null);
  };

  const updateProviderPublicStatus = async (applicationId: string, publicStatus: PublicStatus) => {
    setReviewingId(applicationId);
    try {
      const response = await fetch('/api/admin/provider-public-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, publicStatus, adminNotes: adminNotes[applicationId] || '' }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Greška pri ažuriranju javnog statusa');
      }

      toast.success(
        publicStatus === 'public'
          ? 'Provider je javno objavljen'
          : publicStatus === 'hidden'
            ? 'Provider je sakriven'
            : 'Javni status ažuriran'
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri ažuriranju javnog statusa');
    } finally {
      setReviewingId(null);
    }
  };

  const pendingApplications = providerApplications.filter(a => a.status === 'pending_verification');

  const moderateForum = async (targetType: 'topic' | 'comment', targetId: string, action: 'hide' | 'unhide' | 'lock' | 'unlock') => {
    setReviewingId(targetId);
    try {
      const response = await fetch('/api/admin/forum/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Greška pri moderaciji foruma');
      toast.success('Forum moderacija spremljena');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri moderaciji foruma');
    } finally {
      setReviewingId(null);
    }
  };

  const sortedProviderApplications = [...providerApplications].sort((a, b) => {
    const priority = (app: ProviderApplication) => {
      if (app.status === 'pending_verification') return 0;
      if (app.status === 'active' && app.public_status !== 'public') return 1;
      if (app.public_status === 'public') return 2;
      return 3;
    };

    return priority(a) - priority(b);
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 animate-fade-in-up flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
          <p className="text-muted-foreground mt-1">Upravljajte korisnicima, rezervacijama i verifikacijama</p>
        </div>
        <Link href="/admin/founder-dashboard">
          <Button variant="outline" className="w-full md:w-auto">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Founder dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Korisnika', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Sittera', value: sitters.length, icon: Shield, color: 'from-green-500 to-emerald-500' },
          { label: 'Rezervacija', value: bookings.length, icon: ClipboardList, color: 'from-purple-500 to-pink-500' },
          { label: 'Provider prijave', value: pendingApplications.length, icon: FileCheck, color: 'from-teal-500 to-cyan-500' },
        ].map((stat, i) => (
          <Card key={stat.label} className={`border-0 shadow-sm animate-fade-in-up delay-${(i + 1) * 100}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="users" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Users className="h-4 w-4 mr-1.5" /> Korisnici</TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><ClipboardList className="h-4 w-4 mr-1.5" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="verification" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Shield className="h-4 w-4 mr-1.5" /> Verifikacija</TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
            <FileCheck className="h-4 w-4 mr-1.5" /> Provideri
            {pendingApplications.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-yellow-500 text-white text-xs font-bold">
                {pendingApplications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="identity" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
            <ShieldCheck className="h-4 w-4 mr-1.5" /> Identitet
          </TabsTrigger>
          <TabsTrigger value="forum" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
            <MessageSquare className="h-4 w-4 mr-1.5" /> Forum
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Pretraži korisnike po imenu ili emailu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 focus:border-orange-300 rounded-xl" />
          </div>
          <div className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
              <div className="col-span-5">Korisnik</div>
              <div className="col-span-3">Uloga</div>
              <div className="col-span-2">Grad</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            <div className="divide-y">
              {filteredUsers.map((u) => (
                <div key={u.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{u.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Badge className={`${roleColors[u.role]} border text-xs`}>{roleLabels[u.role] || u.role}</Badge>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {u.city || '—'}
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="w-2 h-2 rounded-full bg-green-400 inline-block" title="Aktivan" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-2 animate-fade-in">
          <div className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
              <div className="col-span-4">Vlasnik → Sitter</div>
              <div className="col-span-3">Usluga / Datum</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Cijena</div>
            </div>
            <div className="divide-y">
              {bookings.map((b) => (
                <div key={b.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-4">
                    <p className="text-sm"><span className="font-medium">{b.owner?.name}</span> <span className="text-muted-foreground">→</span> <span className="font-medium">{b.sitter?.name}</span></p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs font-medium">{SERVICE_LABELS[b.service_type as ServiceType]}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(b.start_date), 'd. MMM', { locale: hr })} — {format(new Date(b.end_date), 'd. MMM', { locale: hr })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Badge className={`${statusColors[b.status as BookingStatus]} border text-xs`}>{STATUS_LABELS[b.status as BookingStatus]}</Badge>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-bold text-sm text-orange-500">{b.total_price}€</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-3 animate-fade-in">
          {sitters.map((s) => (
            <Card key={s.user_id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.verified ? 'from-green-400 to-emerald-300' : 'from-gray-300 to-gray-200'} flex items-center justify-center`}>
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{s.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{s.user?.email} · {s.city} · {s.experience_years} god. iskustva · {s.review_count} recenzija</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.verified ? (
                    <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verificiran
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-50">Neverificiran</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={s.verified ? 'outline' : 'default'}
                    className={!s.verified ? 'bg-green-600 hover:bg-green-700 btn-hover shadow-sm' : 'text-red-500 hover:bg-red-50 hover:border-red-200'}
                    onClick={() => toggleVerification(s.user_id, s.verified)}
                  >
                    {s.verified ? <><XCircle className="h-3 w-3 mr-1" /> Ukloni</> : <><CheckCircle className="h-3 w-3 mr-1" /> Verificiraj</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4 animate-fade-in">
          {providerApplications.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                Nema provider prijava.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedProviderApplications.map((app) => (
                <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{app.display_name}</p>
                          <Badge className={`${PROVIDER_APPLICATION_STATUS_COLORS[app.status]} border text-xs`}>
                            {PROVIDER_APPLICATION_STATUS_LABELS[app.status]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Javno: {PUBLIC_STATUS_LABELS[app.public_status]}
                          </Badge>
                          {app.stripe_onboarding_complete && (
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs">Stripe OK</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {app.provider_type} · {app.city || 'Nema grada'} · {app.experience_years} god. iskustva
                          {app.oib && ` · OIB: ${app.oib}`}
                        </p>
                        {app.services.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Usluge: {app.services.join(', ')}
                          </p>
                        )}
                        {app.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{app.bio}</p>
                        )}
                        {app.business_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">Tvrtka: {app.business_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Admin notes input + action buttons */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Admin bilješka (opcionalno)..."
                          value={adminNotes[app.id] ?? app.admin_notes ?? ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="text-sm rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {app.status !== 'active' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 shadow-sm"
                            disabled={reviewingId === app.id}
                            onClick={() => reviewProviderApplication(app.id, 'active')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Odobri prijavu
                          </Button>
                        )}
                        {app.status === 'active' && app.public_status !== 'public' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                            disabled={reviewingId === app.id}
                            onClick={() => updateProviderPublicStatus(app.id, 'public')}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Objavi javno
                          </Button>
                        )}
                        {app.public_status === 'public' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-500 hover:bg-orange-50 hover:border-orange-200"
                            disabled={reviewingId === app.id}
                            onClick={() => updateProviderPublicStatus(app.id, 'hidden')}
                          >
                            <EyeOff className="h-3 w-3 mr-1" /> Sakrij
                          </Button>
                        )}
                        {app.status !== 'rejected' && app.status !== 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:bg-red-50 hover:border-red-200"
                            disabled={reviewingId === app.id}
                            onClick={() => reviewProviderApplication(app.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Odbij
                          </Button>
                        )}
                        {app.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-500 hover:bg-orange-50 hover:border-orange-200"
                            disabled={reviewingId === app.id}
                            onClick={() => reviewProviderApplication(app.id, 'restricted')}
                          >
                            Ograniči prijavu
                          </Button>
                        )}
                      </div>
                    </div>

                    {app.reviewed_at && (
                      <p className="text-xs text-muted-foreground">
                        Zadnji pregled: {new Date(app.reviewed_at).toLocaleDateString('hr-HR')}
                        {app.admin_notes && ` — "${app.admin_notes}"`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="identity" className="space-y-4 animate-fade-in">
          <AdminVerificationQueue />
        </TabsContent>

        <TabsContent value="forum" className="space-y-4 animate-fade-in">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Forum teme</h3>
                  <p className="text-sm text-muted-foreground">Brzo sakrij, otključaj ili zaključaš raspravu kad treba.</p>
                </div>
                <Badge variant="outline">{forumTopics.length} tema · {forumComments.length} komentara</Badge>
              </div>
              <div className="space-y-3">
                {forumTopics.map((topic) => (
                  <div key={topic.id} className="rounded-xl border p-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{topic.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {topic.author_name} · {topic.category_slug} · status: {topic.status || 'active'} · {topic.comment_count} komentara · {topic.likes} lajkova
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {topic.status !== 'hidden' ? (
                          <Button size="sm" variant="outline" className="text-orange-500 hover:bg-orange-50" disabled={reviewingId === topic.id} onClick={() => moderateForum('topic', topic.id, 'hide')}>
                            <EyeOff className="h-3 w-3 mr-1" /> Sakrij
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50" disabled={reviewingId === topic.id} onClick={() => moderateForum('topic', topic.id, 'unhide')}>
                            <Eye className="h-3 w-3 mr-1" /> Vrati
                          </Button>
                        )}
                        {topic.status !== 'locked' ? (
                          <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" disabled={reviewingId === topic.id} onClick={() => moderateForum('topic', topic.id, 'lock')}>
                            <Lock className="h-3 w-3 mr-1" /> Lock
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" disabled={reviewingId === topic.id} onClick={() => moderateForum('topic', topic.id, 'unlock')}>
                            <Unlock className="h-3 w-3 mr-1" /> Unlock
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Zadnji komentari</h3>
              <div className="space-y-3">
                {forumComments.slice(-10).reverse().map((comment) => (
                  <div key={comment.id} className="rounded-xl border p-4 bg-white flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground/90 line-clamp-2">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{comment.author_name} · status: {comment.status || 'active'} · {comment.likes} lajkova</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {comment.status !== 'hidden' ? (
                        <Button size="sm" variant="outline" className="text-orange-500 hover:bg-orange-50" disabled={reviewingId === comment.id} onClick={() => moderateForum('comment', comment.id, 'hide')}>
                          <EyeOff className="h-3 w-3 mr-1" /> Sakrij
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50" disabled={reviewingId === comment.id} onClick={() => moderateForum('comment', comment.id, 'unhide')}>
                          <Eye className="h-3 w-3 mr-1" /> Vrati
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
