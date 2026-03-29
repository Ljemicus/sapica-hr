'use client';

import { useState } from 'react';
import { Send, Mail, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Uspješno ste se pretplatili na newsletter!', {
        description: 'Provjerite svoj email za potvrdu.',
      });
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-orange-500" />
      <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Mail className="h-4 w-4" />
            Newsletter
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 font-[var(--font-heading)]">
            Budite u toku s PetPark novostima
          </h2>
          <p className="text-white/80 mb-6 text-sm md:text-base">
            Primajte savjete za brigu o ljubimcima, posebne ponude i novosti iz zajednice.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Vaš email adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/95 border-0 h-12 rounded-xl text-gray-900 placeholder:text-gray-400 flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-orange-600 hover:bg-white/90 font-bold h-12 px-6 rounded-xl shadow-lg shadow-black/10"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                  Šaljem...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Pretplatite se
                </span>
              )}
            </Button>
          </form>
          <p className="text-white/60 text-xs mt-4">
            Nema spama — samo korisni sadržaj. Odjava u svakom trenutku.
          </p>
        </div>
      </div>
    </section>
  );
}
