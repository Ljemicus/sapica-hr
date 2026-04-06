'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Syringe, 
  AlertTriangle, 
  Pill, 
  Stethoscope, 
  FileText, 
  QrCode, 
  Share2, 
  ChevronLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { format, parseISO, isPast, isFuture, addYears } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { PetPassport, Pet, Vaccination, Allergy, Medication, VetInfo } from '@/lib/types';

interface PetWithPassport extends Pet {
  passport?: PetPassport;
}

const ALLERGY_SEVERITIES = [
  { value: 'blaga', label: 'Blaga', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'umjerena', label: 'Umjerena', color: 'bg-orange-100 text-orange-800' },
  { value: 'ozbiljna', label: 'Ozbiljna', color: 'bg-red-100 text-red-800' },
];

export default function PetPassportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const petId = params.id as string;
  
  const [pet, setPet] = useState<PetWithPassport | null>(null);
  const [passport, setPassport] = useState<PetPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Form states
  const [newVaccination, setNewVaccination] = useState<Partial<Vaccination>>({ name: '', date: '', vet: '', next_date: '' });
  const [newAllergy, setNewAllergy] = useState<Partial<Allergy>>({ name: '', severity: 'blaga', notes: '' });
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({ name: '', dose: '', schedule: '', start_date: '', end_date: null });
  const [vetInfo, setVetInfo] = useState<Partial<VetInfo>>({ name: '', phone: '', address: '', emergency: false });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user || !petId) return;
    loadData();
  }, [user, petId]);

  const loadData = async () => {
    try {
      const [petRes, passportRes] = await Promise.all([
        fetch(`/api/pets/${petId}`),
        fetch(`/api/pet-passport/${petId}`),
      ]);
      
      if (petRes.ok) {
        const petData = await petRes.json();
        setPet(petData);
      }
      
      if (passportRes.ok) {
        const passportData = await passportRes.json();
        setPassport(passportData);
        setVetInfo(passportData.vet_info || {});
        setNotes(passportData.notes || '');
      } else {
        // Create empty passport if not exists
        setPassport({
          pet_id: petId,
          vaccinations: [],
          allergies: [],
          medications: [],
          vet_info: { name: '', phone: '', address: '', emergency: false },
          notes: '',
        });
      }
    } catch {
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const savePassport = async (updates: Partial<PetPassport>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/pet-passport/${petId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setPassport(updated);
        toast.success('Spremljeno!');
        return true;
      }
    } catch {
      toast.error('Greška pri spremanju');
    } finally {
      setSaving(false);
    }
    return false;
  };

  const addVaccination = async () => {
    if (!newVaccination.name || !newVaccination.date) {
      toast.error('Unesite naziv i datum cijepljenja');
      return;
    }
    
    const vaccination: Vaccination = {
      name: newVaccination.name,
      date: newVaccination.date,
      vet: newVaccination.vet || '',
      next_date: newVaccination.next_date || '',
    };
    
    const updated = {
      ...passport,
      vaccinations: [...(passport?.vaccinations || []), vaccination],
    };
    
    if (await savePassport(updated)) {
      setNewVaccination({ name: '', date: '', vet: '', next_date: '' });
    }
  };

  const removeVaccination = async (index: number) => {
    const updated = {
      ...passport,
      vaccinations: passport?.vaccinations?.filter((_, i) => i !== index) || [],
    };
    await savePassport(updated);
  };

  const addAllergy = async () => {
    if (!newAllergy.name) {
      toast.error('Unesite naziv alergije');
      return;
    }
    
    const allergy: Allergy = {
      name: newAllergy.name,
      severity: newAllergy.severity as 'blaga' | 'umjerena' | 'ozbiljna',
      notes: newAllergy.notes || '',
    };
    
    const updated = {
      ...passport,
      allergies: [...(passport?.allergies || []), allergy],
    };
    
    if (await savePassport(updated)) {
      setNewAllergy({ name: '', severity: 'blaga', notes: '' });
    }
  };

  const removeAllergy = async (index: number) => {
    const updated = {
      ...passport,
      allergies: passport?.allergies?.filter((_, i) => i !== index) || [],
    };
    await savePassport(updated);
  };

  const addMedication = async () => {
    if (!newMedication.name || !newMedication.dose) {
      toast.error('Unesite naziv i dozu lijeka');
      return;
    }
    
    const medication: Medication = {
      name: newMedication.name,
      dose: newMedication.dose,
      schedule: newMedication.schedule || '',
      start_date: newMedication.start_date || new Date().toISOString().split('T')[0],
      end_date: newMedication.end_date || null,
    };
    
    const updated = {
      ...passport,
      medications: [...(passport?.medications || []), medication],
    };
    
    if (await savePassport(updated)) {
      setNewMedication({ name: '', dose: '', schedule: '', start_date: '', end_date: null });
    }
  };

  const removeMedication = async (index: number) => {
    const updated = {
      ...passport,
      medications: passport?.medications?.filter((_, i) => i !== index) || [],
    };
    await savePassport(updated);
  };

  const saveVetInfo = async () => {
    await savePassport({
      ...passport,
      vet_info: vetInfo as VetInfo,
    });
  };

  const saveNotes = async () => {
    await savePassport({
      ...passport,
      notes,
    });
  };

  const sharePassport = async () => {
    const shareUrl = `${window.location.origin}/ljubimac/${petId}/passport/share`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link kopiran! Možete podijeliti s veterinarom ili sitterom.');
    } catch {
      toast.error('Greška pri kopiranju linka');
    }
  };

  const getVaccinationStatus = (nextDate: string) => {
    if (!nextDate) return { label: 'Nema datuma', color: 'bg-gray-100 text-gray-800' };
    const date = parseISO(nextDate);
    if (isPast(date)) return { label: 'ISTEKLO', color: 'bg-red-100 text-red-800 border-red-300' };
    if (isFuture(date)) return { label: 'Važeće', color: 'bg-green-100 text-green-800 border-green-300' };
    return { label: 'Ističe danas', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getAllergySeverityStyle = (severity: string) => {
    return ALLERGY_SEVERITIES.find(s => s.value === severity) || ALLERGY_SEVERITIES[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-teal-50/50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-teal-50/50 flex items-center justify-center">
        <p className="text-muted-foreground">Ljubimac nije pronađen</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-teal-50/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-warm-orange to-warm-teal text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">🐾 Pet Passport</h1>
                <p className="text-white/80 text-sm">{pet.name} · {pet.breed || pet.species}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20" onClick={() => setShowQR(true)}>
                <QrCode className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20" onClick={sharePassport}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="vaccinations" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="vaccinations" className="gap-1">
              <Syringe className="h-4 w-4" />
              <span className="hidden sm:inline">Cijepljenja</span>
            </TabsTrigger>
            <TabsTrigger value="allergies" className="gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alergije</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-1">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Lijekovi</span>
            </TabsTrigger>
            <TabsTrigger value="vet" className="gap-1">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Veterinar</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Bilješke</span>
            </TabsTrigger>
          </TabsList>

          {/* Vaccinations */}
          <TabsContent value="vaccinations" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-warm-orange" />
                    Cijepljenja
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger>
                      <Button size="sm" className="bg-warm-orange hover:bg-warm-orange/90">
                        <Plus className="h-4 w-4 mr-1" /> Dodaj
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo cijepljenje</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Naziv cjepiva *</Label>
                          <Input 
                            placeholder="npr. Rabies, DHPP, Bordetella..."
                            value={newVaccination.name}
                            onChange={(e) => setNewVaccination({...newVaccination, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Datum cijepljenja *</Label>
                          <Input 
                            type="date"
                            value={newVaccination.date}
                            onChange={(e) => setNewVaccination({...newVaccination, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Veterinar</Label>
                          <Input 
                            placeholder="Ime veterinara ili klinike"
                            value={newVaccination.vet}
                            onChange={(e) => setNewVaccination({...newVaccination, vet: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Sljedeće cijepljenje</Label>
                          <Input 
                            type="date"
                            value={newVaccination.next_date}
                            onChange={(e) => setNewVaccination({...newVaccination, next_date: e.target.value})}
                          />
                        </div>
                        <Button onClick={addVaccination} className="w-full bg-warm-orange hover:bg-warm-orange/90" disabled={saving}>
                          {saving ? 'Spremanje...' : 'Spremi cijepljenje'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {passport?.vaccinations?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nema zapisanih cijepljenja</p>
                ) : (
                  <div className="space-y-3">
                    {passport?.vaccinations?.map((vax, index) => {
                      const status = getVaccinationStatus(vax.next_date);
                      return (
                        <div key={index} className="flex items-start justify-between p-4 bg-muted/50 rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{vax.name}</h4>
                              <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {format(parseISO(vax.date), 'd. MMMM yyyy.', { locale: hr })}
                            </p>
                            {vax.vet && <p className="text-sm text-muted-foreground">Vet: {vax.vet}</p>}
                            {vax.next_date && (
                              <p className={`text-sm mt-1 ${isPast(parseISO(vax.next_date)) ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                <Clock className="h-3 w-3 inline mr-1" />
                                Sljedeće: {format(parseISO(vax.next_date), 'd. MMMM yyyy.', { locale: hr })}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => removeVaccination(index)}>
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

          {/* Allergies */}
          <TabsContent value="allergies" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Alergije
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger>
                      <Button size="sm" className="bg-warm-orange hover:bg-warm-orange/90">
                        <Plus className="h-4 w-4 mr-1" /> Dodaj
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova alergija</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Alergen *</Label>
                          <Input 
                            placeholder="npr. Piletina, pelud, krpelji..."
                            value={newAllergy.name}
                            onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Ozbiljnost</Label>
                          <Select value={newAllergy.severity} onValueChange={(v) => setNewAllergy({...newAllergy, severity: v as 'blaga' | 'umjerena' | 'ozbiljna'})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ALLERGY_SEVERITIES.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Bilješke</Label>
                          <Input 
                            placeholder="Simptomi, liječenje..."
                            value={newAllergy.notes}
                            onChange={(e) => setNewAllergy({...newAllergy, notes: e.target.value})}
                          />
                        </div>
                        <Button onClick={addAllergy} className="w-full bg-warm-orange hover:bg-warm-orange/90" disabled={saving}>
                          {saving ? 'Spremanje...' : 'Spremi alergiju'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {passport?.allergies?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nema zapisanih alergija</p>
                ) : (
                  <div className="space-y-3">
                    {passport?.allergies?.map((allergy, index) => {
                      const severity = getAllergySeverityStyle(allergy.severity);
                      return (
                        <div key={index} className="flex items-start justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{allergy.name}</h4>
                              <Badge className={severity.color}>{severity.label}</Badge>
                            </div>
                            {allergy.notes && <p className="text-sm text-muted-foreground">{allergy.notes}</p>}
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => removeAllergy(index)}>
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

          {/* Medications */}
          <TabsContent value="medications" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    Lijekovi
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger>
                      <Button size="sm" className="bg-warm-orange hover:bg-warm-orange/90">
                        <Plus className="h-4 w-4 mr-1" /> Dodaj
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novi lijek</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Naziv lijeka *</Label>
                          <Input 
                            placeholder="npr. Rimadyl, Frontline..."
                            value={newMedication.name}
                            onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Doza *</Label>
                          <Input 
                            placeholder="npr. 1 tableta, 5ml..."
                            value={newMedication.dose}
                            onChange={(e) => setNewMedication({...newMedication, dose: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Raspored</Label>
                          <Input 
                            placeholder="npr. 2x dnevno, svakih 8h..."
                            value={newMedication.schedule}
                            onChange={(e) => setNewMedication({...newMedication, schedule: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Početak terapije</Label>
                          <Input 
                            type="date"
                            value={newMedication.start_date}
                            onChange={(e) => setNewMedication({...newMedication, start_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Kraj terapije (ostavi prazno ako je kontinuirano)</Label>
                          <Input 
                            type="date"
                            value={newMedication.end_date || ''}
                            onChange={(e) => setNewMedication({...newMedication, end_date: e.target.value || null})}
                          />
                        </div>
                        <Button onClick={addMedication} className="w-full bg-warm-orange hover:bg-warm-orange/90" disabled={saving}>
                          {saving ? 'Spremanje...' : 'Spremi lijek'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {passport?.medications?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nema zapisanih lijekova</p>
                ) : (
                  <div className="space-y-3">
                    {passport?.medications?.map((med, index) => (
                      <div key={index} className="flex items-start justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="flex-1">
                          <h4 className="font-semibold">{med.name}</h4>
                          <p className="text-sm text-muted-foreground">Doza: {med.dose}</p>
                          {med.schedule && <p className="text-sm text-muted-foreground">Raspored: {med.schedule}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            Od: {format(parseISO(med.start_date), 'd.M.yyyy.')}
                            {med.end_date && ` do ${format(parseISO(med.end_date), 'd.M.yyyy.')}`}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => removeMedication(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vet Info */}
          <TabsContent value="vet" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-warm-teal" />
                  Veterinar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Ime veterinara / klinike</Label>
                  <Input 
                    value={vetInfo.name}
                    onChange={(e) => setVetInfo({...vetInfo, name: e.target.value})}
                    placeholder="npr. VetCentar Zagreb"
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input 
                    value={vetInfo.phone}
                    onChange={(e) => setVetInfo({...vetInfo, phone: e.target.value})}
                    placeholder="+385 1 123 4567"
                  />
                </div>
                <div>
                  <Label>Adresa</Label>
                  <Input 
                    value={vetInfo.address}
                    onChange={(e) => setVetInfo({...vetInfo, address: e.target.value})}
                    placeholder="Ulica i broj, grad"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={vetInfo.emergency}
                    onCheckedChange={(checked) => setVetInfo({...vetInfo, emergency: checked})}
                  />
                  <Label>Hitna služba (24/7)</Label>
                </div>
                <Button onClick={saveVetInfo} className="w-full bg-warm-orange hover:bg-warm-orange/90" disabled={saving}>
                  {saving ? 'Spremanje...' : 'Spremi podatke'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-warm-coral" />
                  Bilješke
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ovdje možete zapisati bilo koje dodatne informacije o svom ljubimcu..."
                  className="w-full min-h-[200px] p-4 rounded-xl border bg-white resize-none focus:ring-2 focus:ring-warm-orange/20 focus:border-warm-orange"
                />
                <Button onClick={saveNotes} className="w-full bg-warm-orange hover:bg-warm-orange/90" disabled={saving}>
                  {saving ? 'Spremanje...' : 'Spremi bilješke'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Kod - {pet.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="bg-white p-6 rounded-xl shadow-inner">
              {/* Simple QR-like pattern */}
              <div className="w-48 h-48 bg-gradient-to-br from-warm-orange to-warm-teal rounded-xl flex items-center justify-center text-white">
                <div className="text-center">
                  <QrCode className="h-16 w-16 mx-auto mb-2" />
                  <p className="text-xs opacity-80">Scan for passport</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Skenirajte QR kod za brzi pristup zdravstvenom kartonu
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              URL: {typeof window !== 'undefined' ? `${window.location.origin}/ljubimac/${petId}/passport/share` : ''}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
