/**
 * Daily KPI digest generator for PetPark.
 *
 * Queries Supabase for key operational metrics over the last 24 hours
 * and formats them as a Slack-ready message. Designed to be called from
 * an API route triggered by Vercel Cron or an external scheduler.
 */

import { createClient } from '@supabase/supabase-js';
import { appLogger } from './logger';
import { isDemoBookingId } from './demo-data';

export interface KpiSnapshot {
  period: { from: string; to: string };
  users: { newSignups: number; total: number };
  bookings: {
    created: number;
    completed: number;
    cancelled: number;
    totalActive: number;
  };
  revenue: {
    totalCents: number;
    platformFeeCents: number;
    paymentCount: number;
  };
  providers: {
    pendingApplications: number;
    activeProviders: number;
    newApplications: number;
  };
  reviews: { newReviews: number; avgRating: number | null };
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars for KPI digest');
  return createClient(url, key);
}

type KpiBookingRow = { id: string; is_demo?: boolean | null };

function countRealBookings(rows: KpiBookingRow[] | null | undefined): number {
  return (rows ?? []).filter((row) => row.is_demo !== true && !isDemoBookingId(row.id)).length;
}

export async function collectKpis(): Promise<KpiSnapshot> {
  const db = createServiceClient();
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since = yesterday.toISOString();

  // Run all queries in parallel
  const [
    newUsersRes,
    totalUsersRes,
    newBookingsRes,
    completedBookingsRes,
    cancelledBookingsRes,
    activeBookingsRes,
    paymentsRes,
    pendingAppsRes,
    activeProvidersRes,
    newAppsRes,
    reviewsRes,
  ] = await Promise.all([
    db.from('users').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('users').select('id', { count: 'exact', head: true }),
    db.from('bookings').select('id, is_demo').gte('created_at', since),
    db.from('bookings').select('id, is_demo').eq('status', 'completed').gte('created_at', since),
    db.from('bookings').select('id, is_demo').eq('status', 'cancelled').gte('created_at', since),
    db.from('bookings').select('id, is_demo').in('status', ['pending', 'accepted']),
    db.from('payments').select('amount, platform_fee').eq('status', 'succeeded').gte('created_at', since),
    db.from('provider_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
    db.from('provider_applications').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('provider_applications').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('reviews').select('rating').gte('created_at', since),
  ]);

  // Aggregate payment totals
  const payments = paymentsRes.data ?? [];
  const totalCents = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const platformFeeCents = payments.reduce((sum, p) => sum + (p.platform_fee ?? 0), 0);

  // Aggregate review rating
  const reviews = reviewsRes.data ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : null;

  return {
    period: { from: since, to: now.toISOString() },
    users: {
      newSignups: newUsersRes.count ?? 0,
      total: totalUsersRes.count ?? 0,
    },
    bookings: {
      created: countRealBookings(newBookingsRes.data as KpiBookingRow[] | undefined),
      completed: countRealBookings(completedBookingsRes.data as KpiBookingRow[] | undefined),
      cancelled: countRealBookings(cancelledBookingsRes.data as KpiBookingRow[] | undefined),
      totalActive: countRealBookings(activeBookingsRes.data as KpiBookingRow[] | undefined),
    },
    revenue: {
      totalCents,
      platformFeeCents,
      paymentCount: payments.length,
    },
    providers: {
      pendingApplications: pendingAppsRes.count ?? 0,
      activeProviders: activeProvidersRes.count ?? 0,
      newApplications: newAppsRes.count ?? 0,
    },
    reviews: { newReviews: reviews.length, avgRating },
  };
}

function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function formatSlackDigest(kpi: KpiSnapshot): string {
  const lines = [
    `*PetPark Daily KPI Digest*`,
    `_${kpi.period.from.slice(0, 10)} → ${kpi.period.to.slice(0, 10)}_`,
    '',
    `*Users*`,
    `  New signups: ${kpi.users.newSignups}  |  Total: ${kpi.users.total}`,
    '',
    `*Bookings (24h)*`,
    `  Created: ${kpi.bookings.created}  |  Completed: ${kpi.bookings.completed}  |  Cancelled: ${kpi.bookings.cancelled}`,
    `  Active (all-time): ${kpi.bookings.totalActive}`,
    '',
    `*Revenue (24h)*`,
    `  Gross: ${euro(kpi.revenue.totalCents)}  |  Platform fees: ${euro(kpi.revenue.platformFeeCents)}  |  Txns: ${kpi.revenue.paymentCount}`,
    '',
    `*Providers*`,
    `  New applications: ${kpi.providers.newApplications}  |  Pending review: ${kpi.providers.pendingApplications}  |  Active: ${kpi.providers.activeProviders}`,
    '',
    `*Reviews (24h)*`,
    `  Count: ${kpi.reviews.newReviews}  |  Avg rating: ${kpi.reviews.avgRating !== null ? kpi.reviews.avgRating.toFixed(1) : 'n/a'}`,
  ];
  return lines.join('\n');
}

export async function sendDigestToSlack(text: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_OPS_WEBHOOK;
  if (!webhookUrl) {
    appLogger.warn('kpi-digest', 'SLACK_OPS_WEBHOOK not configured, skipping Slack delivery');
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (err) {
    appLogger.error('kpi-digest', 'Slack delivery failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
