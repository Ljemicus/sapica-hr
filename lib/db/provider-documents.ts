import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { ProviderDocument, DocumentType } from '@/lib/types/trust';

export async function createProviderDocument(input: {
  provider_application_id: string;
  provider_verification_id: string;
  document_type: DocumentType;
  storage_bucket: string;
  storage_path: string;
  uploaded_by: string;
}): Promise<ProviderDocument | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_documents')
      .insert(input)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderDocument;
  } catch {
    return null;
  }
}

export async function getDocumentsByVerification(
  verificationId: string
): Promise<ProviderDocument[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_documents')
      .select('*')
      .eq('provider_verification_id', verificationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as ProviderDocument[];
  } catch {
    return [];
  }
}

export async function getDocumentsByProvider(
  providerApplicationId: string
): Promise<ProviderDocument[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_documents')
      .select('*')
      .eq('provider_application_id', providerApplicationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as ProviderDocument[];
  } catch {
    return [];
  }
}
