'use client';

import { useState } from 'react';
import { Send, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

const SUBJECT_OPTIONS = [
  { value: 'bug', label: 'Prijava greške (Bug)' },
  { value: 'prijedlog', label: 'Prijedlog' },
  { value: 'pitanje', label: 'Pitanje' },
  { value: 'ostalo', label: 'Ostalo' },
];

export default function KontaktPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Molimo ispunite sva polja.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: '' }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Greška pri slanju poruke');
      }

      toast.success('Vaša poruka je uspješno poslana! Odgovorit ćemo vam u najkraćem mogućem roku.');
      setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri slanju poruke. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Hero */}
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">Kontakt</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] leading-[1.05]">
              Kako vam možemo pomoći?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Imate pitanje, prijedlog ili ste primijetili grešku? Javite nam se i odgovorit ćemo u najkraćem roku.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12 max-w-5xl">

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="community-section-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-warm-orange/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-warm-orange" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">info@petpark.hr</p>
                </div>
              </div>
            </div>

            <div className="community-section-card p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-warm-teal/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-warm-teal" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Adresa</p>
                  <p className="text-sm text-muted-foreground">Rijeka, Hrvatska</p>
                </div>
              </div>
            </div>

            <div className="appeal-card p-5 bg-gradient-to-br from-warm-orange/5 to-warm-teal/5">
              <p className="font-medium text-foreground mb-2">Radno vrijeme podrške</p>
              <p className="text-sm text-muted-foreground">Pon — Sub: 08:00 — 20:00</p>
              <p className="text-sm text-muted-foreground">Ned: Zatvoreno</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="community-section-card">
              <div className="p-6 border-b border-border/30">
                <h2 className="text-lg font-semibold font-[var(--font-heading)]">Pošaljite nam poruku</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ime i prezime</Label>
                      <Input
                        id="name"
                        placeholder="Vaše ime"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email adresa</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="vas@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Tema</Label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>option]:bg-background [&>option]:text-foreground"
                    >
                      <option value="" disabled>Odaberite temu...</option>
                      {SUBJECT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" tabIndex={-1} autoComplete="off" value="" onChange={() => {}} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Poruka</Label>
                    <Textarea
                      id="message"
                      placeholder="Opišite svoj upit..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white h-12"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Šaljem...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Pošalji poruku
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* FAQ sekcija */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Česta pitanja</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              { q: 'Kako se registrirati kao sitter?', a: 'Kliknite "Registracija" i odaberite opciju "Sitter". Ispunite profil, dodajte opis iskustva i postavite cijene za usluge koje nudite.' },
              { q: 'Je li korištenje platforme besplatno?', a: 'Da, registracija i pretraživanje su potpuno besplatni. PetPark naplaćuje proviziju od 10% samo na uspješno obavljene rezervacije.' },
              { q: 'Kako funkcionira plaćanje?', a: 'Za rezervacije koristimo siguran checkout kad je plaćanje dostupno za odabranog pružatelja usluge. Ako opcija nije dostupna, jasno ćemo prikazati sljedeći korak.' },
              { q: 'Što ako sitter otkaže rezervaciju?', a: 'Ako pružatelj usluge otkaže, javite se podršci kako bismo pomogli oko sljedećeg koraka i povrata prema važećim pravilima rezervacije.' },
              { q: 'Kako mogu kontaktirati korisničku podršku?', a: 'Pošaljite nam poruku putem forme iznad ili email na info@petpark.hr svaki dan osim nedjelje, 08-20h.' },
            ].map((faq, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-foreground mb-1">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
