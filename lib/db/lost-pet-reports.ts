import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { LostPetReport, LostPetReportReason, LostPetReportStatus } from '@/lib/types/trust';

export async function insertReport(input: {
  lostPetId: string;
  reporterUserId: string;
  reasonCode: LostPetReportReason;
  details?: string;
}): Promise<LostPetReport | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_reports')
      .insert({
        lost_pet_id: input.lostPetId,
        reporter_user_id: input.reporterUserId,
        reason_code: input.reasonCode,
        reason: input.details || input.reasonCode,
        details: input.details ?? null,
        reporter_ip: 'authenticated',
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as unknown as LostPetReport;
  } catch {
    return null;
  }
}

export async function getReportsByPetId(petId: string): Promise<LostPetReport[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_reports')
      .select('*')
      .eq('lost_pet_id', petId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as unknown as LostPetReport[];
  } catch {
    return [];
  }
}

export async function getOpenReports(): Promise<LostPetReport[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_reports')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data as unknown as LostPetReport[];
  } catch {
    return [];
  }
}

export async function resolveReport(
  reportId: string,
  resolvedBy: string,
  status: Extract<LostPetReportStatus, 'reviewed' | 'dismissed'>,
): Promise<LostPetReport | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_reports')
      .update({
        status,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as unknown as LostPetReport;
  } catch {
    return null;
  }
}
