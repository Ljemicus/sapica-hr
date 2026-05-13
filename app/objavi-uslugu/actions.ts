'use server';

import { createDraftServiceListing } from '@/lib/petpark/service-listings/actions';

export type PublishServiceFormState = {
  ok: boolean;
  message: string;
  reason?: string;
};

export async function submitPreparedServiceListing(_previousState: PublishServiceFormState, formData: FormData): Promise<PublishServiceFormState> {
  const result = await createDraftServiceListing({
    title: String(formData.get('title') || ''),
    category: String(formData.get('category') || ''),
    description: String(formData.get('description') || ''),
    city: String(formData.get('location') || ''),
  });

  return {
    ok: result.ok,
    message: result.ok ? 'Usluga je spremljena kao nacrt.' : result.message,
    reason: result.ok ? undefined : result.reason,
  };
}
