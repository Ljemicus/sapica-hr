import { NextResponse, type NextRequest } from 'next/server';
import { createDraftServiceListing } from '@/lib/petpark/service-listings/actions';

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
