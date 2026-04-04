import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/db/audit-logs';
import type { AuditAction } from '@/lib/types/trust';

type Action = 'hide' | 'unhide' | 'lock' | 'unlock' | 'delete';

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: {
    targetType?: 'topic' | 'comment';
    targetId?: string;
    action?: Action;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { targetType, targetId, action } = body;
  if (!targetType || !targetId || !action) {
    return NextResponse.json({ error: 'targetType, targetId and action are required' }, { status: 400 });
  }

  const supabase = await createClient();
  const table = targetType === 'topic' ? 'forum_topics' : 'forum_comments';

  // Delete action
  if (action === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', targetId);
    if (error) {
      return NextResponse.json({ error: `Failed to delete ${targetType}` }, { status: 500 });
    }
    const auditAction: AuditAction = targetType === 'topic' ? 'forum_topic_deleted' : 'forum_comment_deleted';
    await logAdminAction({ actorUserId: guard.user.id, targetType, targetId, action: auditAction });
    return NextResponse.json({ ok: true, targetType, targetId, deleted: true });
  }

  // Status-change actions
  const statusMap: Record<string, string> = {
    hide: 'hidden',
    unhide: 'active',
    lock: 'locked',
    unlock: 'active',
  };
  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Lock/unlock only valid for topics
  if ((action === 'lock' || action === 'unlock') && targetType !== 'topic') {
    return NextResponse.json({ error: 'Lock/unlock only applies to topics' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(table)
    .update({ status: newStatus })
    .eq('id', targetId)
    .select('id, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: `Failed to moderate ${targetType}` }, { status: 500 });
  }

  const actionToAudit: Record<string, AuditAction> = {
    'topic:hide': 'forum_topic_hidden',
    'topic:unhide': 'forum_topic_unhidden',
    'comment:hide': 'forum_comment_hidden',
    'comment:unhide': 'forum_comment_unhidden',
  };
  const auditKey = `${targetType}:${action}`;
  const auditAction = actionToAudit[auditKey];
  if (auditAction) {
    await logAdminAction({ actorUserId: guard.user.id, targetType, targetId, action: auditAction });
  }

  return NextResponse.json({ ok: true, targetType, targetId, status: data.status });
}
