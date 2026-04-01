'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  ArrowLeft, Printer, Syringe, AlertTriangle, Pill,
  Stethoscope, FileText, Phone, MapPin, QrCode, Share2, Plus, Pencil, Save, X, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { Pet, PetPassport } from '@/lib/types';

interface Props {
  pet: Pet;
  passport: PetPassport;
  isDemo?: boolean;
}

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐰',
};

const severityColors: Record<string, string> = {
  blaga: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  umjerena: 'bg-orange-100 text-orange-700 border-orange-200',
  ozbiljna: 'bg-red-100 text-red-700 border-red-200',
};

export function PetPassportView({ pet, passport, isDemo = false }: Props) {
  const storageKey = `pet-passport-${pet.id}`;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<PetPassport>(passport);

  useEffect(() => {
    const loadDraft = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setDraft(JSON.parse(saved));
      } catch {}
    };
    loadDraft();
  }, [storageKey]);

  const saveDraft = () => {
    localStorage.setItem(storageKey, JSON.stringify(draft));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      setDraft(saved ? JSON.parse(saved) : passport);
    } catch {
      setDraft(passport);
    }
    setIsEditing(false);
  };

  const addVaccination = () => setDraft({ ...draft, vaccinations: [...draft.vaccinations, { name: '', date: '', vet: '', next_date: '' }] });
  const addAllergy = () => setDraft({ ...draft, allergies: [...draft.allergies, { name: '', severity: 'blaga', notes: '' }] });
  const addMedication = () => setDraft({ ...draft, medications: [...draft.medications, { name: '', dose: '', schedule: '', start_date: '', end_date: null }] });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl print:max-w-none print:p-0">
      <div className="print:hidden">
        <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center shadow-lg text-3xl">
            {speciesEmoji[pet.species] || '🐾'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{pet.name}</h1>
              {isDemo && (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                  <Eye className="h-3.5 w-3.5 mr-1" /> Demo prikaz
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{pet.species === 'dog' ? 'Pas' : pet.species === 'cat' ? 'Mačka' : 'Ostalo'}</span>
              {pet.breed && <><span>•</span><span>{pet.breed}</span></>}
              {pet.age && <><span>•</span><span>{pet.age} god.</span></>}
              {pet.weight && <><span>•</span><span>{pet.weight} kg</span></>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 print:hidden flex-wrap justify-end">
          <Link href={`/ljubimac/${pet.id}/kartica`}>
            <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
              <Share2 className="h-4 w-4 mr-1" /> Kartica
            </Button>
          </Link>
          {!isEditing ? (
            <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Uredi karton
            </Button>
          ) : (
            <>
              <Button variant="outline" className="hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-1" /> Odustani
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={saveDraft}>
                <Save className="h-4 w-4 mr-1" /> Spremi
              </Button>
            </>
          )}
          <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Ispis
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isDemo && (
          <Card className="border-amber-200 bg-amber-50/80 shadow-sm animate-fade-in-up delay-50">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Ovo je demo zdravstveni karton.</p>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    Prikaz služi za demonstraciju funkcionalnosti PetParka. Podaci, šetnje i ažuriranja na ovoj stranici nisu privatni live medicinski zapisi stvarnog korisnika.
                  </p>
                  <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                    Stvarni kartoni ljubimaca dostupni su samo prijavljenim vlasnicima i njihovim odobrenim pružateljima usluga.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><Syringe className="h-4 w-4 text-white" /></div>
              Cijepljenja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Evidencija cjepiva i termina.</p>
              {isEditing && <Button size="sm" variant="outline" onClick={addVaccination}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>}
            </div>
            {draft.vaccinations.length === 0 ? <p className="text-muted-foreground text-sm">Nema zabilježenih cijepljenja.</p> : (
              <div className="space-y-3">
                {draft.vaccinations.map((v, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-xl bg-gray-50">
                    {isEditing ? (
                      <>
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Cjepivo" value={v.name} onChange={(e) => setDraft({ ...draft, vaccinations: draft.vaccinations.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item) })} />
                        <input type="date" className="rounded border px-3 py-2 text-sm" value={v.date} onChange={(e) => setDraft({ ...draft, vaccinations: draft.vaccinations.map((item, idx) => idx === i ? { ...item, date: e.target.value } : item) })} />
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Veterinar" value={v.vet} onChange={(e) => setDraft({ ...draft, vaccinations: draft.vaccinations.map((item, idx) => idx === i ? { ...item, vet: e.target.value } : item) })} />
                        <input type="date" className="rounded border px-3 py-2 text-sm" value={v.next_date} onChange={(e) => setDraft({ ...draft, vaccinations: draft.vaccinations.map((item, idx) => idx === i ? { ...item, next_date: e.target.value } : item) })} />
                      </>
                    ) : (
                      <>
                        <div><p className="text-xs text-muted-foreground">Cjepivo</p><p className="font-medium text-sm">{v.name}</p></div>
                        <div><p className="text-xs text-muted-foreground">Datum</p><p className="text-sm">{v.date ? format(new Date(v.date), 'd. MMM yyyy.', { locale: hr }) : '—'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Veterinar</p><p className="text-sm">{v.vet || '—'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Sljedeći termin</p><p className="text-sm">{v.next_date ? format(new Date(v.next_date), 'd. MMM yyyy.', { locale: hr }) : '—'}</p></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-white" /></div>Alergije</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Alergije i osjetljivosti.</p>
              {isEditing && <Button size="sm" variant="outline" onClick={addAllergy}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>}
            </div>
            {draft.allergies.length === 0 ? <p className="text-muted-foreground text-sm">Nema zabilježenih alergija.</p> : (
              <div className="space-y-3">
                {draft.allergies.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Alergija" value={a.name} onChange={(e) => setDraft({ ...draft, allergies: draft.allergies.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item) })} />
                        <select className="rounded border px-3 py-2 text-sm" value={a.severity} onChange={(e) => setDraft({ ...draft, allergies: draft.allergies.map((item, idx) => idx === i ? { ...item, severity: e.target.value as 'blaga' | 'umjerena' | 'ozbiljna' } : item) })}>
                          <option value="blaga">Blaga</option>
                          <option value="umjerena">Umjerena</option>
                          <option value="ozbiljna">Ozbiljna</option>
                        </select>
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Napomena" value={a.notes} onChange={(e) => setDraft({ ...draft, allergies: draft.allergies.map((item, idx) => idx === i ? { ...item, notes: e.target.value } : item) })} />
                      </div>
                    ) : (
                      <>
                        <Badge className={`${severityColors[a.severity]} border flex-shrink-0`}>{a.severity === 'blaga' ? 'Blaga' : a.severity === 'umjerena' ? 'Umjerena' : 'Ozbiljna'}</Badge>
                        <div><p className="font-medium text-sm">{a.name}</p><p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Pill className="h-4 w-4 text-white" /></div>Lijekovi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Terapije i doziranje.</p>
              {isEditing && <Button size="sm" variant="outline" onClick={addMedication}><Plus className="h-4 w-4 mr-1" /> Dodaj</Button>}
            </div>
            {draft.medications.length === 0 ? <p className="text-muted-foreground text-sm">Nema trenutnih lijekova.</p> : (
              <div className="space-y-3">
                {draft.medications.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 space-y-3">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Naziv lijeka" value={m.name} onChange={(e) => setDraft({ ...draft, medications: draft.medications.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item) })} />
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Doza" value={m.dose} onChange={(e) => setDraft({ ...draft, medications: draft.medications.map((item, idx) => idx === i ? { ...item, dose: e.target.value } : item) })} />
                        <input className="rounded border px-3 py-2 text-sm" placeholder="Raspored" value={m.schedule} onChange={(e) => setDraft({ ...draft, medications: draft.medications.map((item, idx) => idx === i ? { ...item, schedule: e.target.value } : item) })} />
                        <input type="date" className="rounded border px-3 py-2 text-sm" value={m.start_date} onChange={(e) => setDraft({ ...draft, medications: draft.medications.map((item, idx) => idx === i ? { ...item, start_date: e.target.value } : item) })} />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between"><p className="font-medium text-sm">{m.name}</p><Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">{m.dose}</Badge></div>
                        <p className="text-xs text-muted-foreground">{m.schedule}</p>
                        <p className="text-xs text-muted-foreground">Od: {m.start_date ? format(new Date(m.start_date), 'd. MMM yyyy.', { locale: hr }) : '—'}{m.end_date ? ` — Do: ${format(new Date(m.end_date), 'd. MMM yyyy.', { locale: hr })}` : ''}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"><Stethoscope className="h-4 w-4 text-white" /></div>Veterinar</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50">
                <input className="rounded border px-3 py-2 text-sm" placeholder="Naziv veterinara/klinike" value={draft.vet_info.name} onChange={(e) => setDraft({ ...draft, vet_info: { ...draft.vet_info, name: e.target.value } })} />
                <input className="rounded border px-3 py-2 text-sm" placeholder="Telefon" value={draft.vet_info.phone} onChange={(e) => setDraft({ ...draft, vet_info: { ...draft.vet_info, phone: e.target.value } })} />
                <input className="rounded border px-3 py-2 text-sm md:col-span-2" placeholder="Adresa" value={draft.vet_info.address} onChange={(e) => setDraft({ ...draft, vet_info: { ...draft.vet_info, address: e.target.value } })} />
                <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={draft.vet_info.emergency} onChange={(e) => setDraft({ ...draft, vet_info: { ...draft.vet_info, emergency: e.target.checked } })} /> Hitni kontakt</label>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 space-y-2">
                <div className="flex items-center justify-between"><p className="font-medium">{draft.vet_info.name || 'Nije upisano'}</p>{draft.vet_info.emergency && <Badge className="bg-red-100 text-red-700 border border-red-200">Hitni kontakt</Badge>}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" /><a href={`tel:${draft.vet_info.phone}`} className="hover:text-orange-500">{draft.vet_info.phone || '—'}</a></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span>{draft.vet_info.address || '—'}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"><FileText className="h-4 w-4 text-white" /></div>Posebne napomene</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea className="w-full min-h-[140px] rounded-xl border p-4 text-sm" placeholder="Upiši važne napomene o ljubimcu..." value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            ) : (
              <p className="text-sm leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-100">{draft.notes || 'Nema posebnih napomena.'}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm animate-fade-in-up delay-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"><QrCode className="h-4 w-4 text-white" /></div>QR Kod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-white border-2 border-gray-800 rounded-lg p-2 relative">
                <div className="absolute top-2 left-2 w-6 h-6 border-2 border-gray-800 bg-gray-800 rounded-sm" />
                <div className="absolute top-2 right-2 w-6 h-6 border-2 border-gray-800 bg-gray-800 rounded-sm" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-gray-800 bg-gray-800 rounded-sm" />
                <div className="grid grid-cols-5 gap-0.5 absolute inset-0 m-auto w-14 h-14">
                  {Array.from({ length: 25 }, (_, i) => <div key={i} className={`rounded-[1px] ${[0,1,3,5,7,8,10,12,14,16,17,19,21,23,24].includes(i) ? 'bg-gray-800' : 'bg-white'}`} />)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Skenirajte za pristup zdravstvenom kartonu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          nav, footer, .print\:hidden { display: none !important; }
          body { font-size: 12px; }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
