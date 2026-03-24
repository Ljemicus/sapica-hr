'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, User, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { setMockUserClient } from '@/lib/mock-auth-client';
import { mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';

const demoUsers = [
  { id: '99999999-9999-9999-9999-999999999999', name: 'Tomislav Bašić', role: 'owner' as const, city: 'Rijeka', description: 'Vlasnik - ima pse i mačke', icon: User, color: 'bg-blue-100 text-blue-700' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Nina Šimunović', role: 'owner' as const, city: 'Zagreb', description: 'Vlasnica - Luna, Whiskers, Buddy', icon: User, color: 'bg-blue-100 text-blue-700' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Ana Horvat', role: 'sitter' as const, city: 'Rijeka', description: 'Sitter - Superhost, 4.9★', icon: Heart, color: 'bg-green-100 text-green-700' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Filip Matić', role: 'sitter' as const, city: 'Zagreb', description: 'Sitter - kuća s vrtom', icon: Heart, color: 'bg-green-100 text-green-700' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Admin Šapica', role: 'admin' as const, city: 'Zagreb', description: 'Administrator platforme', icon: Shield, color: 'bg-purple-100 text-purple-700' },
];

const roleLabels = { owner: 'Vlasnik', sitter: 'Sitter', admin: 'Admin' };

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (userId: string) => {
    setLoading(true);
    setMockUserClient(userId);

    // Also set via API so server pages can read it
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🐾</div>
          <CardTitle className="text-2xl">Prijava</CardTitle>
          <CardDescription>Odaberite demo korisnika za prijavu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center bg-orange-50 rounded-lg p-3">
            Ovo je demo način rada. Odaberite jednog od korisnika ispod da istražite aplikaciju iz njihove perspektive.
          </p>

          <Separator />

          <div className="space-y-2">
            {demoUsers.map((demoUser) => {
              const Icon = demoUser.icon;
              return (
                <button
                  key={demoUser.id}
                  onClick={() => handleLogin(demoUser.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-left group"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {demoUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{demoUser.name}</span>
                      <Badge className={`text-xs ${demoUser.color}`}>{roleLabels[demoUser.role]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{demoUser.description} · {demoUser.city}</p>
                  </div>
                  <LogIn className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>

          <Separator />

          <p className="text-center text-sm text-muted-foreground">
            Nemate račun?{' '}
            <Link href="/registracija" className="text-orange-500 hover:underline font-medium">
              Registrirajte se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
