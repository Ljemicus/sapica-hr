import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookingRequestDetailSurface } from '../booking-request-detail-surface';

const baseProps = {
  requestId: 'request-1',
  serviceLabel: 'Šetnja psa',
  statusLabel: 'Poslano',
  dateRange: '01. 06. 2026. – 02. 06. 2026.',
  petName: 'Rex',
  petTypeLabel: 'Pas',
  submittedAt: '15. 05. 2026.',
  notes: 'Rex voli duge šetnje.',
  events: [],
  conversationEnabled: false,
};

describe('BookingRequestDetailSurface', () => {
  it('opens and highlights a targeted owner request detail without raw contact', () => {
    render(
      <BookingRequestDetailSurface
        {...baseProps}
        role="owner"
        isTargeted
        providerName="Pet šetač"
        contact={{ email: 'ni••@example.com', phone: '+385••••567', masked: true }}
      />,
    );

    const detail = screen.getByText('Detalji upita').closest('details');
    expect(detail).toHaveAttribute('open');
    expect(screen.getByText('Otvoreno iz obavijesti')).toBeInTheDocument();
    expect(screen.getByText('ni••@example.com')).toBeInTheDocument();
    expect(screen.queryByText('niko@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('Što ovaj status znači')).toBeInTheDocument();
    expect(screen.getByText('Upit je poslan. Pružatelj ga može pregledati i odgovoriti.')).toBeInTheDocument();
    expect(screen.getByText(/Ovo je upit, ne potvrđena rezervacija/)).toBeInTheDocument();
  });

  it('shows provider-only owner contact and conversation area copy', () => {
    render(
      <BookingRequestDetailSurface
        {...baseProps}
        role="provider"
        statusLabel="Novo"
        statusTone="withdrawn"
        contact={{ name: 'Niko', email: 'niko@example.com', phone: '+385 91 123 4567' }}
      />,
    );

    expect(screen.getByText('Kontakt vlasnika')).toBeInTheDocument();
    expect(screen.getByText('Niko')).toBeInTheDocument();
    expect(screen.getByText('niko@example.com')).toBeInTheDocument();
    expect(screen.getByText('+385 91 123 4567')).toBeInTheDocument();
    expect(screen.getByText('Razgovor o upitu')).toBeInTheDocument();
    expect(screen.getByText('Vlasnik je povukao upit. Nema akcije, rezervacije ni zaključavanja termina.')).toBeInTheDocument();
    expect(screen.getByText(/Nema automatskog plaćanja ni zaključavanja termina/)).toBeInTheDocument();
  });
});
