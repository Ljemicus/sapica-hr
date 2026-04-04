export const DEMO_BOOKING_IDS = new Set([
  'book1111-1111-1111-1111-111111111111',
  'book2222-2222-2222-2222-222222222222',
  'bookffff-ffff-ffff-ffff-ffffffffffff',
  '00004444-4444-4444-4444-444444444444',
]);

export function isDemoBookingId(id: string): boolean {
  return DEMO_BOOKING_IDS.has(id);
}
