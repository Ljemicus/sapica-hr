import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getProviderApplication, upsertProviderApplication } from '@/lib/db/provider-applications';
import { getVerification, upsertVerification } from '@/lib/db/provider-verifications';
import { createProviderDocument } from '@/lib/db/provider-documents';
import { getProviderProfileCompleteness } from '@/lib/trust/completeness';
import type { DocumentType } from '@/lib/types/trust';

interface DocumentInput {
  document_type: DocumentType;
  storage_bucket: string;
  storage_path: string;
}

interface SubmitBody {
  full_name: string;
  date_of_birth: string;
  address: string;
  documents: DocumentInput[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const application = await getProviderApplication(user.id);
    if (!application) {
      return apiError({ status: 404, code: 'NO_APPLICATION', message: 'Nema provider prijave.' });
    }

    const existing = await getVerification(application.id, 'identity');
    if (existing && existing.status === 'pending') {
      return apiError({ status: 409, code: 'ALREADY_PENDING', message: 'Zahtjev za verifikaciju je već poslan i čeka pregled.' });
    }
    if (existing && existing.status === 'approved') {
      return apiError({ status: 409, code: 'ALREADY_APPROVED', message: 'Identitet je već verificiran.' });
    }

    const body: SubmitBody = await request.json();

    if (!body.full_name?.trim()) {
      return apiError({ status: 400, code: 'MISSING_FIELD', message: 'Puno ime je obavezno.' });
    }
    if (!body.date_of_birth?.trim()) {
      return apiError({ status: 400, code: 'MISSING_FIELD', message: 'Datum rođenja je obavezan.' });
    }
    if (!body.address?.trim()) {
      return apiError({ status: 400, code: 'MISSING_FIELD', message: 'Adresa je obavezna.' });
    }
    if (!body.documents || body.documents.length < 2) {
      return apiError({ status: 400, code: 'MISSING_DOCUMENTS', message: 'Potrebna su najmanje 2 dokumenta (dokument identiteta i selfie s dokumentom).' });
    }

    const hasIdDoc = body.documents.some(d => d.document_type === 'id_document');
    const hasSelfie = body.documents.some(d => d.document_type === 'selfie_with_document');
    if (!hasIdDoc || !hasSelfie) {
      return apiError({ status: 400, code: 'MISSING_DOCUMENTS', message: 'Potrebni su dokument identiteta i selfie s dokumentom.' });
    }

    // Create or update verification record
    const verification = await upsertVerification(application.id, 'identity', 'pending');
    if (!verification) {
      return apiError({ status: 500, code: 'VERIFICATION_FAILED', message: 'Nije moguće kreirati zahtjev za verifikaciju.' });
    }

    // Create document records
    const docResults = await Promise.all(
      body.documents.map(doc =>
        createProviderDocument({
          provider_application_id: application.id,
          provider_verification_id: verification.id,
          document_type: doc.document_type,
          storage_bucket: doc.storage_bucket,
          storage_path: doc.storage_path,
          uploaded_by: user.id,
        })
      )
    );

    const failedDocs = docResults.filter(d => !d);
    if (failedDocs.length > 0) {
      return apiError({ status: 500, code: 'DOCUMENT_SAVE_FAILED', message: 'Neki dokumenti nisu uspješno spremljeni.' });
    }

    const completeness = await getProviderProfileCompleteness(application.id);
    await upsertProviderApplication(user.id, {
      address: body.address.trim(),
    });

    return NextResponse.json({
      verification,
      completeness,
      message: 'Zahtjev za verifikaciju identiteta je uspješno poslan.',
    });
  } catch (error) {
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const application = await getProviderApplication(user.id);
    if (!application) {
      return NextResponse.json({ verification: null });
    }

    const verification = await getVerification(application.id, 'identity');
    return NextResponse.json({ verification });
  } catch {
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: 'Internal error' });
  }
}
