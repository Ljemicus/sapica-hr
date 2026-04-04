import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_DOC_TYPES = new Set([
  'id_document',
  'selfie_with_document',
  'business_doc',
  'qualification_doc',
]);

const BUCKET = 'verification-docs';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for identity docs

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
}

export async function POST(request: NextRequest) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('upload.verification', reqId);
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`verification-upload:${user.id}:${ip}`, 6, 60_000)) {
      log.warn( 'Rate limit hit', { userId: user.id, ip }, 'P3');
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše uploadova. Pokušajte kasnije.' });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = ((formData.get('document_type') as string) || '').trim();
    const folder = ((formData.get('folder') as string) || 'verification').trim();

    if (!file) {
      log.warn( 'Upload rejected — file missing', { userId: user.id });
      return apiError({ status: 400, code: 'FILE_MISSING', message: 'No file provided' });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      log.warn( 'Upload rejected — invalid file type', { userId: user.id, fileType: file.type });
      return apiError({
        status: 400,
        code: 'INVALID_FILE_TYPE',
        message: 'Dozvoljene su samo JPG, PNG, WebP slike i PDF dokumenti.',
      });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      log.warn( 'Upload rejected — file too large', { userId: user.id, fileSize: file.size });
      return apiError({ status: 400, code: 'FILE_TOO_LARGE', message: 'Datoteka je prevelika. Max 10MB.' });
    }
    if (!ALLOWED_DOC_TYPES.has(documentType)) {
      log.warn( 'Upload rejected — invalid doc type', { userId: user.id, documentType });
      return apiError({ status: 400, code: 'INVALID_DOC_TYPE', message: 'Invalid document type' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      log.error( 'Storage not configured — missing env vars');
      dispatchAlert({
        severity: 'P1',
        service: 'upload.verification',
        description: 'Storage not configured — Supabase env vars missing',
        owner: 'platform',
      });
      return apiError({ status: 500, code: 'STORAGE_UNAVAILABLE', message: 'Storage not configured' });
    }

    const safeFolder = sanitizeSegment(folder) || 'verification';
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `users/${user.id}/${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      log.error( 'Storage upload failed', {
        userId: user.id,
        bucket: BUCKET,
        path,
        reason: error.message,
      });
      dispatchAlert({
        severity: 'P1',
        service: 'upload.verification',
        description: 'Verification document upload to storage failed',
        value: `path=${path}, error=${error.message}`,
        owner: 'platform',
      });
      return apiError({ status: 500, code: 'UPLOAD_FAILED', message: error.message });
    }

    log.info( 'Verification document uploaded', {
      userId: user.id,
      documentType,
      path,
      fileSize: file.size,
      fileType: file.type,
    });

    // Return private reference — no public URL
    return NextResponse.json({
      bucket: BUCKET,
      path,
      document_type: documentType,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    log.error( 'Upload failed unexpectedly', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    dispatchAlert({
      severity: 'P1',
      service: 'upload.verification',
      description: 'Unhandled verification upload failure',
      value: error instanceof Error ? error.message : 'unknown',
      owner: 'platform',
    });
    return apiError({ status: 500, code: 'UPLOAD_FAILED', message: 'Upload failed' });
  }
}
