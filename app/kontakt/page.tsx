'use client';

import { useState } from 'react';
import { Send, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
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
      const supabase = createClient();
      const { error } = await supabase.from('support_tickets').insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast.success('Vaša poruka je uspješno poslana! Odgovorit ćemo vam u najkraćem mogućem roku.');
      setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    } catch {
      toast.error('Greška pri slanju poruke. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="h-4 w-4" />
            Kontakt
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Kako vam možemo pomoći?
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Imate pitanje, prijedlog ili ste primijetili grešku? Javite nam se i odgovorit ćemo u najkraćem roku.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">petparkhr@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm opacity-60">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Telefon</p>
                  <p className="text-sm text-gray-500">+385 91 567 6202</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Adresa</p>
                  <p className="text-sm text-gray-500">Rijeka, Hrvatska</p>
                </div>
              </CardContent>
            </Card>

            <div className="p-5 bg-orange-50 rounded-xl text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Radno vrijeme podrške</p>
              <p>Pon — Sub: 08:00 — 20:00</p>
              <p>Ned: Zatvoreno</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pošaljite nam poruku</CardTitle>
              </CardHeader>
              <CardContent>
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="" disabled>Odaberite temu...</option>
                      {SUBJECT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
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
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white btn-hover"
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
              </CardContent>
            </Card>
          </div>
        </div>
        {/* FAQ sekcija */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Česta pitanja</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              { q: 'Kako se registrirati kao sitter?', a: 'Kliknite "Registracija" i odaberite opciju "Sitter". Ispunite profil, dodajte opis iskustva i postavite cijene za usluge koje nudite.' },
              { q: 'Je li korištenje platforme besplatno?', a: 'Da, registracija i pretraživanje su potpuno besplatni. PetPark naplaćuje proviziju od 10% samo na uspješno obavljene rezervacije.' },
              { q: 'Kako funkcionira plaćanje?', a: 'Plaćanje se vrši sigurno putem Stripe-a. Novac se zadržava dok vlasnik ne potvrdi da je usluga uspješno obavljena.' },
              { q: 'Što ako sitter otkaže rezervaciju?', a: 'U slučaju otkazivanja, vlasnik dobiva potpuni povrat novca. Ponovljena otkazivanja mogu rezultirati suspenzijom sitterovog računa.' },
              { q: 'Kako mogu kontaktirati korisničku podršku?', a: 'Pošaljite nam poruku putem forme iznad ili email na petparkhr@gmail.com svaki dan osim nedjelje, 08-20h.' },
            ].map((faq, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{faq.q}</h3>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
