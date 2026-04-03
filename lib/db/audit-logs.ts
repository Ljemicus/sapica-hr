import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { AuditLog, AuditAction } from '@/lib/types/trust';

export async function logAdminAction(input: {
  actorUserId: string;
  targetType: string;
  targetId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}): Promise<AuditLog | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: input.actorUserId,
        target_type: input.targetType,
        target_id: input.targetId,
        action: input.action,
        metadata: input.metadata ?? null,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as AuditLog;
  } catch {
    return null;
  }
}

export async function getAuditLogs(targetId?: string): Promise<AuditLog[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as AuditLog[];
  } catch {
    return [];
  }
}
