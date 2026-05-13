import { NextResponse, type NextRequest } from 'next/server';
import { archiveServiceListing, createDraftServiceListing, pauseServiceListing, updateDraftServiceListing } from '@/lib/petpark/service-listings/actions';

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown> = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const result = await createDraftServiceListing({
    providerId: typeof payload.providerId === 'string' ? payload.providerId : undefined,
    providerServiceId: typeof payload.providerServiceId === 'string' ? payload.providerServiceId : undefined,
    title: typeof payload.title === 'string' ? payload.title : '',
    category: typeof payload.category === 'string' ? payload.category : '',
    shortDescription: typeof payload.shortDescription === 'string' ? payload.shortDescription : undefined,
    description: typeof payload.description === 'string' ? payload.description : '',
    city: typeof payload.location === 'string' ? payload.location : '',
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 200 });
}

export async function PATCH(request: NextRequest) {
  let payload: Record<string, unknown> = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  if (payload.action === 'archive' && typeof payload.id === 'string') {
    const result = await archiveServiceListing(payload.id);
    return NextResponse.json(result, { status: 200 });
  }

  if (payload.action === 'pause' && typeof payload.id === 'string') {
    const result = await pauseServiceListing(payload.id);
    return NextResponse.json(result, { status: 200 });
  }

  const result = await updateDraftServiceListing({
    id: typeof payload.id === 'string' ? payload.id : '',
    title: typeof payload.title === 'string' ? payload.title : undefined,
    category: typeof payload.category === 'string' ? payload.category : undefined,
    shortDescription: typeof payload.shortDescription === 'string' ? payload.shortDescription : undefined,
    description: typeof payload.description === 'string' ? payload.description : undefined,
    city: typeof payload.location === 'string' ? payload.location : undefined,
    district: typeof payload.district === 'string' ? payload.district : undefined,
    serviceArea: typeof payload.serviceArea === 'string' ? payload.serviceArea : undefined,
  });

  return NextResponse.json(result, { status: 200 });
}
