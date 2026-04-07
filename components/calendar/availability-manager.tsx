// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Availability Manager Component
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useCalendar } from './calendar-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Repeat,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import type { AvailabilitySlot, BlockedDate, WorkingHours } from '@/types/calendar';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Ponedjeljak', short: 'Pon' },
  { value: 2, label: 'Utorak', short: 'Uto' },
  { value: 3, label: 'Srijeda', short: 'Sri' },
  { value: 4, label: 'Četvrtak', short: 'Čet' },
  { value: 5, label: 'Petak', short: 'Pet' },
  { value: 6, label: 'Subota', short: 'Sub' },
  { value: 0, label: 'Nedjelja', short: 'Ned' },
];

const BLOCK_TYPES = [
  { value: 'time_off', label: 'Slobodno vrijeme', color: 'bg-blue-100 text-blue-800' },
  { value: 'vacation', label: 'Godisnji odmor', color: 'bg-green-100 text-green-800' },
  { value: 'holiday', label: 'Blagdan', color: 'bg-purple-100 text-purple-800' },
  { value: 'sick_leave', label: 'Bolovanje', color: 'bg-red-100 text-red-800' },
  { value: 'personal', label: 'Osobno', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'other', label: 'Ostalo', color: 'bg-gray-100 text-gray-800' },
];

