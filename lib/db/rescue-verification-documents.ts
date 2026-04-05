import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type {
  RescueVerificationDocument,
  RescueVerificationDocumentReviewStatus,
  RescueVerificationDocumentType,
} from '@/lib/types';

interface CreateRescueVerificationDocumentInput {
  organization_id: string;
  document_type: RescueVerificationDocumentType;
  storage_bucket: string;
  storage_path: string;
  uploaded_by: string;
  original_filename?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  document_notes?: string | null;
}

export async function createRescueVerificationDocument(
  input: CreateRescueVerificationDocumentInput
): Promise<RescueVerificationDocument | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_verification_documents')
      .insert({
        organization_id: input.organization_id,
        document_type: input.document_type,
        storage_bucket: input.storage_bucket,
        storage_path: input.storage_path,
        uploaded_by: input.uploaded_by,
        original_filename: input.original_filename ?? null,
        mime_type: input.mime_type ?? null,
        file_size_bytes: input.file_size_bytes ?? null,
        document_notes: input.document_notes ?? null,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueVerificationDocument;
  } catch {
    return null;
  }
}

export async function getRescueVerificationDocument(
  documentId: string
): Promise<RescueVerificationDocument | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_verification_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !data) return null;
    return data as RescueVerificationDocument;
  } catch {
    return null;
  }
}

export async function getRescueVerificationDocuments(
  organizationId: string
): Promise<RescueVerificationDocument[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_verification_documents')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as RescueVerificationDocument[];
  } catch {
    return [];
  }
}

export async function reviewRescueVerificationDocument(
  documentId: string,
  reviewedBy: string,
  reviewStatus: RescueVerificationDocumentReviewStatus = 'approved',
  adminNotes?: string | null
): Promise<RescueVerificationDocument | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_verification_documents')
      .update({
        review_status: reviewStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        admin_notes: typeof adminNotes === 'undefined' ? undefined : adminNotes,
      })
      .eq('id', documentId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueVerificationDocument;
  } catch {
    return null;
  }
}
