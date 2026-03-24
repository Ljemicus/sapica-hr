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

          {/* Social Login */}
          <div className="space-y-3 animate-fade-in-up delay-100">
            <button
              onClick={() => toast.info('Apple Sign In će biti dostupan uskoro!')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Nastavi s Apple
            </button>
            <button
              onClick={() => toast.info('Google prijava će biti dostupna uskoro!')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl border-2 border-gray-200 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Nastavi s Google
            </button>
            <button
              onClick={() => toast.info('Facebook prijava će biti dostupna uskoro!')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-[#1877F2] text-white font-medium hover:bg-[#166FE5] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Nastavi s Facebook
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-muted-foreground">ili odaberi demo korisnika</span></div>
          </div>

          <div className="space-y-3">
            {demoUsers.map((demoUser, i) => (
              <button
                key={demoUser.id}
                onClick={() => handleLogin(demoUser.id)}
                disabled={loading}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-orange-400 hover:bg-orange-50/40 hover:shadow-md hover:shadow-orange-100/50 transition-all duration-200 text-left group animate-fade-in-up delay-${(i + 1) * 100}`}
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
