import { NextResponse } from 'next/server';
import { getPendingRescueOrganizations } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const pendingOrgs = await getPendingRescueOrganizations();
    
    // Count unique organizations that need attention
    const count = pendingOrgs.length;
    
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
