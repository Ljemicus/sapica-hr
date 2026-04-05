import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { dispatchAlert } from '@/lib/alerting';
import { getAuthUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import {
  createRescueVerificationDocument,
  getRescueOrganization,
  updateRescueOrganization,
} from '@/lib/db';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { rateLimit } from '@/lib/rate-limit';
import type { RescueVerificationDocumentType } from '@/lib/types';

const BUCKET = 'rescue-verification-docs';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_DOC_TYPES = new Set<RescueVerificationDocumentType>([
  'registration_certificate',
  'charity_proof',
  'bank_confirmation',
  'identity_document',
  'other',
]);

function sanitizeSegment(value: string) {
  return value
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('upload.rescue-verification', reqId);

  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`rescue-verification-upload:${user.id}:${ip}`, 6, 60_000)) {
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše uploadova. Pokušaj opet za minutu.' });
    }

    const formData = await request.formData();
    const organizationId = String(formData.get('organizationId') ?? '').trim();
    const documentType = String(formData.get('document_type') ?? '').trim() as RescueVerificationDocumentType;
    const documentNotes = String(formData.get('document_notes') ?? '').trim();
    const file = formData.get('file');

    if (!organizationId) {
      return apiError({ status: 400, code: 'MISSING_ORGANIZATION', message: 'organizationId je obavezan.' });
    }

    const organization = await getRescueOrganization(organizationId);
    if (!organization || organization.owner_user_id !== user.id) {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Nemaš pristup ovoj organizaciji.' });
    }

    if (!(file instanceof File)) {
      return apiError({ status: 400, code: 'FILE_MISSING', message: 'Dokument je obavezan.' });
    }

    if (!ALLOWED_DOC_TYPES.has(documentType)) {
      return apiError({ status: 400, code: 'INVALID_DOCUMENT_TYPE', message: 'Nepodržan tip dokumenta.' });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return apiError({ status: 400, code: 'INVALID_FILE_TYPE', message: 'Dozvoljeni su PDF, JPG, PNG i WebP dokumenti.' });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return apiError({ status: 400, code: 'FILE_TOO_LARGE', message: 'Datoteka mora biti između 1 B i 10 MB.' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      dispatchAlert({
        severity: 'P1',
        service: 'upload.rescue-verification',
        description: 'Rescue verification storage is not configured',
        owner: 'platform',
      });
      return apiError({ status: 500, code: 'STORAGE_UNAVAILABLE', message: 'Storage nije konfiguriran.' });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const safeType = sanitizeSegment(documentType) || 'other';
    const safeFileStem = sanitizeSegment(file.name.replace(/\.[^.]+$/, '')) || 'document';
    const storagePath = `orgs/${organization.id}/${safeType}/${Date.now()}-${crypto.randomUUID()}-${safeFileStem}.${extension}`;

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage.from(BUCKET).upload(storagePath, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      log.error('Rescue verification storage upload failed', {
        userId: user.id,
        organizationId,
        storagePath,
        reason: uploadError.message,
      });
      dispatchAlert({
        severity: 'P1',
        service: 'upload.rescue-verification',
        description: 'Rescue verification document upload failed',
        value: uploadError.message,
        owner: 'platform',
      });
      return apiError({ status: 500, code: 'UPLOAD_FAILED', message: 'Upload u storage nije uspio.' });
    }

    const created = await createRescueVerificationDocument({
      organization_id: organization.id,
      document_type: documentType,
      storage_bucket: BUCKET,
      storage_path: storagePath,
      uploaded_by: user.id,
      original_filename: file.name || null,
      mime_type: file.type || null,
      file_size_bytes: file.size,
      document_notes: documentNotes || null,
    });

    if (!created) {
      await adminClient.storage.from(BUCKET).remove([storagePath]).catch(() => undefined);
      return apiError({ status: 500, code: 'DOCUMENT_SAVE_FAILED', message: 'Dokument je uploadan, ali metadata zapis nije spremljen.' });
    }

    await updateRescueOrganization(organization.id, {
      verification_status: organization.verification_status === 'approved' ? 'approved' : 'pending',
      review_state: organization.review_state === 'approved' ? 'approved' : 'pending',
      status: organization.status === 'active' ? 'active' : 'pending_review',
      verification_submitted_at: organization.verification_submitted_at ?? new Date().toISOString(),
    });

    log.info('Rescue verification document uploaded', {
      userId: user.id,
      organizationId,
      documentId: created.id,
      storagePath,
      fileSize: file.size,
      mimeType: file.type,
    });

    return NextResponse.json({ document: created });
  } catch (error) {
    dispatchAlert({
      severity: 'P1',
      service: 'upload.rescue-verification',
      description: 'Unhandled rescue verification upload failure',
      value: error instanceof Error ? error.message : 'unknown',
      owner: 'platform',
    });
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}
