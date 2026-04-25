import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  ClipboardList, 
  FileCheck, 
  HeartHandshake,
  HeartPulse, 
  Mail,
  ShieldAlert, 
  ShieldCheck,
  Target,
  Users 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAuthUser } from '@/lib/auth';
import { getUsers, getAllBookings, getAllProviderApplications, getPendingVerifications, getRescueOrganizations, getRescueVerificationDocuments, getRescueStats } from '@/lib/db';
import { collectKpis } from '@/lib/kpi-digest';
import { runOpsAudit } from '@/lib/ops-audit';
import { getProviderIntegrityIssues } from '@/lib/db/provider-integrity';
import type { ProviderApplication } from '@/lib/types';
import { FounderDashboardRefresh } from './founder-dashboard-refresh';
import { FounderDashboardActions } from './founder-dashboard-actions';
import { RescueReviewQueue } from './rescue-review-queue';

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
  if (user.profileMissing) redirect('/onboarding/profile');
  if (!user.isAdmin) redirect('/');

  const [users, bookings, providerApplications, pendingVerifications, kpi, ops, rescueOrganizations, rescueStats, providerIntegrityIssues] = await Promise.all([
    getUsers('admin-list'),
    getAllBookings('admin-list'),
    getAllProviderApplications(),
    getPendingVerifications(),
    collectKpis(),
    runOpsAudit(),
    getRescueOrganizations(),
    getRescueStats(),
    getProviderIntegrityIssues(),
  ]);

  const rescueDocsPerOrg = await Promise.all(
    rescueOrganizations.map(async (organization) => ({
      organization,
      documents: await getRescueVerificationDocuments(organization.id),
    }))
  );

  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted').length;
  const pendingApplications = providerApplications.filter((app) => app.status === 'pending_verification').length;
  const liveProviders = providerApplications.filter((app) => app.status === 'active' && app.public_status === 'public').length;
  const priorityApplications = getPriorityApplications(providerApplications);
  const rescueReviewQueue = rescueDocsPerOrg
    .filter(({ organization, documents }) => (
      organization.status === 'pending_review'
      || organization.review_state === 'pending'
      || organization.review_state === 'in_review'
      || organization.verification_status === 'pending'
      || organization.external_donation_url_status === 'pending_review'
      || documents.some((document) => document.review_status === 'pending')
    ))
    .sort((a, b) => new Date(b.organization.updated_at).getTime() - new Date(a.organization.updated_at).getTime())
    .slice(0, 5);

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

      {/* Main Stats Row */}
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

      {/* Rescue Stats Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-emerald-600" />
              Rescue Ecosystem
            </h2>
            <p className="text-sm text-muted-foreground">Pregled rescue organizacija i apelacija u sustavu.</p>
          </div>
          <Link href="/admin/rescue">
            <Button variant="outline" size="sm">Upravljaj rescue</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rescueStats.totalOrganizations}</p>
                  <p className="text-xs text-muted-foreground">Ukupno organizacija</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rescueStats.activeOrganizations}</p>
                  <p className="text-xs text-muted-foreground">Aktivnih organizacija</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rescueStats.totalAppeals}</p>
                  <p className="text-xs text-muted-foreground">Ukupno apelacija</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rescueStats.activeAppeals}</p>
                  <p className="text-xs text-muted-foreground">Aktivnih apelacija</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pending Reviews Alert */}
      {(rescueStats.pendingVerifications > 0 || rescueStats.pendingDonationLinks > 0) && (
        <section>
          <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Rescue na čekanju</h3>
                    <p className="text-sm text-amber-800/80">
                      {rescueStats.pendingVerifications > 0 && `${rescueStats.pendingVerifications} verifikacija na čekanju`}
                      {rescueStats.pendingVerifications > 0 && rescueStats.pendingDonationLinks > 0 && ' • '}
                      {rescueStats.pendingDonationLinks > 0 && `${rescueStats.pendingDonationLinks} donation linkova na čekanju`}
                    </p>
                  </div>
                </div>
                <Link href="#rescue-queue">
                  <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
                    Pogledaj queue
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

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
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Provider integrity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
              <span className="text-sm text-muted-foreground">Integrity issues</span>
              <Badge className={providerIntegrityIssues.length === 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}>
                {providerIntegrityIssues.length === 0 ? 'Clean' : `${providerIntegrityIssues.length} issue${providerIntegrityIssues.length === 1 ? '' : 's'}`}
              </Badge>
            </div>
            <div className="space-y-2">
              {providerIntegrityIssues.slice(0, 5).map((issue) => (
                <div key={`${issue.providerId}-${issue.issue}-${issue.details || ''}`} className="rounded-xl border p-3 text-sm">
                  <p className="font-medium">{issue.providerKind} · {issue.issue}</p>
                  <p className="text-xs text-muted-foreground mt-1 break-all">providerId: {issue.providerId}{issue.details ? ` · ${issue.details}` : ''}</p>
                </div>
              ))}
              {providerIntegrityIssues.length === 0 && (
                <p className="text-sm text-muted-foreground">Nema detektiranih listed-provider integrity problema.</p>
              )}
            </div>
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

      <section id="rescue-queue" className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-rose-600" />
              Rescue verification queue
              {rescueReviewQueue.length > 0 && (
                <Badge className="bg-rose-100 text-rose-700 border-0 ml-2">{rescueReviewQueue.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RescueReviewQueue items={rescueReviewQueue} />
          </CardContent>
        </Card>

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
              <Button variant="outline" render={<Link href="/admin/marketing" />}>
                <Mail className="h-4 w-4 mr-2" />
                Email marketing
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
