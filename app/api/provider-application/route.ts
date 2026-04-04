import { NextResponse } from 'next/server';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { getAuthUser } from '@/lib/auth';
import {
  getProviderApplication,
  submitProviderApplication,
  upsertProviderApplication,
} from '@/lib/db/provider-applications';
import { autoLinkProviderDirectoryListing } from '@/lib/db/provider-directory-linking';
import { providerApplicationSchema, providerDraftSchema } from '@/lib/validations';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const application = await getProviderApplication(user.id);
  return NextResponse.json({ application });
}

export async function PUT(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('provider.application', reqId);
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });

  const parsed = providerDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Neispravni podaci', issues: parsed.error.flatten() }, { status: 400 });
  }

  const application = await upsertProviderApplication(user.id, parsed.data);
  if (!application) {
    log.warn( 'Draft save failed', { userId: user.id });
    return NextResponse.json({ error: 'Spremanje nije uspjelo. Provjerite obavezna polja.' }, { status: 400 });
  }

  log.info( 'Draft saved', { userId: user.id, applicationId: application.id });
  return NextResponse.json({ application });
}

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('provider.application', reqId);
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });
  const parsed = providerApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Neispravni podaci', issues: parsed.error.flatten() }, { status: 400 });
  }

  const saved = await upsertProviderApplication(user.id, parsed.data);
  if (!saved) {
    log.warn( 'Application save failed before submit', { userId: user.id });
    return NextResponse.json({ error: 'Spremanje prijave nije uspjelo' }, { status: 400 });
  }

  const application = await submitProviderApplication(user.id);
  if (!application) {
    log.error( 'Application submit failed', { userId: user.id });
    dispatchAlert({
      severity: 'P2',
      service: 'provider.application',
      description: 'Provider application submit failed — could not transition to pending_verification',
      value: `userId=${user.id}`,
      owner: 'platform',
    });
    return NextResponse.json({ error: 'Slanje prijave nije uspjelo' }, { status: 500 });
  }

  log.info( 'Application submitted', {
    userId: user.id,
    applicationId: application.id,
    providerType: application.provider_type,
  });

  const directoryLink = await autoLinkProviderDirectoryListing(user.id, application, user.email);

  return NextResponse.json({ application, directoryLink });
}
