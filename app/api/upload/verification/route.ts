import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { appLogger } from '@/lib/logger';
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
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`verification-upload:${user.id}:${ip}`, 6, 60_000)) {
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše uploadova. Pokušajte kasnije.' });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = ((formData.get('document_type') as string) || '').trim();
    const folder = ((formData.get('folder') as string) || 'verification').trim();

    if (!file) {
      return apiError({ status: 400, code: 'FILE_MISSING', message: 'No file provided' });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return apiError({
        status: 400,
        code: 'INVALID_FILE_TYPE',
        message: 'Dozvoljene su samo JPG, PNG, WebP slike i PDF dokumenti.',
      });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return apiError({ status: 400, code: 'FILE_TOO_LARGE', message: 'Datoteka je prevelika. Max 10MB.' });
    }
    if (!ALLOWED_DOC_TYPES.has(documentType)) {
      return apiError({ status: 400, code: 'INVALID_DOC_TYPE', message: 'Invalid document type' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
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
      appLogger.error('upload.verification', 'Storage upload failed', {
        userId: user.id,
        bucket: BUCKET,
        path,
        reason: error.message,
      });
      return apiError({ status: 500, code: 'UPLOAD_FAILED', message: error.message });
    }

    // Return private reference — no public URL
    return NextResponse.json({
      bucket: BUCKET,
      path,
      document_type: documentType,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    appLogger.error('upload.verification', 'Upload failed unexpectedly', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return apiError({ status: 500, code: 'UPLOAD_FAILED', message: 'Upload failed' });
  }
}
