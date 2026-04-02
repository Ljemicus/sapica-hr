'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Calendar, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GroomerAvailabilityTabProps } from './groomer-dashboard-types';

const INITIAL_DAYS = 14;

export function GroomerAvailabilityTab({ availability, generatingSlots, onGenerateSlots }: GroomerAvailabilityTabProps) {
  const [showAll, setShowAll] = useState(false);

  const groupedEntries = Object.entries(
    availability.reduce<Record<string, typeof availability>>((acc, slot) => {
      const key = slot.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {})
  );

  const totalDays = groupedEntries.length;
  const visibleEntries = showAll ? groupedEntries : groupedEntries.slice(0, INITIAL_DAYS);
  const hasMore = totalDays > INITIAL_DAYS;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upravljanje rasporedom</CardTitle>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={onGenerateSlots}
            disabled={generatingSlots}
          >
            {generatingSlots ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Primijeni radne sate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Kliknite &quot;Primijeni radne sate&quot; za dodavanje standardnih termina (Pon-Pet, 09-17h, 1h slotovi) za sljedećih 4 tjedna.
        </p>
      </CardHeader>
      <CardContent>
        {availability.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">Nemate postavljene termine.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Koristite gumb iznad za generiranje radnog rasporeda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleEntries.map(([date, dateSlots]) => (
              <div key={date}>
                <p className="font-medium text-sm mb-2 capitalize">
                  {format(new Date(date + 'T00:00'), 'EEEE, d. MMMM', { locale: hr })}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dateSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium"
                    >
                      {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Prikaži manje
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Prikaži sve ({totalDays - INITIAL_DAYS} još)
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
