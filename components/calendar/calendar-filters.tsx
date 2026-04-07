// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Calendar Filters Component
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React from 'react';
import { useCalendar } from './calendar-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Check } from 'lucide-react';
import type { BookingStatus } from '@/types/calendar';

const STATUS_OPTIONS: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Na čekanju', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Potvrđeno', color: 'bg-green-500' },
  { value: 'completed', label: 'Završeno', color: 'bg-blue-500' },
  { value: 'cancelled', label: 'Otkazano', color: 'bg-red-500' },
  { value: 'no_show', label: 'Nije se pojavio', color: 'bg-gray-500' },
];

export function CalendarFilters() {
  const { filters, setFilters } = useCalendar();

  const toggleStatus = (status: BookingStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    setFilters({ ...filters, status: newStatus });
  };

  const clearFilters = () => {
    setFilters({
      status: ['pending', 'confirmed', 'completed'],
      serviceTypes: [],
      clientId: null,
      dateRange: null,
    });
  };

  const hasActiveFilters =
    filters.status.length !== 3 ||
    filters.serviceTypes.length > 0 ||
    filters.clientId !== null;

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtriraj
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {filters.status.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filteri</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto py-1 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Očisti
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Status termina</Label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <span className={`h-2 w-2 rounded-full ${option.color}`} />
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            Prikazuje se {filters.status.length} od {STATUS_OPTIONS.length} statusa
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
