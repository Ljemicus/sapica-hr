import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { hr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  currentMonth: Date;
  availableDates: Set<string>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToggleAvailability: (dateStr: string) => void;
}

export function SitterCalendarTab({ currentMonth, availableDates, onPreviousMonth, onNextMonth, onToggleAvailability }: Props) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Monday-first: convert Sunday=0 to 6, Monday=1 to 0, etc.
  const startDay = (monthStart.getDay() + 6) % 7;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Dostupnost</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-orange-50" onClick={onPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center capitalize">
              {format(currentMonth, 'LLLL yyyy.', { locale: hr })}
            </span>
            <Button variant="ghost" size="icon" className="hover:bg-orange-50" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Kliknite na dan da označite dostupnost</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
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
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            return (
              <button
                key={dateStr}
                disabled={isPast}
                onClick={() => onToggleAvailability(dateStr)}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                  isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isAvailable
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isToday(day) ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-green-500" /> Dostupan
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-gray-100 border" /> Nedostupan
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md border-2 border-orange-500" /> Danas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
