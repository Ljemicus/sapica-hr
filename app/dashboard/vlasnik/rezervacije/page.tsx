import type { Metadata } from 'next';
import { BookingHistoryContent } from './booking-history-content';

export const metadata: Metadata = {
  title: 'Rezervacije — Vlasnik',
  description: 'Pregled svih rezervacija i povijest korištenja PetPark usluga.',
};

export default function BookingHistoryPage() {
  return <BookingHistoryContent />;
}
