'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, getDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Loader2, Save, GraduationCap, Plus, X, Pencil, Trash2, BookOpen, Calendar, Sparkles, ChevronDown, ChevronUp, Clock, ClipboardList, Check, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CITIES,
  TRAINING_TYPE_LABELS,
  TRAINER_BOOKING_STATUS_LABELS,
  TRAINER_BOOKING_STATUS_COLORS,
  type Trainer,
  type TrainingProgram,
  type TrainingType,
  type TrainerAvailabilitySlot,
  type TrainerBooking,
  type TrainerBookingStatus,
} from '@/lib/types';
import { TrainerOnboardingWizard } from './components/trainer-onboarding-wizard';

interface TrainerDashboardContentProps {
  trainer: Trainer;
  initialPrograms: TrainingProgram[];
  initialAvailability: TrainerAvailabilitySlot[];
  initialBookings: TrainerBooking[];
}

const EMPTY_PROGRAM_FORM = {
  name: '',
  type: 'osnovna' as TrainingType,
  duration_weeks: 4,
  sessions: 8,
  price: 0,
  description: '',
};

const INITIAL_DAYS = 14;

const DAY_LABELS = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'] as const;
const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export function TrainerDashboardContent({ trainer, initialPrograms, initialAvailability, initialBookings }: TrainerDashboardContentProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [newCert, setNewCert] = useState('');
  const [form, setForm] = useState({
    name: trainer.name,
    bio: trainer.bio || '',
    city: trainer.city,
    phone: trainer.phone || '',
    email: trainer.email || '',
    address: trainer.address || '',
    specializations: trainer.specializations || [],
    price_per_hour: trainer.price_per_hour,
    certificates: trainer.certificates || [],
  });

  // Program management state
  const [programs, setPrograms] = useState<TrainingProgram[]>(initialPrograms);
  const [programForm, setProgramForm] = useState(EMPTY_PROGRAM_FORM);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);

  // Availability state
  const [availability, setAvailability] = useState<TrainerAvailabilitySlot[]>(initialAvailability);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  // Working hours configuration
  const [workDays, setWorkDays] = useState<number[]>(DEFAULT_WORK_DAYS);
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');

  // Manual slot editor state
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: '', start_time: '09:00', end_time: '10:00' });
  const [savingSlot, setSavingSlot] = useState(false);
  const [deletingSlotIds, setDeletingSlotIds] = useState<Set<string>>(new Set());

  // Bookings state
  const [bookings, setBookings] = useState<TrainerBooking[]>(initialBookings);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  const handleBookingStatus = async (bookingId: string, status: TrainerBookingStatus) => {
    setUpdatingBookingId(bookingId);
    try {
      const res = await fetch(`/api/trainer-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trainerId: trainer.id }),
      });
      if (res.ok) {
        const updated: TrainerBooking = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
        const label = TRAINER_BOOKING_STATUS_LABELS[status];
        toast.success(`Rezervacija: ${label}`);
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri ažuriranju statusa');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  const toggleWorkDay = (dow: number) => {
    setWorkDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow].sort(),
    );
  };

  const handleGenerateSlots = async () => {
    if (workDays.length === 0) {
      toast.error('Odaberite barem jedan radni dan');
      return;
    }
    if (workStart >= workEnd) {
      toast.error('Početak radnog vremena mora biti prije kraja');
      return;
    }
    setGeneratingSlots(true);
    try {
      const startHour = parseInt(workStart.split(':')[0], 10);
      const endHour = parseInt(workEnd.split(':')[0], 10);
      const slots: { date: string; start_time: string; end_time: string }[] = [];
      const today = new Date();
      for (let d = 0; d < 28; d++) {
        const day = addDays(today, d);
        const dow = getDay(day);
        if (workDays.includes(dow)) {
          const dateStr = format(day, 'yyyy-MM-dd');
          for (let h = startHour; h < endHour; h++) {
            slots.push({
              date: dateStr,
              start_time: `${String(h).padStart(2, '0')}:00`,
              end_time: `${String(h + 1).padStart(2, '0')}:00`,
            });
          }
        }
      }

      const res = await fetch('/api/trainer-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainer.id, slots }),
      });

      if (res.ok) {
        const data = await res.json();
        setAvailability(data);
        toast.success('Raspored generiran za sljedeća 4 tjedna!');
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri generiranju rasporeda');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleAddSlot = async () => {
    if (!slotForm.date || !slotForm.start_time || !slotForm.end_time) {
      toast.error('Datum, početak i kraj su obavezni');
      return;
    }
    if (slotForm.start_time >= slotForm.end_time) {
      toast.error('Početak mora biti prije kraja');
      return;
    }
    setSavingSlot(true);
    try {
      const res = await fetch('/api/trainer-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: trainer.id,
          slots: [{ date: slotForm.date, start_time: slotForm.start_time, end_time: slotForm.end_time }],
        }),
      });
      if (res.ok) {
        const data: TrainerAvailabilitySlot[] = await res.json();
        setAvailability((prev) => {
          const ids = new Set(prev.map((s) => s.id));
          return [...prev, ...data.filter((s) => !ids.has(s.id))]
            .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
        });
        toast.success('Termin dodan!');
        setSlotForm({ date: slotForm.date, start_time: slotForm.start_time, end_time: slotForm.end_time });
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri dodavanju termina');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setDeletingSlotIds((prev) => new Set(prev).add(slotId));
    try {
      const res = await fetch('/api/trainer-availability', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainer.id, slot_ids: [slotId] }),
      });
      if (res.ok) {
        setAvailability((prev) => prev.filter((s) => s.id !== slotId));
        toast.success('Termin obrisan');
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri brisanju');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setDeletingSlotIds((prev) => {
        const next = new Set(prev);
        next.delete(slotId);
        return next;
      });
    }
  };

  const handleDeleteDay = async (date: string) => {
    const daySlots = availability.filter((s) => s.date === date);
    if (daySlots.length === 0) return;
    const ids = daySlots.map((s) => s.id);
    ids.forEach((id) => setDeletingSlotIds((prev) => new Set(prev).add(id)));
    try {
      const res = await fetch('/api/trainer-availability', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainer.id, slot_ids: ids }),
      });
      if (res.ok) {
        setAvailability((prev) => prev.filter((s) => s.date !== date));
        toast.success('Svi termini za taj dan obrisani');
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri brisanju');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setDeletingSlotIds(new Set());
    }
  };

  const handleToggleSpecialization = (spec: TrainingType) => {
    const specializations = form.specializations.includes(spec)
      ? form.specializations.filter((s) => s !== spec)
      : [...form.specializations, spec];
    setForm({ ...form, specializations });
  };

  const handleAddCertificate = () => {
    const cert = newCert.trim();
    if (cert && !form.certificates.includes(cert)) {
      setForm({ ...form, certificates: [...form.certificates, cert] });
      setNewCert('');
    }
  };

  const handleRemoveCertificate = (cert: string) => {
    setForm({ ...form, certificates: form.certificates.filter((c) => c !== cert) });
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Ime mora imati najmanje 2 znaka');
      return;
    }
    if (form.specializations.length === 0) {
      toast.error('Odaberite barem jednu specijalizaciju');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/trainer-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Profil spremljen!');
        startTransition(() => router.refresh());
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri spremanju');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setSaving(false);
    }
  };

  // ── Program CRUD handlers ──

  const handleOpenNewProgram = () => {
    setProgramForm(EMPTY_PROGRAM_FORM);
    setEditingProgramId(null);
    setShowProgramForm(true);
  };

  const handleEditProgram = (program: TrainingProgram) => {
    setProgramForm({
      name: program.name,
      type: program.type,
      duration_weeks: program.duration_weeks,
      sessions: program.sessions,
      price: program.price,
      description: program.description,
    });
    setEditingProgramId(program.id);
    setShowProgramForm(true);
  };

  const handleCancelProgramForm = () => {
    setShowProgramForm(false);
    setEditingProgramId(null);
    setProgramForm(EMPTY_PROGRAM_FORM);
  };

  const handleSaveProgram = async () => {
    if (programForm.name.trim().length < 2) {
      toast.error('Naziv programa mora imati najmanje 2 znaka');
      return;
    }
    if (programForm.description.trim().length < 5) {
      toast.error('Opis mora imati najmanje 5 znakova');
      return;
    }

    setSavingProgram(true);
    try {
      const isEdit = editingProgramId !== null;
      const res = await fetch('/api/trainer-programs', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingProgramId, ...programForm } : programForm),
      });

      if (res.ok) {
        const data = await res.json();
        if (isEdit) {
          setPrograms((prev) => prev.map((p) => (p.id === editingProgramId ? data.program : p)));
          toast.success('Program ažuriran!');
        } else {
          setPrograms((prev) => [...prev, data.program]);
          toast.success('Program kreiran!');
        }
        handleCancelProgramForm();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri spremanju programa');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setSavingProgram(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    setDeletingProgramId(programId);
    try {
      const res = await fetch('/api/trainer-programs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: programId }),
      });

      if (res.ok) {
        setPrograms((prev) => prev.filter((p) => p.id !== programId));
        toast.success('Program obrisan');
        if (editingProgramId === programId) {
          handleCancelProgramForm();
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri brisanju programa');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setDeletingProgramId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Trener Dashboard</h1>
          <p className="text-muted-foreground text-sm">{trainer.name} — {trainer.city}</p>
        </div>
        {trainer.certified && (
          <Badge className="bg-green-100 text-green-700 border-green-200 ml-auto">Certificiran</Badge>
        )}
      </div>

      <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-blue-50 p-4 mb-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Brzi fokus</p>
            <p className="text-sm text-muted-foreground">Uredite programe, održavajte dostupnost svježom i odgovorite na nove upite bez kašnjenja.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{pendingCount} na čekanju</span>
            <span>•</span>
            <span>{confirmedCount} potvrđenih</span>
            <span>•</span>
            <span>{programs.length} programa</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{trainer.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Ocjena</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{trainer.review_count}</p>
            <p className="text-xs text-muted-foreground">Recenzija</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{programs.length}</p>
            <p className="text-xs text-muted-foreground">Programa</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* ── Profile section ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ime / naziv *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Vaše ime"
                className="focus:border-orange-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Opišite svoje iskustvo i pristup treniranju..."
                rows={4}
                className="focus:border-orange-300"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grad *</Label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
                >
                  <option value="">Odaberite grad</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+385 91 234 5678"
                  className="focus:border-orange-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@primjer.hr"
                  className="focus:border-orange-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Adresa</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Ulica i broj, grad"
                  className="focus:border-orange-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Specijalizacije i cijena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(
                ([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-3 rounded-xl border hover:border-orange-200 transition-colors"
                  >
                    <Switch
                      checked={form.specializations.includes(key)}
                      onCheckedChange={() => handleToggleSpecialization(key)}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                )
              )}
            </div>
            <div className="space-y-2">
              <Label>Cijena po satu (&euro;)</Label>
              <Input
                type="number"
                value={form.price_per_hour}
                onChange={(e) => setForm({ ...form, price_per_hour: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-32 focus:border-orange-300"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Certifikati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.certificates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.certificates.map((cert) => (
                  <Badge key={cert} variant="secondary" className="pr-1 flex items-center gap-1">
                    {cert}
                    <button
                      onClick={() => handleRemoveCertificate(cert)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Naziv certifikata"
                className="focus:border-orange-300"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificate())}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCertificate}
                disabled={!newCert.trim()}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full bg-orange-500 hover:bg-orange-600 btn-hover"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Spremanje...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Spremi profil
            </>
          )}
        </Button>

        {/* ── Availability section ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Upravljanje rasporedom
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => setShowSlotForm(!showSlotForm)}
                >
                  {showSlotForm ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Zatvori
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Dodaj termin
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleGenerateSlots}
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
            </div>
            <p className="text-xs text-muted-foreground">
              Konfigurirajte radne dane i sate, pa kliknite &quot;Primijeni radne sate&quot; za generiranje termina za 4 tjedna.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Working hours configuration */}
            <div className="border rounded-xl p-4 space-y-3 bg-orange-50/30">
              <p className="font-medium text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Radno vrijeme
              </p>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleWorkDay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      workDays.includes(idx)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <div className="space-y-1">
                  <Label className="text-xs">Početak</Label>
                  <Input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    step="3600"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kraj</Label>
                  <Input
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    step="3600"
                  />
                </div>
              </div>
            </div>

            {/* Manual slot form */}
            {showSlotForm && (
              <div className="border rounded-xl p-4 space-y-3 bg-orange-50/50">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Novi termin
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Datum *</Label>
                    <Input
                      type="date"
                      value={slotForm.date}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                      className="focus:border-orange-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Početak *</Label>
                    <Input
                      type="time"
                      value={slotForm.start_time}
                      onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                      className="focus:border-orange-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kraj *</Label>
                    <Input
                      type="time"
                      value={slotForm.end_time}
                      onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                      className="focus:border-orange-300"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddSlot}
                    disabled={savingSlot}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {savingSlot ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Spremanje...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Dodaj
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Slot list */}
            {availability.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Nemate postavljene termine.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Koristite gumb &quot;Dodaj termin&quot; ili generirajte radni raspored.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const grouped = Object.entries(
                    availability.reduce<Record<string, TrainerAvailabilitySlot[]>>((acc, slot) => {
                      if (!acc[slot.date]) acc[slot.date] = [];
                      acc[slot.date].push(slot);
                      return acc;
                    }, {})
                  );
                  const visible = showAllDays ? grouped : grouped.slice(0, INITIAL_DAYS);
                  const hasMore = grouped.length > INITIAL_DAYS;
                  return (
                    <>
                      {visible.map(([date, dateSlots]) => (
                        <div key={date}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm capitalize">
                              {format(new Date(date + 'T00:00'), 'EEEE, d. MMMM', { locale: hr })}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-red-600"
                              onClick={() => handleDeleteDay(date)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Obriši dan
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {dateSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="group px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1.5"
                              >
                                {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  disabled={deletingSlotIds.has(slot.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                >
                                  {deletingSlotIds.has(slot.id) ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                </button>
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
                          onClick={() => setShowAllDays(!showAllDays)}
                        >
                          {showAllDays ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Prikaži manje
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Prikaži sve ({grouped.length - INITIAL_DAYS} još)
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Bookings section ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-orange-500" />
                Rezervacije
                {pendingCount > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                    {pendingCount} na čekanju
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {([
                ['all', 'Sve', bookings.length],
                ['pending', 'Na čekanju', pendingCount],
                ['confirmed', 'Potvrđene', confirmedCount],
              ] as const).map(([key, label, count]) => (
                <button
                  key={key}
                  onClick={() => setBookingFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    bookingFilter === key
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nema rezervacija.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => {
                  const isUpdating = updatingBookingId === booking.id;
                  const isPending = booking.status === 'pending';
                  const isConfirmed = booking.status === 'confirmed';
                  return (
                    <div
                      key={booking.id}
                      className="border rounded-xl p-4 hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {format(new Date(booking.date + 'T00:00'), 'EEEE, d. MMM', { locale: hr })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {booking.start_time.slice(0, 5)} — {booking.end_time.slice(0, 5)}
                            </span>
                            <Badge className={`text-xs border ${TRAINER_BOOKING_STATUS_COLORS[booking.status]}`}>
                              {TRAINER_BOOKING_STATUS_LABELS[booking.status]}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {booking.pet_name && <span>Ljubimac: {booking.pet_name}</span>}
                            {booking.note && <span className="truncate max-w-[200px]">Napomena: {booking.note}</span>}
                          </div>
                        </div>

                        {/* Action buttons */}
                        {(isPending || isConfirmed) && (
                          <div className="flex gap-1 flex-shrink-0">
                            {isPending && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      Potvrdi
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleBookingStatus(booking.id, 'rejected')}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      Odbij
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {isConfirmed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                                onClick={() => handleBookingStatus(booking.id, 'cancelled')}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Ban className="h-3.5 w-3.5 mr-1" />
                                    Otkaži
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Programs section ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                Programi treniranja
              </CardTitle>
              {!showProgramForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenNewProgram}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novi program
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Program form (create / edit) */}
            {showProgramForm && (
              <div className="border rounded-xl p-4 space-y-4 bg-orange-50/50">
                <p className="font-medium text-sm">
                  {editingProgramId ? 'Uredi program' : 'Novi program'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Naziv programa *</Label>
                    <Input
                      value={programForm.name}
                      onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                      placeholder="npr. Osnovna poslušnost"
                      className="focus:border-orange-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vrsta treninga *</Label>
                    <select
                      value={programForm.type}
                      onChange={(e) => setProgramForm({ ...programForm, type: e.target.value as TrainingType })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
                    >
                      {(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(
                        ([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        )
                      )}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Trajanje (tjedana) *</Label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={programForm.duration_weeks}
                      onChange={(e) => setProgramForm({ ...programForm, duration_weeks: parseInt(e.target.value) || 1 })}
                      className="focus:border-orange-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Broj sesija *</Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={programForm.sessions}
                      onChange={(e) => setProgramForm({ ...programForm, sessions: parseInt(e.target.value) || 1 })}
                      className="focus:border-orange-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cijena (&euro;) *</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100000}
                      value={programForm.price}
                      onChange={(e) => setProgramForm({ ...programForm, price: parseInt(e.target.value) || 0 })}
                      className="focus:border-orange-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Opis programa *</Label>
                  <Textarea
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    placeholder="Opišite što program uključuje, za koga je namijenjen, metodologiju..."
                    rows={3}
                    className="focus:border-orange-300"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelProgramForm}
                    disabled={savingProgram}
                  >
                    Odustani
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProgram}
                    disabled={savingProgram}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {savingProgram ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Spremanje...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        {editingProgramId ? 'Spremi promjene' : 'Kreiraj program'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing programs list */}
            {programs.length === 0 && !showProgramForm && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nemate programa. Kliknite &quot;Novi program&quot; za dodavanje.
              </p>
            )}

            {programs.map((program) => (
              <div
                key={program.id}
                className="border rounded-xl p-4 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{program.name}</h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {TRAINING_TYPE_LABELS[program.type] || program.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {program.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{program.duration_weeks} tj.</span>
                      <span>{program.sessions} sesija</span>
                      <span className="font-medium text-orange-600">{program.price} &euro;</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-600"
                      onClick={() => handleEditProgram(program)}
                      disabled={savingProgram || deletingProgramId === program.id}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => handleDeleteProgram(program.id)}
                      disabled={savingProgram || deletingProgramId === program.id}
                    >
                      {deletingProgramId === program.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Wizard for new trainers */}
      {(!trainer.bio || trainer.bio.length < 50 || programs.length === 0) && <TrainerOnboardingWizard />}
    </div>
  );
}
