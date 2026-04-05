import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { getRescueOrganization, getRescueVerificationDocument } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const { documentId } = await params;
    if (!documentId) {
      return apiError({ status: 400, code: 'MISSING_DOCUMENT_ID', message: 'documentId je obavezan.' });
    }

    const document = await getRescueVerificationDocument(documentId);
    if (!document) {
      return apiError({ status: 404, code: 'NOT_FOUND', message: 'Dokument nije pronađen.' });
    }

    const organization = await getRescueOrganization(document.organization_id);
    if (!organization) {
      return apiError({ status: 404, code: 'NOT_FOUND', message: 'Organizacija nije pronađena.' });
    }

    const canAccess = user.role === 'admin' || organization.owner_user_id === user.id;
    if (!canAccess) {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Nemaš pristup ovom dokumentu.' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return apiError({ status: 500, code: 'STORAGE_UNAVAILABLE', message: 'Storage nije konfiguriran.' });
    }

    const supabase = createAdminClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.storage
      .from(document.storage_bucket)
      .createSignedUrl(document.storage_path, 60 * 10, {
        download: document.original_filename ?? undefined,
      });

    if (error || !data?.signedUrl) {
      return apiError({ status: 500, code: 'SIGNED_URL_FAILED', message: 'Nije moguće generirati signed URL.' });
    }

    return NextResponse.json({
      documentId: document.id,
      signedUrl: data.signedUrl,
      expiresInSeconds: 600,
    });
  } catch (error) {
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}
