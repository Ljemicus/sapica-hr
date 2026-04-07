// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Professional Calendar Component (FullCalendar)
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import hrLocale from '@fullcalendar/core/locales/hr';
import { useCalendar } from './calendar-provider';
import { BookingModal } from './booking-modal';
import { CalendarFilters } from './calendar-filters';
import type { Booking, CalendarEvent } from '@/types/calendar';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pending: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  confirmed: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  completed: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  cancelled: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  no_show: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
};

export function ProfessionalCalendar() {
  const {
    bookings,
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    isLoading,
    error,
    isBookingModalOpen,
    setIsBookingModalOpen,
    selectedBooking,
    setSelectedBooking,
    selectedDate,
    setSelectedDate,
    confirmBooking,
    cancelBooking,
    refreshData,
  } = useCalendar();

  // Convert bookings to FullCalendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return bookings.map((booking): CalendarEvent => {
      const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
      
      return {
        id: booking.id,
        title: booking.title,
        start: parseISO(booking.start_time),
        end: parseISO(booking.end_time),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          booking,
          services: booking.services || [],
          clientName: booking.client_name,
          petName: booking.pet_name,
          status: booking.status,
        },
      };
    });
  }, [bookings]);

  // Handle date click
  const handleDateClick = useCallback((arg: { date: Date; allDay: boolean }) => {
    setSelectedDate(arg.date);
    setSelectedBooking(null);
    setIsBookingModalOpen(true);
  }, [setSelectedDate, setSelectedBooking, setIsBookingModalOpen]);

  // Handle event click
  const handleEventClick = useCallback((arg: { event: { id: string; extendedProps: { booking: Booking } } }) => {
    setSelectedBooking(arg.event.extendedProps.booking);
    setSelectedDate(null);
    setIsBookingModalOpen(true);
  }, [setSelectedBooking, setSelectedDate, setIsBookingModalOpen]);

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(async (arg: { 
    event: { 
      id: string; 
      start: Date | null; 
      end: Date | null;
      extendedProps: { booking: Booking };
    } 
  }) => {
    const { event } = arg;
    if (!event.start || !event.end) return;

    try {
      // Check for conflicts before updating
      const res = await fetch('/api/calendar/bookings/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: event.extendedProps.booking.provider_type,
          provider_id: event.extendedProps.booking.provider_id,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
          exclude_booking_id: event.id,
        }),
      });

      if (!res.ok) {
        arg.event.extendedProps.booking.start_time = event.extendedProps.booking.start_time;
        arg.event.extendedProps.booking.end_time = event.extendedProps.booking.end_time;
        return;
      }

      const { has_conflict } = await res.json();
      if (has_conflict) {
        // Revert the drag
        alert('Time slot is already booked');
        await refreshData();
        return;
      }

      // Update booking
      await fetch('/api/calendar/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
        }),
      });

      await refreshData();
    } catch (err) {
      console.error('Error updating booking:', err);
      await refreshData();
    }
  }, [refreshData]);

  // Handle event resize
  const handleEventResize = useCallback(async (arg: { 
    event: { 
      id: string; 
      start: Date | null; 
      end: Date | null;
    } 
  }) => {
    const { event } = arg;
    if (!event.start || !event.end) return;

    try {
      await fetch('/api/calendar/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
        }),
      });

      await refreshData();
    } catch (err) {
      console.error('Error resizing booking:', err);
      await refreshData();
    }
  }, [refreshData]);

  // Custom event content
  const renderEventContent = useCallback((eventInfo: { 
    event: { 
      title: string;
      extendedProps: { 
        clientName: string;
        petName: string | null;
        status: string;
      };
    };
    timeText: string;
  }) => {
    const { event, timeText } = eventInfo;
    const { clientName, petName, status } = event.extendedProps;

    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden">
        <div className="font-medium text-xs truncate">{event.title}</div>
        <div className="text-[10px] opacity-80 truncate">{timeText}</div>
        <div className="text-[10px] opacity-80 truncate">{clientName}</div>
        {petName && (
          <div className="text-[10px] opacity-70 truncate">🐾 {petName}</div>
        )}
      </div>
    );
  }, []);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-600">Greška pri učitavanju kalendara</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <Button onClick={refreshData} variant="outline">
            Pokušaj ponovno
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold">Kalendar termina</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarFilters />
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedBooking(null);
              setIsBookingModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            + Novi termin
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-700">Na čekanju</span>
          </div>
          <p className="text-2xl font-bold text-yellow-800">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700">Potvrđeni</span>
          </div>
          <p className="text-2xl font-bold text-green-800">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
        </Card>
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700">Danas</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {bookings.filter(b => {
              const today = new Date().toISOString().split('T')[0];
              return b.start_time.startsWith(today);
            }).length}
          </p>
        </Card>
        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-700">Ukupno</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[600px]"
            >
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView={currentView === 'agenda' ? 'listWeek' : currentView + 'Grid'}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                buttonText={{
                  today: 'Danas',
                  month: 'Mjesec',
                  week: 'Tjedan',
                  day: 'Dan',
                  list: 'Agenda',
                }}
                locale={hrLocale}
                firstDay={1} // Monday
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                editable={true}
                droppable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                eventContent={renderEventContent}
                height="auto"
                aspectRatio={1.5}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                slotDuration="00:30:00"
                snapDuration="00:15:00"
                nowIndicator={true}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
                  startTime: '08:00',
                  endTime: '20:00',
                }}
                selectConstraint="businessHours"
                eventConstraint="businessHours"
                views={{
                  timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
                  },
                  timeGridDay: {
                    titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                  },
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        booking={selectedBooking}
        selectedDate={selectedDate}
      />
    </div>
  );
}
