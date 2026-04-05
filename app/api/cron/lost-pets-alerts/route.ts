import { NextResponse } from 'next/server';
import { claimUndispatchedListings, getSubscribersForListing } from '@/lib/db/lost-pet-alerts';
import type { AlertDispatchResult } from '@/lib/db/lost-pet-alerts';
import { sendEmail } from '@/lib/email';
import { lostPetAlertEmail } from '@/lib/email-templates';
import { appLogger } from '@/lib/logger';

/**
 * POST /api/cron/lost-pets-alerts
 *
 * Cron-friendly endpoint that dispatches community alert emails
 * for new lost-pet listings to matching subscribers.
 *
 * 1. Claims all listings without alerts_dispatched_at (atomic).
 * 2. For each listing, finds matching subscribers (city + species).
 * 3. Sends one email per subscriber per listing.
 *
 * Protected by x-cron-secret header.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result: AlertDispatchResult = {
    listingsProcessed: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const listings = await claimUndispatchedListings();
    result.listingsProcessed = listings.length;

    for (const listing of listings) {
      try {
        const subscribers = await getSubscribersForListing(
          listing.city,
          listing.species,
          listing.user_id,
        );

        for (const sub of subscribers) {
          try {
            const html = lostPetAlertEmail(
              sub.name,
              listing.name,
              listing.species,
              listing.city,
              listing.neighborhood,
              listing.id,
            );

            const emailResult = await sendEmail({
              to: sub.email,
              subject: `Nestao ljubimac "${listing.name}" u gradu ${listing.city}`,
              html,
            });

            if (!emailResult.success) {
              throw new Error(emailResult.error || 'Unknown email delivery failure');
            }

            result.emailsSent++;
          } catch (err) {
            const msg = `email to ${sub.email} for listing ${listing.id}: ${err instanceof Error ? err.message : String(err)}`;
            result.errors.push(msg);
            appLogger.error('lost-pet-alerts', 'Failed to send alert email', { error: msg });
          }
        }
      } catch (err) {
        const msg = `subscribers for listing ${listing.id}: ${err instanceof Error ? err.message : String(err)}`;
        result.errors.push(msg);
      }
    }

    appLogger.info('lost-pet-alerts', 'Dispatch complete', {
      listings: result.listingsProcessed,
      emails: result.emailsSent,
      errors: result.errors.length,
    });
  } catch (err) {
    result.errors.push(`unexpected: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  });
}
