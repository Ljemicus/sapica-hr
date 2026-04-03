import { NextResponse } from 'next/server';
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
    return NextResponse.json({ error: 'Spremanje nije uspjelo. Provjerite obavezna polja.' }, { status: 400 });
  }

  return NextResponse.json({ application });
}

export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'Spremanje prijave nije uspjelo' }, { status: 400 });
  }

  const application = await submitProviderApplication(user.id);
  if (!application) {
    return NextResponse.json({ error: 'Slanje prijave nije uspjelo' }, { status: 500 });
  }

  const directoryLink = await autoLinkProviderDirectoryListing(user.id, application, user.email);

  return NextResponse.json({ application, directoryLink });
}
