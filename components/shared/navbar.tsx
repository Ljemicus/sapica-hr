'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, MessageCircle, User, LogOut, Search, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const dashboardLink = user?.role === 'sitter' ? '/dashboard/sitter' : user?.role === 'admin' ? '/admin' : '/dashboard/vlasnik';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🐾</span>
          <span className="text-orange-500">Šapica</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pretraga" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
            <Search className="h-4 w-4" />
            Pretraži sittere
          </Link>
          {!user && (
            <Link href="/registracija?role=sitter" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
              Postani sitter
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/poruke">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href={dashboardLink} />} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Nadzorna ploča
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/poruke" />} className="cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Poruke
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Odjavi se
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/prijava">
                <Button variant="ghost" size="sm">Prijava</Button>
              </Link>
              <Link href="/registracija">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Registracija</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden">
              <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-4 mt-8">
              {user && (
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              <Link href="/pretraga" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-orange-500">
                <Search className="h-5 w-5" />
                Pretraži sittere
              </Link>
              {user ? (
                <>
                  <Link href={dashboardLink} onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-orange-500">
                    <User className="h-5 w-5" />
                    Nadzorna ploča
                  </Link>
                  <Link href="/poruke" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-orange-500">
                    <MessageCircle className="h-5 w-5" />
                    Poruke
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700">
                    <LogOut className="h-5 w-5" />
                    Odjavi se
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-4">
                  <Link href="/prijava" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Prijava</Button>
                  </Link>
                  <Link href="/registracija" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">Registracija</Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
