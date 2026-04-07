// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Booking Modal Component
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCalendar } from './calendar-provider';
import type { Booking, BookingStatus, BookingService, ProviderType } from '@/types/calendar';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  PawPrint,
  MapPin,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  selectedDate: Date | null;
  providerType: ProviderType;
  providerId: string;
}

const STATUS_OPTIONS: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Na čekanju', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'confirmed', label: 'Potvrđeno', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'completed', label: 'Završeno', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'cancelled', label: 'Otkazano', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'no_show', label: 'Nije se pojavio', color: 'bg-gray-100 text-gray-800 border-gray-300' },
];

const PET_TYPES = [
  { value: 'dog', label: 'Pas' },
  { value: 'cat', label: 'Mačka' },
  { value: 'other', label: 'Ostalo' },
];

const LOCATION_TYPES = [
  { value: 'provider', label: 'Na lokaciji pružatelja usluge' },
  { value: 'client', label: 'Na adresi klijenta' },
  { value: 'other', label: 'Druga lokacija' },
];

export function BookingModal({ isOpen, onClose, booking, selectedDate, providerType, providerId }: BookingModalProps) {
  const { createBooking, updateBooking, deleteBooking, confirmBooking, cancelBooking } = useCalendar();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    pet_name: '',
    pet_type: 'dog' as 'dog' | 'cat' | 'other',
    start_time: '',
    end_time: '',
    price: '',
    location_type: 'provider' as 'provider' | 'client' | 'other',
    location_address: '',
    description: '',
    internal_notes: '',
    client_notes: '',
    status: 'pending' as BookingStatus,
    services: [] as Array<{
      service_type: string;
      service_name: string;
      duration_minutes: number;
      price: string;
    }>,
  });

  // Initialize form data
  useEffect(() => {
    if (booking) {
      setFormData({
        title: booking.title,
        client_name: booking.client_name,
        client_email: booking.client_email || '',
        client_phone: booking.client_phone || '',
        pet_name: booking.pet_name || '',
        pet_type: (booking.pet_type as 'dog' | 'cat' | 'other' | undefined) || 'dog',
        start_time: format(parseISO(booking.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(parseISO(booking.end_time), "yyyy-MM-dd'T'HH:mm"),
        price: booking.price?.toString() || '',
        location_type: booking.location_type,
        location_address: booking.location_address || '',
        description: booking.description || '',
        internal_notes: booking.internal_notes || '',
        client_notes: booking.client_notes || '',
        status: booking.status,
        services: (booking.services || []).map(s => ({
          service_type: s.service_type,
          service_name: s.service_name,
          duration_minutes: s.duration_minutes,
          price: s.price?.toString() || '',
        })),
      });
    } else if (selectedDate) {
      // Default times for new booking
      const start = new Date(selectedDate);
      start.setMinutes(0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      setFormData({
        title: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        pet_name: '',
        pet_type: 'dog',
        start_time: format(start, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(end, "yyyy-MM-dd'T'HH:mm"),
        price: '',
        location_type: 'provider',
        location_address: '',
        description: '',
        internal_notes: '',
        client_notes: '',
        status: 'pending',
        services: [],
      });
    }
  }, [booking, selectedDate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        provider_type: providerType,
        provider_id: providerId,
        price: formData.price ? parseFloat(formData.price) : undefined,
        services: formData.services.map(s => ({
          service_type: s.service_type,
          service_name: s.service_name,
          duration_minutes: s.duration_minutes,
          price: s.price ? parseFloat(s.price) : undefined,
        })),
      };

      if (booking) {
        await updateBooking(booking.id, data);
      } else {
        await createBooking(data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [booking, formData, createBooking, updateBooking, onClose]);

  const handleDelete = useCallback(async () => {
    if (!booking) return;
    setIsLoading(true);
    
    try {
      await deleteBooking(booking.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [booking, deleteBooking, onClose]);

  const handleCancel = useCallback(async () => {
    if (!booking) return;
    setIsLoading(true);
    
    try {
      await cancelBooking(booking.id, cancelReason);
      setShowCancelConfirm(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [booking, cancelBooking, cancelReason, onClose]);

  const handleConfirm = useCallback(async () => {
    if (!booking) return;
    setIsLoading(true);
    
    try {
      await confirmBooking(booking.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [booking, confirmBooking, onClose]);

  const addService = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        { service_type: '', service_name: '', duration_minutes: 60, price: '' },
      ],
    }));
  }, []);

  const removeService = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }, []);

  const updateService = useCallback((index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  }, []);

  const isEditing = !!booking;
  const statusOption = STATUS_OPTIONS.find(s => s.value === formData.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isEditing ? 'Uredi termin' : 'Novi termin'}
            </DialogTitle>
            {isEditing && (
              <Badge className={statusOption?.color}>
                {statusOption?.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Quick Actions for existing booking */}
            {isEditing && (
              <div className="flex flex-wrap gap-2">
                {formData.status === 'pending' && (
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Potvrdi
                  </Button>
                )}
                {formData.status !== 'cancelled' && formData.status !== 'completed' && (
                  <Button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Otkaži
                  </Button>
                )}
              </div>
            )}

            {/* Service Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Naziv usluge *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="npr. Šišanje psa"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Početak *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Kraj *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Podaci o klijentu
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Ime i prezime *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={e => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="npr. Ana Horvat"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="client_phone"
                      value={formData.client_phone}
                      onChange={e => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                      placeholder="091 234 5678"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={e => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="klijent@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pet Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <PawPrint className="h-4 w-4" />
                Podaci o ljubimcu
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pet_name">Ime ljubimca</Label>
                  <Input
                    id="pet_name"
                    value={formData.pet_name}
                    onChange={e => setFormData(prev => ({ ...prev, pet_name: e.target.value }))}
                    placeholder="npr. Rex"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pet_type">Vrsta</Label>
                  <Select
                    value={formData.pet_type}
                    onValueChange={v => setFormData(prev => ({ ...prev, pet_type: v as 'dog' | 'cat' | 'other' }))}
                  >
                    <SelectTrigger id="pet_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Services */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Usluge</h4>
                <Button type="button" onClick={addService} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj uslugu
                </Button>
              </div>

              {formData.services.length === 0 && (
                <p className="text-sm text-gray-500">Nema dodanih usluga</p>
              )}

              {formData.services.map((service, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usluga {index + 1}</span>
                    <Button
                      type="button"
                      onClick={() => removeService(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Naziv usluge"
                      value={service.service_name}
                      onChange={e => updateService(index, 'service_name', e.target.value)}
                    />
                    <Input
                      placeholder="Tip usluge"
                      value={service.service_type}
                      onChange={e => updateService(index, 'service_type', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Trajanje (min)"
                      value={service.duration_minutes}
                      onChange={e => updateService(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                    />
                    <Input
                      type="number"
                      placeholder="Cijena (€)"
                      value={service.price}
                      onChange={e => updateService(index, 'price', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lokacija
              </h4>
              
              <div className="space-y-2">
                <Label>Tip lokacije</Label>
                <Select
                  value={formData.location_type}
                  onValueChange={v => setFormData(prev => ({ ...prev, location_type: v as 'provider' | 'client' | 'other' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.location_type !== 'provider' && (
                <div className="space-y-2">
                  <Label htmlFor="location_address">Adresa</Label>
                  <Textarea
                    id="location_address"
                    value={formData.location_address}
                    onChange={e => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                    placeholder="Unesite adresu..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bilješke
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Opis usluge..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal_notes">Interne bilješke (vidljivo samo vama)</Label>
                <Textarea
                  id="internal_notes"
                  value={formData.internal_notes}
                  onChange={e => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                  placeholder="Interne bilješke..."
                  rows={2}
                />
              </div>
            </div>

            {/* Status (only for editing) */}
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={v => setFormData(prev => ({ ...prev, status: v as BookingStatus }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          {isEditing && (
            <Button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 mr-auto"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Obriši
            </Button>
          )}
          <Button type="button" onClick={onClose} variant="outline" disabled={isLoading}>
            Odustani
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            {isEditing ? 'Spremi promjene' : 'Kreiraj termin'}
          </Button>
        </DialogFooter>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Potvrdi brisanje</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Jeste li sigurni da želite obrisati ovaj termin? Ova radnja se ne može poništiti.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Odustani
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                Obriši termin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Potvrdi otkazivanje</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Jeste li sigurni da želite otkazati ovaj termin?
              </p>
              <div className="space-y-2">
                <Label htmlFor="cancel_reason">Razlog otkazivanja (opcionalno)</Label>
                <Textarea
                  id="cancel_reason"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Unesite razlog..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                Odustani
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                Otkaži termin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
