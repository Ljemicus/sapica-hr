'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, User, Shield, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { setMockUserClient } from '@/lib/mock-auth-client';
import { mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';

const demoUsers = [
  { id: '99999999-9999-9999-9999-999999999999', name: 'Tomislav Bašić', role: 'owner' as const, city: 'Rijeka', description: 'Vlasnik - ima pse i mačke', icon: User, gradient: 'from-blue-400 to-cyan-300' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Nina Šimunović', role: 'owner' as const, city: 'Zagreb', description: 'Vlasnica - Luna, Whiskers, Buddy', icon: User, gradient: 'from-purple-400 to-pink-300' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Ana Horvat', role: 'sitter' as const, city: 'Rijeka', description: 'Sitter - Superhost, 4.9★', icon: Heart, gradient: 'from-orange-400 to-amber-300' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Filip Matić', role: 'sitter' as const, city: 'Zagreb', description: 'Sitter - kuća s vrtom', icon: Heart, gradient: 'from-green-400 to-emerald-300' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Admin Šapica', role: 'admin' as const, city: 'Zagreb', description: 'Administrator platforme', icon: Shield, gradient: 'from-gray-500 to-gray-400' },
];

const roleLabels = { owner: 'Vlasnik', sitter: 'Sitter', admin: 'Admin' };
const roleColors = {
  owner: 'bg-blue-50 text-blue-700 border-blue-200',
  sitter: 'bg-green-50 text-green-700 border-green-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (userId: string) => {
    setLoading(true);
    setMockUserClient(userId);

    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });

    window.dispatchEvent(new Event('mock-auth-change'));
    toast.success('Uspješna prijava!');

    const user = mockUsers.find(u => u.id === userId);
    const target = user?.role === 'sitter' ? '/dashboard/sitter' :
                   user?.role === 'admin' ? '/admin' :
                   redirect !== '/' ? redirect : '/dashboard/vlasnik';
    router.push(target);
    router.refresh();
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 animate-fade-in-up">
            <PawLogo className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Prijava</h1>
            <p className="text-muted-foreground mt-2">Odaberite demo korisnika za prijavu</p>
          </div>

          <div className="bg-orange-50/50 rounded-xl p-4 mb-6 text-center animate-fade-in-up delay-100">
            <p className="text-sm text-muted-foreground">
              Ovo je demo način rada. Odaberite jednog od korisnika ispod da istražite aplikaciju iz njihove perspektive.
            </p>
          </div>

          <div className="space-y-3">
            {demoUsers.map((demoUser, i) => (
              <button
                key={demoUser.id}
                onClick={() => handleLogin(demoUser.id)}
                disabled={loading}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50/30 transition-all text-left group animate-fade-in-up delay-${(i + 1) * 100}`}
              >
                <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-white shadow-sm">
                  <AvatarFallback className={`bg-gradient-to-br ${demoUser.gradient} text-white font-semibold`}>
                    {demoUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{demoUser.name}</span>
                    <Badge className={`text-xs ${roleColors[demoUser.role]} border`}>{roleLabels[demoUser.role]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{demoUser.description} · {demoUser.city}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nemate račun?{' '}
              <Link href="/registracija" className="text-orange-500 hover:underline font-semibold">
                Registrirajte se
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-amber-400 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.08]" />
        <div className="absolute top-20 -left-20 w-60 h-60 bg-white rounded-full opacity-10" />
        <div className="absolute bottom-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10" />
        <div className="relative text-center text-white p-12 max-w-md">
          <PawLogo className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Dobrodošli natrag!</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Prijavite se i pronađite savršenog čuvara za vašeg ljubimca ili upravljajte svojim sitter profilom.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-white/70">Sittera</p>
            </div>
            <div>
              <p className="text-2xl font-bold">2000+</p>
              <p className="text-sm text-white/70">Rezervacija</p>
            </div>
            <div>
              <p className="text-2xl font-bold">4.8★</p>
              <p className="text-sm text-white/70">Ocjena</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PawLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="14" cy="17.5" rx="4" ry="4.8" />
      <ellipse cx="8.5" cy="10.5" rx="2.3" ry="3.2" />
      <ellipse cx="19.5" cy="10.5" rx="2.3" ry="3.2" />
      <ellipse cx="5.5" cy="16" rx="2" ry="2.8" />
      <ellipse cx="22.5" cy="16" rx="2" ry="2.8" />
    </svg>
  );
}
