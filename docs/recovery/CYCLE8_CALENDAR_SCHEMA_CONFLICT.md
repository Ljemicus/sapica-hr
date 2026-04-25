# CYCLE8_CALENDAR_SCHEMA_CONFLICT.md

## Status

- Detected during Cycle 8 canonical bookings/payments cutover on 2026-04-24.
- Severity: blocker for strict Cycle 8 acceptance.
- Rule applied: live schema truth beats repo intent.

## Conflict Summary

A parallel calendar subsystem still treats `public.bookings` as a different domain model than the live canonical schema verified in recovery artifacts.

Live canonical `public.bookings` columns include:

- `owner_profile_id`
- `provider_id`
- `pet_id`
- `provider_kind`
- `primary_service_code`
- `starts_at` / `ends_at`
- `subtotal_amount` / `platform_fee_amount` / `total_amount`
- `owner_note` / `provider_note`
- `status` / `payment_status`

Calendar subsystem still reads/writes non-live ghost columns such as:

- `provider_type`
- `client_name` / `client_email` / `client_phone`
- `title` / `description`
- `start_time` / `end_time`
- `price`
- `location_type` / `location_address`
- `internal_notes` / `client_notes`
- `source` / `created_by`

This is not a naming mismatch; it is a second incompatible booking model targeting the same table.

## Inventory

