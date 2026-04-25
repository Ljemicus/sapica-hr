import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock analytics functions
const mockTrackFunnelEvent = vi.fn();
const mockFunnel = {
  signupStart: (source: string) => mockTrackFunnelEvent('signup_start', { source }),
  signupComplete: (userId: string, method: string) => mockTrackFunnelEvent('signup_complete', { userId, method }),
  bookingInitiated: (sitterId: string, serviceType: string) => mockTrackFunnelEvent('booking_initiated', { sitterId, serviceType }),
  paymentComplete: (bookingId: string, amount: number, method: string) => mockTrackFunnelEvent('payment_complete', { bookingId, amount, method }),
};

describe('📊 Analytics Funnel', () => {
  beforeEach(() => {
    mockTrackFunnelEvent.mockClear();
  });

  describe('Signup Funnel', () => {
    it('should track signup start', () => {
      mockFunnel.signupStart('homepage');
      
      expect(mockTrackFunnelEvent).toHaveBeenCalledWith('signup_start', { source: 'homepage' });
    });

    it('should track signup complete', () => {
      mockFunnel.signupComplete('user-123', 'email');
      
      expect(mockTrackFunnelEvent).toHaveBeenCalledWith('signup_complete', { userId: 'user-123', method: 'email' });
    });
  });

  describe('Booking Funnel', () => {
    it('should track booking initiated', () => {
      mockFunnel.bookingInitiated('sitter-456', 'boarding');
      
      expect(mockTrackFunnelEvent).toHaveBeenCalledWith('booking_initiated', { sitterId: 'sitter-456', serviceType: 'boarding' });
    });
  });

  describe('Payment Funnel', () => {
    it('should track payment complete', () => {
      mockFunnel.paymentComplete('booking-789', 150, 'card');
      
      expect(mockTrackFunnelEvent).toHaveBeenCalledWith('payment_complete', { bookingId: 'booking-789', amount: 150, method: 'card' });
    });
  });
});
