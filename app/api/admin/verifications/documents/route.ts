import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getDocumentsByVerification } from '@/lib/db/provider-documents';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Admin access required' });
    }

    const verificationId = request.nextUrl.searchParams.get('verificationId');
    if (!verificationId) {
      return apiError({ status: 400, code: 'MISSING_VERIFICATION_ID', message: 'verificationId is required' });
    }

    const documents = await getDocumentsByVerification(verificationId);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return apiError({ status: 500, code: 'STORAGE_UNAVAILABLE', message: 'Storage not configured' });
    }

    const supabase = createAdminClient(supabaseUrl, serviceRoleKey);

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const { data } = await supabase.storage
          .from(doc.storage_bucket)
          .createSignedUrl(doc.storage_path, 60 * 10);

        return {
          id: doc.id,
          document_type: doc.document_type,
          storage_path: doc.storage_path,
          signed_url: data?.signedUrl ?? null,
        };
      })
    );

    return NextResponse.json({ documents: documentsWithUrls });
  } catch (error) {
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}
