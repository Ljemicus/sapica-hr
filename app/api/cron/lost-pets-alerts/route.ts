import { NextResponse } from 'next/server';
import { getUndispatchedListings, markListingDispatched, getSubscribersForListing } from '@/lib/db/lost-pet-alerts';
import type { AlertDispatchResult } from '@/lib/db/lost-pet-alerts';
import { sendEmail } from '@/lib/email';
import { lostPetAlertEmail } from '@/lib/email-templates';
import { appLogger } from '@/lib/logger';
import { requireAdminOrCron } from '@/lib/admin-guard';

/**
 * GET /api/cron/lost-pets-alerts
 *
 * Cron-friendly endpoint that dispatches community alert emails
 * for new lost-pet listings to matching subscribers.
 *
 * 1. Reads listings without alerts_dispatched_at.
 * 2. For each listing, finds matching subscribers (city + species).
 * 3. Sends one email per subscriber per listing.
 * 4. Marks the listing as dispatched only when delivery completes without failures.
 *
 * Secured by CRON_SECRET bearer token (for Vercel Cron) or admin session.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await requireAdminOrCron(request);
  if (!guard.ok) return guard.response;

  const result: AlertDispatchResult = {
    listingsProcessed: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const listings = await getUndispatchedListings();
    result.listingsProcessed = listings.length;

    for (const listing of listings) {
      let listingEmailsFailed = 0;

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
            listingEmailsFailed++;
            const msg = `email to ${sub.email} for listing ${listing.id}: ${err instanceof Error ? err.message : String(err)}`;
            result.errors.push(msg);
            appLogger.error('lost-pet-alerts', 'Failed to send alert email', { error: msg });
          }
        }

        // Only mark dispatched when there were no delivery failures.
        // This favors safe retry over silently dropping a listing after partial failure.
        if (listingEmailsFailed === 0) {
          const marked = await markListingDispatched(listing.id);
          if (!marked) {
            const msg = `mark dispatched for listing ${listing.id}: listing was not updated`;
            result.errors.push(msg);
            appLogger.error('lost-pet-alerts', 'Failed to mark listing as dispatched', { listingId: listing.id });
          }
        }
      } catch (err) {
        const msg = `subscribers for listing ${listing.id}: ${err instanceof Error ? err.message : String(err)}`;
        result.errors.push(msg);
        // Don't mark dispatched — subscriber lookup itself failed, retry next run
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
