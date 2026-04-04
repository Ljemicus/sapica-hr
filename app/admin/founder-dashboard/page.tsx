import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, FileCheck, HeartPulse, ShieldAlert, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAuthUser } from '@/lib/auth';
import { getUsers, getAllBookings, getAllProviderApplications, getPendingVerifications } from '@/lib/db';
import { collectKpis } from '@/lib/kpi-digest';
import { runOpsAudit } from '@/lib/ops-audit';
import type { ProviderApplication } from '@/lib/types';
import { FounderDashboardRefresh } from './founder-dashboard-refresh';
import { FounderDashboardActions } from './founder-dashboard-actions';

export const metadata: Metadata = {
  title: 'Founder Dashboard',
};

function getPriorityApplications(apps: ProviderApplication[]) {
  return [...apps]
    .filter((app) => app.status === 'pending_verification' || (app.status === 'active' && app.public_status !== 'public'))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);
}

export default async function FounderDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fadmin%2Ffounder-dashboard');
  if (user.role !== 'admin') redirect('/');

  const [users, bookings, providerApplications, pendingVerifications, kpi, ops] = await Promise.all([
    getUsers('admin-list'),
    getAllBookings('admin-list'),
    getAllProviderApplications(),
    getPendingVerifications(),
    collectKpis(),
    runOpsAudit(),
  ]);

  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted').length;
  const pendingApplications = providerApplications.filter((app) => app.status === 'pending_verification').length;
  const liveProviders = providerApplications.filter((app) => app.status === 'active' && app.public_status === 'public').length;
  const priorityApplications = getPriorityApplications(providerApplications);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600">Founder Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">PetPark owner cockpit</h1>
          <p className="text-muted-foreground mt-1">Jedan ekran za health, KPI, ops i quick actions bez kopanja po Slacku i routeovima.</p>
        </div>
        <div className="flex items-center gap-2">
          <FounderDashboardRefresh />
          <Link href="/admin">
            <Button variant="outline" size="sm">Admin panel</Button>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Korisnici', value: users.length, icon: Users },
          { label: 'Aktivni bookingi', value: activeBookings, icon: ClipboardList },
          { label: 'Pending prijave', value: pendingApplications, icon: FileCheck },
          { label: 'Live provideri', value: liveProviders, icon: CheckCircle2 },
        ].map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartPulse className="h-5 w-5 text-green-600" />
              System health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
              <span className="text-sm text-muted-foreground">Ops audit status</span>
              <Badge className={ops.healthy ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}>
                {ops.healthy ? 'Healthy' : 'Needs attention'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3">
                <p className="text-muted-foreground">Audit findings</p>
                <p className="mt-1 text-xl font-semibold">{ops.findings.length}</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-muted-foreground">Pending verifications</p>
                <p className="mt-1 text-xl font-semibold">{pendingVerifications.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Zadnji server-side audit renderan odmah pri otvaranju dashboarda.</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              KPI snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Novi signupovi</p>
              <p className="mt-1 text-xl font-semibold">{kpi.users.newSignups}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Ukupno usera</p>
              <p className="mt-1 text-xl font-semibold">{kpi.users.total}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Booking created (24h)</p>
              <p className="mt-1 text-xl font-semibold">{kpi.bookings.created}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Active bookings</p>
              <p className="mt-1 text-xl font-semibold">{kpi.bookings.totalActive}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Nove prijave</p>
              <p className="mt-1 text-xl font-semibold">{kpi.providers.newApplications}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground">Pending review</p>
              <p className="mt-1 text-xl font-semibold">{kpi.providers.pendingApplications}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Alerts & findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ops.findings.length === 0 ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Nema aktivnih warninga ni critical nalaza. Za promjenu, sve se ponaša kao odrasla aplikacija.
              </div>
            ) : (
              ops.findings.map((finding) => (
                <div key={finding.check} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{finding.check}</p>
                      <p className="text-sm text-muted-foreground mt-1">{finding.message}</p>
                    </div>
                    <Badge className={finding.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}>
                      {finding.severity}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-teal-600" />
              Marketplace ops
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityApplications.length === 0 ? (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                Nema priority provider slučajeva. Admin queue trenutno ne gori.
              </div>
            ) : (
              priorityApplications.map((app) => (
                <div key={app.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{app.display_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{app.provider_type} · {app.city || 'Bez grada'} · {app.status}</p>
                    </div>
                    <Badge variant="outline">{app.public_status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FounderDashboardActions />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button render={<Link href="/admin" />}>
                Otvori admin panel
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" render={<Link href="/admin#providers" />}>
                Provider applications
              </Button>
              <Button variant="outline" render={<Link href="/admin#identity" />}>
                Verifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
