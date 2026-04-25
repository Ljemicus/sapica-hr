'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isBefore } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/context';

interface AvailabilityCalendarProps {
  availableDates: Set<string>;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export function AvailabilityCalendar({ availableDates, selectedDate, onSelectDate }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;
  const weekdayLabels = isEn ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];

  const { days, startDay } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return {
      days: eachDayOfInterval({ start: monthStart, end: monthEnd }),
      startDay: monthStart.getDay(),
    };
  }, [currentMonth]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            {isEn ? '📅 Availability' : '📅 Dostupnost'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-orange-50 dark:hover:bg-orange-950/20"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label={isEn ? 'Previous month' : 'Prethodni mjesec'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center capitalize">
              {format(currentMonth, isEn ? 'LLLL yyyy' : 'LLLL yyyy.', { locale })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-orange-50 dark:hover:bg-orange-950/20"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label={isEn ? 'Next month' : 'Sljedeći mjesec'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdayLabels.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startDay }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isAvailable = availableDates.has(dateStr);
            const today = isToday(day);
            const isPast = isBefore(day, new Date()) && !today;
            const isSelected = selectedDate === dateStr;
            const clickable = Boolean(onSelectDate) && isAvailable && !isPast;
            return (
              <button
                type="button"
                key={dateStr}
                disabled={!clickable}
                onClick={() => clickable && onSelectDate?.(dateStr)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : isAvailable
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300'
                } ${today ? 'ring-2 ring-orange-500 ring-offset-2' : ''} ${clickable ? 'cursor-pointer hover:scale-[1.03]' : ''}`}
                title={`${format(day, isEn ? 'MMMM d' : 'd. MMMM', { locale })} — ${isAvailable ? (isEn ? 'Available' : 'Dostupno') : (isEn ? 'Busy' : 'Zauzeto')}`}
                aria-label={`${format(day, isEn ? 'MMMM d' : 'd. MMMM', { locale })} — ${isAvailable ? (isEn ? 'Available' : 'Dostupno') : (isEn ? 'Busy' : 'Zauzeto')}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-green-100 border border-green-200" />
            {isEn ? '🟢 Available' : '🟢 Dostupno'}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-red-50 border border-red-100" />
            {isEn ? '🔴 Busy' : '🔴 Zauzeto'}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md border-2 border-orange-500" />
            {isEn ? 'Today' : 'Danas'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