- app/api/calendar/bookings/route.ts:11: provider_type: z.enum(['sitter', 'groomer', 'trainer']),
- app/api/calendar/bookings/route.ts:13: client_name: z.string().min(1),
- app/api/calendar/bookings/route.ts:20: start_time: z.string().datetime(),
- app/api/calendar/bookings/route.ts:21: end_time: z.string().datetime(),
- app/api/calendar/bookings/route.ts:25: location_type: z.enum(['provider', 'client', 'other']).default('provider'),
- app/api/calendar/bookings/route.ts:27: internal_notes: z.string().optional(),
- app/api/calendar/bookings/route.ts:28: client_notes: z.string().optional(),
- app/api/calendar/bookings/route.ts:56: const providerType = searchParams.get('provider_type');
- app/api/calendar/bookings/route.ts:65: { error: 'Missing provider_type or provider_id' },
- app/api/calendar/bookings/route.ts:73: .select(includeServices ? '_, services:booking_services(_)' : '\*')
- app/api/calendar/bookings/route.ts:74: .eq('provider_type', providerType)
- app/api/calendar/bookings/route.ts:78: query = query.gte('start_time', startDate);
- app/api/calendar/bookings/route.ts:82: query = query.lte('start_time', endDate);
- app/api/calendar/bookings/route.ts:90: query = query.order('start_time', { ascending: true });
- app/api/calendar/bookings/route.ts:136: 'check_booking_conflict',
- app/api/calendar/bookings/route.ts:138: p_provider_type: data.provider_type,
- app/api/calendar/bookings/route.ts:140: p_start_time: data.start_time,
- app/api/calendar/bookings/route.ts:141: p_end_time: data.end_time,
- app/api/calendar/bookings/route.ts:165: provider_type: data.provider_type,
- app/api/calendar/bookings/route.ts:167: client_name: data.client_name,
- app/api/calendar/bookings/route.ts:174: start_time: data.start_time,
- app/api/calendar/bookings/route.ts:175: end_time: data.end_time,
- app/api/calendar/bookings/route.ts:179: location_type: data.location_type,
- app/api/calendar/bookings/route.ts:181: internal_notes: data.internal_notes,
- app/api/calendar/bookings/route.ts:182: client_notes: data.client_notes,
- app/api/calendar/bookings/route.ts:184: created_by: user.id,
- app/api/calendar/bookings/route.ts:210: .from('booking_services')
- app/api/calendar/bookings/route.ts:261: if (data.start_time && data.end_time) {
- app/api/calendar/bookings/route.ts:264: .select('provider_type, provider_id')
- app/api/calendar/bookings/route.ts:270: 'check_booking_conflict',
- app/api/calendar/bookings/route.ts:272: p_provider_type: existingBooking.provider_type,
- app/api/calendar/bookings/route.ts:274: p_start_time: data.start_time,
- app/api/calendar/bookings/route.ts:275: p_end_time: data.end_time,
- app/api/calendar/bookings/route.ts:293: client_name: data.client_name,
- app/api/calendar/bookings/route.ts:301: start_time: data.start_time,
- app/api/calendar/bookings/route.ts:302: end_time: data.end_time,
- app/api/calendar/bookings/route.ts:304: location_type: data.location_type,
- app/api/calendar/bookings/route.ts:306: internal_notes: data.internal_notes,
- app/api/calendar/bookings/route.ts:307: client_notes: data.client_notes,
- app/api/calendar/ical/[userId]/route.ts:50: const startTime = booking.start_time as string;
- app/api/calendar/ical/[userId]/route.ts:51: const endTime = booking.end_time as string;
- app/api/calendar/ical/[userId]/route.ts:57: description += `\\n\\nKlijent: ${booking.client_name}`;
- app/api/calendar/ical/[userId]/route.ts:69: if (includeInternalNotes && booking.internal_notes) {
- app/api/calendar/ical/[userId]/route.ts:70: description += `\\n\\nBilješke: ${booking.internal_notes}`;
- app/api/calendar/ical/[userId]/route.ts:169: .eq('provider_type', feed.provider_type)
- app/api/calendar/ical/[userId]/route.ts:175: // This requires a join with booking_services
- app/api/calendar/ical/[userId]/route.ts:177: .from('booking_services')
- app/api/calendar/ical/[userId]/route.ts:194: query = query.gte('start_time', thirtyDaysAgo.toISOString());
- app/api/calendar/ical/[userId]/route.ts:195: query = query.order('start_time', { ascending: true });
- app/api/calendar/ical/[userId]/route.ts:209: feed.include_internal_notes,
- app/api/calendar/ical/[userId]/route.ts:217: 'Content-Disposition': `attachment; filename="petpark-calendar-${feed.provider_type}.ics"`,
- app/api/calendar/ical/[userId]/route.ts:245: provider_type,
- app/api/calendar/ical/[userId]/route.ts:252: include_internal_notes,
- app/api/calendar/ical/[userId]/route.ts:261: provider_type,
- app/api/calendar/ical/[userId]/route.ts:269: include_internal_notes: include_internal_notes || false,
- app/api/calendar/blocked-dates/route.ts:11: provider_type: z.enum(['sitter', 'groomer', 'trainer']),
- app/api/calendar/blocked-dates/route.ts:16: start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
- app/api/calendar/blocked-dates/route.ts:17: end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
- app/api/calendar/blocked-dates/route.ts:28: start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
- app/api/calendar/blocked-dates/route.ts:29: end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
- app/api/calendar/blocked-dates/route.ts:46: const providerType = searchParams.get('provider_type');
- app/api/calendar/blocked-dates/route.ts:53: { error: 'Missing provider_type or provider_id' },
- app/api/calendar/blocked-dates/route.ts:61: .eq('provider_type', providerType)
- app/api/calendar/blocked-dates/route.ts:123: if (data.start_time && data.end_time) {
- app/api/calendar/blocked-dates/route.ts:124: const startMinutes = parseInt(data.start_time.split(':')[0]) \* 60 + parseInt(data.start_time.split(':')[1]);
- app/api/calendar/blocked-dates/route.ts:125: const endMinutes = parseInt(data.end_time.split(':')[0]) \* 60 + parseInt(data.end_time.split(':')[1]);
- app/api/calendar/blocked-dates/route.ts:129: { error: 'start_time must be before end_time' },
- app/api/calendar/blocked-dates/route.ts:138: provider_type: data.provider_type,
- app/api/calendar/blocked-dates/route.ts:143: start_time: data.start_time,
- app/api/calendar/blocked-dates/route.ts:144: end_time: data.end_time,
- app/api/calendar/blocked-dates/route.ts:195: .select('start_date, end_date, start_time, end_time')
- app/api/calendar/blocked-dates/route.ts:208: const startTime = updateData.start_time || current.start_time;
- app/api/calendar/blocked-dates/route.ts:209: const endTime = updateData.end_time || current.end_time;
- app/api/calendar/blocked-dates/route.ts:226: { error: 'start_time must be before end_time' },
- app/api/calendar/availability/route.ts:11: provider_type: z.enum(['sitter', 'groomer', 'trainer']),
- app/api/calendar/availability/route.ts:16: start_time: z.string().regex(/^\d{2}:\d{2}$/),
- app/api/calendar/availability/route.ts:17: end_time: z.string().regex(/^\d{2}:\d{2}$/),
- app/api/calendar/availability/route.ts:28: start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
- app/api/calendar/availability/route.ts:29: end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
- app/api/calendar/availability/route.ts:36: provider_type: z.enum(['sitter', 'groomer', 'trainer']),
- app/api/calendar/availability/route.ts:58: const providerType = searchParams.get('provider_type');
- app/api/calendar/availability/route.ts:67: { error: 'Missing provider_type or provider_id' },
- app/api/calendar/availability/route.ts:75: .eq('provider_type', providerType)
- app/api/calendar/availability/route.ts:94: query = query.order('start_time', { ascending: true });
- app/api/calendar/availability/route.ts:156: provider_type: data.provider_type,
- app/api/calendar/availability/route.ts:161: start_time: data.start_time,
- app/api/calendar/availability/route.ts:162: end_time: data.end_time,
- app/api/calendar/availability/route.ts:307: p_provider_type: data.provider_type,
- app/api/calendar/sync/google/route.ts:15: provider_type: z.enum(['sitter', 'groomer', 'trainer']).optional(),
- app/api/calendar/sync/google/route.ts:28: provider_type: z.enum(['sitter', 'groomer', 'trainer']),
- app/api/calendar/sync/google/route.ts:43: const providerType = searchParams.get('provider_type');
- app/api/calendar/sync/google/route.ts:53: query = query.eq('provider_type', providerType).eq('provider_id', providerId);
- app/api/calendar/sync/google/route.ts:103: provider_type: data.provider_type,
- app/api/calendar/sync/google/route.ts:156: const { action, provider_type, provider_id } = validation.data;
- app/api/calendar/sync/google/route.ts:163: .eq('provider_type', provider_type)
- app/api/calendar/sync/google/route.ts:177: return await performBidirectionalSync(supabase, syncConfig, provider_type, provider_id);
- app/api/calendar/sync/google/route.ts:179: return await importFromGoogle(supabase, syncConfig, provider_type, provider_id);
- app/api/calendar/sync/google/route.ts:181: return await exportToGoogle(supabase, syncConfig, provider_type, provider_id);
- app/api/calendar/sync/google/route.ts:183: return await disconnectGoogleCalendar(supabase, user.id, provider_type, provider_id);
- app/api/calendar/sync/google/route.ts:312: provider_type: providerType,
- app/api/calendar/sync/google/route.ts:316: start_time: event.start?.dateTime || event.start?.date,
- app/api/calendar/sync/google/route.ts:317: end_time: event.end?.dateTime || event.end?.date,
- app/api/calendar/sync/google/route.ts:318: client_name: 'Google Calendar Import',
- app/api/calendar/sync/google/route.ts:334: .eq('provider_type', providerType)
- app/api/calendar/sync/google/route.ts:336: .gte('start_time', new Date().toISOString());
- app/api/calendar/sync/google/route.ts:341: description: `${booking.description || ''}\n\nKlijent: ${booking.client_name}\n${booking.client_phone ? `Telefon: ${booking.client_phone}` : ''}\n${booking.pet_name ? `Ljubimac: ${booking.pet_name}` : ''}`,
- app/api/calendar/sync/google/route.ts:343: dateTime: booking.start_time,
- app/api/calendar/sync/google/route.ts:347: dateTime: booking.end_time,
- app/api/calendar/sync/google/route.ts:354: petpark_provider_type: booking.provider_type,
- app/api/calendar/sync/google/route.ts:426: provider_type: providerType,
- app/api/calendar/sync/google/route.ts:430: start_time: event.start?.dateTime || event.start?.date,
- app/api/calendar/sync/google/route.ts:431: end_time: event.end?.dateTime || event.end?.date,
- app/api/calendar/sync/google/route.ts:432: client_name: 'Google Calendar Import',
- app/api/calendar/sync/google/route.ts:458: .eq('provider_type', providerType)
- app/api/calendar/sync/google/route.ts:460: .gte('start_time', new Date().toISOString());
- app/api/calendar/sync/google/route.ts:468: description: `${booking.description || ''}\n\nKlijent: ${booking.client_name}`,
- app/api/calendar/sync/google/route.ts:470: dateTime: booking.start_time,
- app/api/calendar/sync/google/route.ts:474: dateTime: booking.end_time,
- app/api/calendar/sync/google/route.ts:521: query = query.eq('provider_type', providerType).eq('provider_id', providerId);
- lib/calendar/availability.ts:40: .eq('provider_type', providerType)
- lib/calendar/availability.ts:54: const { data, error } = await query.order('start_time', { ascending: true });
- lib/calendar/availability.ts:75: provider_type: input.provider_type,
- lib/calendar/availability.ts:80: start_time: input.start_time,
- lib/calendar/availability.ts:81: end_time: input.end_time,
- lib/calendar/availability.ts:112: start_time: input.start_time,
- lib/calendar/availability.ts:113: end_time: input.end_time,
- lib/calendar/availability.ts:163: p_provider_type: providerType,
- lib/calendar/availability.ts:194: p_provider_type: providerType,
- lib/calendar/availability.ts:197: p_start_time: startTime,
- lib/calendar/availability.ts:198: p_end_time: endTime,
- lib/calendar/availability.ts:223: p_provider_type: providerType,
- lib/calendar/availability.ts:249: start_time: string;
- lib/calendar/availability.ts:250: end_time: string;
- lib/calendar/availability.ts:257: p_provider_type: providerType,
- lib/calendar/availability.ts:291: .eq('provider_type', providerType)
- lib/calendar/availability.ts:321: provider_type: input.provider_type,
- lib/calendar/availability.ts:326: start_time: input.start_time,
- lib/calendar/availability.ts:327: end_time: input.end_time,
- lib/calendar/availability.ts:358: start_time: input.start_time,
- lib/calendar/availability.ts:359: end_time: input.end_time,
- lib/calendar/availability.ts:447: .eq('provider_type', providerType)
- lib/calendar/availability.ts:472: .select('day_of_week, start_time, end_time')
- lib/calendar/availability.ts:473: .eq('provider_type', providerType)
- lib/calendar/availability.ts:485: start: slot.start_time.substring(0, 5),
- lib/calendar/availability.ts:486: end: slot.end_time.substring(0, 5),
- lib/calendar/notifications.ts:43: const date = new Date(booking.start_time).toLocaleDateString('hr-HR', {
- lib/calendar/notifications.ts:49: const time = new Date(booking.start_time).toLocaleTimeString('hr-HR', {
- lib/calendar/notifications.ts:77: <p>Poštovani ${booking.client_name},</p>
- lib/calendar/notifications.ts:123: const date = new Date(booking.start_time).toLocaleDateString('hr-HR', {
- lib/calendar/notifications.ts:129: const time = new Date(booking.start_time).toLocaleTimeString('hr-HR', {
- lib/calendar/notifications.ts:157: <p>Poštovani ${booking.client_name},</p>
- lib/calendar/notifications.ts:196: const date = new Date(booking.start_time).toLocaleDateString('hr-HR', {
- lib/calendar/notifications.ts:223: <p>Poštovani ${booking.client_name},</p>
- lib/calendar/notifications.ts:336: const body = `${booking.client_name} je rezervirao/la ${booking.title}`;
- lib/calendar/notifications.ts:340: .from(booking.provider_type === 'sitter' ? 'sitter_profiles' : booking.provider_type === 'groomer' ? 'groomers' : 'trainers')
- lib/calendar/notifications.ts:371: .gte('start_time', now.toISOString())
- lib/calendar/notifications.ts:372: .lte('start_time', new Date(now.getTime() + 25 _ 60 _ 60 \* 1000).toISOString())
- lib/calendar/notifications.ts:373: .gte('start_time', new Date(now.getTime() + 23 _ 60 _ 60 \* 1000).toISOString());
- lib/calendar/notifications.ts:385: .gte('start_time', now.toISOString())
- lib/calendar/notifications.ts:386: .lte('start_time', new Date(now.getTime() + 2 _ 60 _ 60 \* 1000).toISOString())
- lib/calendar/notifications.ts:387: .gte('start_time', new Date(now.getTime() + 30 _ 60 _ 1000).toISOString());
- lib/calendar/google-sync.ts:94: provider_type: input.provider_type,
- lib/calendar/google-sync.ts:131: query = query.eq('provider_type', providerType).eq('provider_id', providerId);
- lib/calendar/google-sync.ts:254:Klijent: ${booking.client_name}
- lib/calendar/google-sync.ts:257:${booking.internal_notes ? `Bilješke: ${booking.internal_notes}` : ''}
- lib/calendar/google-sync.ts:264: dateTime: booking.start_time,
- lib/calendar/google-sync.ts:268: dateTime: booking.end_time,
- lib/calendar/google-sync.ts:283: petpark_provider_type: booking.provider_type,
- lib/calendar/google-sync.ts:474: start_time: start?.dateTime || start?.date || '',
- lib/calendar/google-sync.ts:475: end_time: end?.dateTime || end?.date || '',
- lib/calendar/google-sync.ts:513: provider_type: providerType,
- lib/calendar/google-sync.ts:515: client_name: 'Google Calendar Import',
- lib/calendar/google-sync.ts:528: .eq('provider_type', providerType)
- lib/calendar/google-sync.ts:530: .gte('start_time', new Date().toISOString());
- lib/calendar/bookings.ts:31: 'check_booking_conflict',
- lib/calendar/bookings.ts:33: p_provider_type: input.provider_type,
- lib/calendar/bookings.ts:35: p_start_time: input.start_time,
- lib/calendar/bookings.ts:36: p_end_time: input.end_time,
- lib/calendar/bookings.ts:50: provider_type: input.provider_type,
- lib/calendar/bookings.ts:52: client_name: input.client_name,
- lib/calendar/bookings.ts:59: start_time: input.start_time,
- lib/calendar/bookings.ts:60: end_time: input.end_time,
- lib/calendar/bookings.ts:64: location_type: input.location_type || 'provider',
- lib/calendar/bookings.ts:66: internal_notes: input.internal_notes,
- lib/calendar/bookings.ts:67: client_notes: input.client_notes,
- lib/calendar/bookings.ts:88: .from('booking_services')
- lib/calendar/bookings.ts:119: ? `*, services:booking_services(*)`
- lib/calendar/bookings.ts:122: .eq('provider_type', providerType)
- lib/calendar/bookings.ts:124: .gte('start_time', startDate)
- lib/calendar/bookings.ts:125: .lte('start_time', endDate)
- lib/calendar/bookings.ts:126: .order('start_time', { ascending: true });
- lib/calendar/bookings.ts:154: services:booking_services(\*),
- lib/calendar/bookings.ts:179: if (input.start_time && input.end_time) {
- lib/calendar/bookings.ts:182: .select('provider_type, provider_id')
- lib/calendar/bookings.ts:188: 'check_booking_conflict',
- lib/calendar/bookings.ts:190: p_provider_type: booking.provider_type,
- lib/calendar/bookings.ts:192: p_start_time: input.start_time,
- lib/calendar/bookings.ts:193: p_end_time: input.end_time,
- lib/calendar/bookings.ts:207: client_name: input.client_name,
- lib/calendar/bookings.ts:215: start_time: input.start_time,
- lib/calendar/bookings.ts:216: end_time: input.end_time,
- lib/calendar/bookings.ts:218: location_type: input.location_type,
- lib/calendar/bookings.ts:220: internal_notes: input.internal_notes,
- lib/calendar/bookings.ts:221: client_notes: input.client_notes,
- lib/calendar/bookings.ts:233: await supabase.from('booking_services').delete().eq('booking_id', bookingId);
- lib/calendar/bookings.ts:247: await supabase.from('booking_services').insert(servicesData);
- lib/calendar/bookings.ts:337: p_new_start_time: newStartTime,
- lib/calendar/bookings.ts:338: p_new_end_time: newEndTime,
- lib/calendar/bookings.ts:367: 'check_booking_conflict',
- lib/calendar/bookings.ts:369: p_provider_type: providerType,
- lib/calendar/bookings.ts:371: p_start_time: startTime,
- lib/calendar/bookings.ts:372: p_end_time: endTime,
- lib/calendar/bookings.ts:384: .select('id, title, start_time, end_time')
- lib/calendar/bookings.ts:385: .eq('provider_type', providerType)
- lib/calendar/bookings.ts:388: .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
- lib/calendar/bookings.ts:417: p_provider_type: providerType,
- lib/calendar/bookings.ts:445: start_time: string;
- lib/calendar/bookings.ts:446: end_time: string;
- lib/calendar/bookings.ts:448: client_name: string;
- lib/calendar/bookings.ts:461: p_provider_type: providerType,
- lib/calendar/bookings.ts:520: filter: `provider_type=eq.${providerType}&provider_id=eq.${providerId}`,

## Impact

- Cycle 8 booking/payment refactor completed the main canonical booking/payment path.
- Strict Cycle 8 closure remains blocked because calendar code still assumes a ghost bookings schema.
- Any runtime use of these calendar routes against live schema is unsafe/misaligned.

## Recommended Options

1. Fail-close calendar booking routes and document them as frozen legacy ghost paths.
2. Refactor calendar subsystem onto canonical bookings with a separate design decision for service metadata.
3. Move calendar subsystem onto a dedicated table/model if it is intentionally distinct from marketplace bookings.

## Recommendation

Preferred immediate action: option 1 (fail-close/freeze) unless playbook or product intent explicitly requires calendar bookings to remain active right now.

## Evidence

- Live schema artifact: `docs/recovery/live-schema/public-schema-post-cycle3.sql`
- Calendar API root conflict: `app/api/calendar/bookings/route.ts`
- Calendar library conflict: `lib/calendar/bookings.ts`

## Containment applied

- 2026-04-24: calendar API ghost-booking routes were fail-closed with `503 CALENDAR_TEMPORARILY_DISABLED`
- contained routes:
  - `app/api/calendar/bookings/route.ts`
  - `app/api/calendar/availability/route.ts`
  - `app/api/calendar/blocked-dates/route.ts`
  - `app/api/calendar/ical/[userId]/route.ts`
  - `app/api/calendar/sync/google/route.ts`
- purpose: prevent live reads/writes against the incompatible ghost booking schema while recovery continues
