// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Calendar Provider (React Context)
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Booking,
  BookingStatus,
  CalendarFilters,
  CalendarView,
  ProviderType,
  AvailabilitySlot,
  BlockedDate,
} from '@/types/calendar';

interface CalendarContextType {
  // Provider info
  providerType: ProviderType;
  providerId: string;
  
  // View state
  currentView: CalendarView;
  setCurrentView: (view: CalendarView) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  
  // Data
  bookings: Booking[];
  availabilitySlots: AvailabilitySlot[];
  blockedDates: BlockedDate[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: CalendarFilters;
  setFilters: (filters: CalendarFilters) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  createBooking: (booking: Partial<Booking>) => Promise<void>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  confirmBooking: (id: string) => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<void>;
  rescheduleBooking: (id: string, startTime: string, endTime: string) => Promise<void>;
  
  // Modal state
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: React.ReactNode;
  providerType: ProviderType;
  providerId: string;
  initialBookings?: Booking[];
}

export function CalendarProvider({
  children,
  providerType,
  providerId,
  initialBookings = [],
}: CalendarProviderProps) {
  // View state
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Data state
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<CalendarFilters>({
    status: ['pending', 'confirmed', 'completed'],
    serviceTypes: [],
    clientId: null,
    dateRange: null,
  });
  
  // Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch data based on current view and date
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate date range based on current view
      const start = new Date(currentDate);
      const end = new Date(currentDate);
      
      switch (currentView) {
        case 'day':
          end.setDate(end.getDate() + 1);
          break;
        case 'week':
          start.setDate(start.getDate() - start.getDay());
          end.setDate(end.getDate() - end.getDay() + 7);
          break;
        case 'month':
          start.setDate(1);
          end.setMonth(end.getMonth() + 1);
          end.setDate(0);
          break;
        case 'agenda':
          end.setMonth(end.getMonth() + 1);
          break;
      }

      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      // Fetch bookings
      const bookingsRes = await fetch(
        `/api/calendar/bookings?provider_type=${providerType}&provider_id=${providerId}&start_date=${startStr}&end_date=${endStr}&include_services=true&status=${filters.status.join(',')}`
      );
      
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.data || []);
      }

      // Fetch availability
      const availabilityRes = await fetch(
        `/api/calendar/availability?provider_type=${providerType}&provider_id=${providerId}&from_date=${startStr}&to_date=${endStr}`
      );
      
      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        setAvailabilitySlots(availabilityData.data || []);
      }

      // Fetch blocked dates
      const blockedRes = await fetch(
        `/api/calendar/blocked-dates?provider_type=${providerType}&provider_id=${providerId}&from_date=${startStr}&to_date=${endStr}`
      );
      
      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedDates(blockedData.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, currentView, providerType, providerId, filters.status]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD operations
  const createBooking = useCallback(async (booking: Partial<Booking>) => {
    try {
      const res = await fetch('/api/calendar/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          provider_type: providerType,
          provider_id: providerId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    }
  }, [fetchData, providerType, providerId]);

  const updateBooking = useCallback(async (id: string, booking: Partial<Booking>) => {
    try {
      const res = await fetch('/api/calendar/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...booking }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update booking');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      throw err;
    }
  }, [fetchData]);

  const deleteBooking = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/bookings?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete booking');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      throw err;
    }
  }, [fetchData]);

  const confirmBooking = useCallback(async (id: string) => {
    await updateBooking(id, { status: 'confirmed' });
  }, [updateBooking]);

  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    try {
      const res = await fetch('/api/calendar/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    }
  }, [fetchData]);

  const rescheduleBooking = useCallback(async (id: string, startTime: string, endTime: string) => {
    await updateBooking(id, { start_time: startTime, end_time: endTime });
  }, [updateBooking]);

  const value: CalendarContextType = {
    providerType,
    providerId,
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    bookings,
    availabilitySlots,
    blockedDates,
    isLoading,
    error,
    filters,
    setFilters,
    refreshData: fetchData,
    createBooking,
    updateBooking,
    deleteBooking,
    confirmBooking,
    cancelBooking,
    rescheduleBooking,
    isBookingModalOpen,
    setIsBookingModalOpen,
    selectedBooking,
    setSelectedBooking,
    selectedDate,
    setSelectedDate,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