export function AvailabilityManager() {
  const { providerType, providerId, availabilitySlots, blockedDates, refreshData } = useCalendar();
  
  const [activeTab, setActiveTab] = useState('working-hours');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    pon: { start: '09:00', end: '17:00' },
    uto: { start: '09:00', end: '17:00' },
    sri: { start: '09:00', end: '17:00' },
    cet: { start: '09:00', end: '17:00' },
    pet: { start: '09:00', end: '17:00' },
  });

  // One-time slot modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    specific_date: '',
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 60,
    notes: '',
  });

  // Blocked date modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    block_type: 'time_off' as const,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    title: '',
    reason: '',
    is_recurring_yearly: false,
  });

  // Load existing working hours
  useEffect(() => {
    const recurringSlots = availabilitySlots.filter(s => s.slot_type === 'recurring');
    const hours: WorkingHours = {};
    
    const dayMap: Record<number, keyof WorkingHours> = {
      1: 'pon', 2: 'uto', 3: 'sri', 4: 'cet', 5: 'pet', 6: 'sub', 0: 'ned',
    };

    recurringSlots.forEach(slot => {
      if (slot.day_of_week !== null) {
        const dayKey = dayMap[slot.day_of_week];
        if (dayKey) {
          hours[dayKey] = {
            start: slot.start_time.substring(0, 5),
            end: slot.end_time.substring(0, 5),
          };
        }
      }
    });

    if (Object.keys(hours).length > 0) {
      setWorkingHours(hours);
    }
  }, [availabilitySlots]);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  // Save working hours
  const saveWorkingHours = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/calendar/availability/working-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: providerType,
          provider_id: providerId,
          working_hours: workingHours,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save working hours');
      }

      await refreshData();
      showSuccess('Radno vrijeme spremljeno');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [workingHours, providerType, providerId, refreshData, showSuccess, showError]);

  // Add one-time slot
  const addOneTimeSlot = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: providerType,
          provider_id: providerId,
          slot_type: 'one_time',
          specific_date: slotForm.specific_date,
          start_time: slotForm.start_time,
          end_time: slotForm.end_time,
          slot_duration_minutes: parseInt(slotForm.slot_duration_minutes.toString()),
          notes: slotForm.notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add slot');
      }

      await refreshData();
      setIsSlotModalOpen(false);
      setSlotForm({
        specific_date: '',
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 60,
        notes: '',
      });
      showSuccess('Termin dodan');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [slotForm, providerType, providerId, refreshData, showSuccess, showError]);

  // Delete slot
  const deleteSlot = useCallback(async (slotId: string) => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/calendar/availability?id=${slotId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete slot');
      }

      await refreshData();
      showSuccess('Termin obrisan');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [refreshData, showSuccess, showError]);

  // Add blocked date
  const addBlockedDate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/calendar/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: providerType,
          provider_id: providerId,
          ...blockForm,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add blocked date');
      }

      await refreshData();
      setIsBlockModalOpen(false);
      setBlockForm({
        block_type: 'time_off',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        title: '',
        reason: '',
        is_recurring_yearly: false,
      });
      showSuccess('Blokirani datum dodan');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [blockForm, providerType, providerId, refreshData, showSuccess, showError]);

  // Delete blocked date
  const deleteBlockedDate = useCallback(async (blockedDateId: string) => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/calendar/blocked-dates?id=${blockedDateId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete blocked date');
      }

      await refreshData();
      showSuccess('Blokirani datum obrisan');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [refreshData, showSuccess, showError]);

  // Update working hours for a day
  const updateWorkingHours = useCallback((day: keyof WorkingHours, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }, []);

  // Toggle day availability
  const toggleDay = useCallback((day: keyof WorkingHours) => {
    setWorkingHours(prev => {
      if (prev[day]) {
        const { [day]: _, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [day]: { start: '09:00', end: '17:00' },
        };
      }
    });
  }, []);

  const oneTimeSlots = availabilitySlots.filter(s => s.slot_type === 'one_time');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Upravljanje dostupnošću</h2>
          <p className="text-sm text-gray-500">Postavite radno vrijeme, posebne termine i blokirane datume</p>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="working-hours">Radno vrijeme</TabsTrigger>
          <TabsTrigger value="special-slots">Posebni termini</TabsTrigger>
          <TabsTrigger value="blocked-dates">Blokirani datumi</TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="working-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tjedni raspored
              </CardTitle>
              <CardDescription>
                Postavite svoje standardno radno vrijeme za svaki dan u tjednu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS_OF_WEEK.map(day => {
                const isActive = !!workingHours[day.label.toLowerCase().substring(0, 3) as keyof WorkingHours];
                const dayKey = day.label.toLowerCase().substring(0, 3) as keyof WorkingHours;
                const hours = workingHours[dayKey];

                return (
                  <div
                    key={day.value}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleDay(dayKey)}
                    />
                    <span className="w-24 font-medium">{day.label}</span>
                    {isActive && hours ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={hours.start}
                          onChange={e => updateWorkingHours(dayKey, 'start', e.target.value)}
                          className="w-28"
                        />
                        <span className="text-gray-400">do</span>
                        <Input
                          type="time"
                          value={hours.end}
                          onChange={e => updateWorkingHours(dayKey, 'end', e.target.value)}
                          className="w-28"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 flex-1">Ne radi</span>
                    )}
                  </div>
                );
              })}

              <Button
                onClick={saveWorkingHours}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Spremi radno vrijeme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Slots Tab */}
        <TabsContent value="special-slots" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Posebni termini
                </CardTitle>
                <CardDescription>
                  Dodajte jednokratne termine dostupnosti za određene datume
                </CardDescription>
              </div>
              <Button onClick={() => setIsSlotModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj termin
              </Button>
            </CardHeader>
            <CardContent>
              {oneTimeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nema posebnih termina</p>
                  <p className="text-sm">Dodajte termin za određeni datum</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {oneTimeSlots
                    .sort((a, b) => new Date(a.specific_date!).getTime() - new Date(b.specific_date!).getTime())
                    .map(slot => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {format(parseISO(slot.specific_date!), 'EEEE, d. MMMM yyyy', { locale: hr })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            {slot.notes && ` • ${slot.notes}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSlot(slot.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Dates Tab */}
        <TabsContent value="blocked-dates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <X className="h-5 w-5" />
                  Blokirani datumi
                </CardTitle>
                <CardDescription>
                  Označite datume kada niste dostupni (godišnji odmor, blagdani, itd.)
                </CardDescription>
              </div>
              <Button onClick={() => setIsBlockModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj blokadu
              </Button>
            </CardHeader>
            <CardContent>
              {blockedDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nema blokiranih datuma</p>
                  <p className="text-sm">Dodajte kada ste nedostupni</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedDates
                    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .map(blocked => {
                      const blockType = BLOCK_TYPES.find(t => t.value === blocked.block_type);
                      return (
                        <div
                          key={blocked.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className={blockType?.color}>
                              {blockType?.label}
                            </Badge>
                            <div>
                              <p className="font-medium">
                                {blocked.title || blockType?.label}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(parseISO(blocked.start_date), 'd. MMMM', { locale: hr })}
                                {blocked.start_date !== blocked.end_date && (
                                  <> - {format(parseISO(blocked.end_date), 'd. MMMM yyyy', { locale: hr })}</>
                                )}
                                {blocked.start_time && (
                                  <> • {blocked.start_time.substring(0, 5)} - {blocked.end_time?.substring(0, 5)}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBlockedDate(blocked.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add One-Time Slot Modal */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj posebni termin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="specific_date">Datum *</Label>
              <Input
                id="specific_date"
                type="date"
                value={slotForm.specific_date}
                onChange={e => setSlotForm(prev => ({ ...prev, specific_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Početak *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={slotForm.start_time}
                  onChange={e => setSlotForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Kraj *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={slotForm.end_time}
                  onChange={e => setSlotForm(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot_duration">Trajanje termina (min)</Label>
              <Select
                value={slotForm.slot_duration_minutes.toString()}
                onValueChange={v => setSlotForm(prev => ({ ...prev, slot_duration_minutes: parseInt(v || '30') }))}
              >
                <SelectTrigger id="slot_duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minuta</SelectItem>
                  <SelectItem value="30">30 minuta</SelectItem>
                  <SelectItem value="45">45 minuta</SelectItem>
                  <SelectItem value="60">1 sat</SelectItem>
                  <SelectItem value="90">1.5 sata</SelectItem>
                  <SelectItem value="120">2 sata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Bilješke</Label>
              <Input
                id="notes"
                value={slotForm.notes}
                onChange={e => setSlotForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="npr. Samo ujutro"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSlotModalOpen(false)}>
              Odustani
            </Button>
            <Button
              onClick={addOneTimeSlot}
              disabled={isLoading || !slotForm.specific_date}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Dodaj termin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Blocked Date Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj blokirani datum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block_type">Tip *</Label>
              <Select
                value={blockForm.block_type}
                onValueChange={v => setBlockForm(prev => ({ ...prev, block_type: v as typeof blockForm.block_type }))}
              >
                <SelectTrigger id="block_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Od datuma *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={blockForm.start_date}
                  onChange={e => setBlockForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Do datuma *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={blockForm.end_date}
                  onChange={e => setBlockForm(prev => ({ ...prev, end_date: e.target.value }))}
                  min={blockForm.start_date}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Naslov</Label>
              <Input
                id="title"
                value={blockForm.title}
                onChange={e => setBlockForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="npr. Godišnji odmor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Razlog</Label>
              <Input
                id="reason"
                value={blockForm.reason}
                onChange={e => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Dodatni opis..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockModalOpen(false)}>
              Odustani
            </Button>
            <Button
              onClick={addBlockedDate}
              disabled={isLoading || !blockForm.start_date || !blockForm.end_date}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Dodaj blokadu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
