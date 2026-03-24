'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, User, LogOut, Search, PawPrint, FileHeart, Scissors, GraduationCap, BookOpen, ChevronDown, MessageSquare, AlertTriangle } from 'lucide-react';
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
import { clearMockUserClient } from '@/lib/mock-auth-client';
import { mockPets } from '@/lib/mock-data';

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

export function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    clearMockUserClient();
    window.dispatchEvent(new Event('mock-auth-change'));
    router.push('/');
    router.refresh();
  };

  const dashboardLink = user?.role === 'sitter' ? '/dashboard/sitter' : user?.role === 'admin' ? '/admin' : '/dashboard/vlasnik';

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? 'bg-white shadow-md border-b border-gray-100 h-14'
        : 'bg-white border-b border-gray-100 h-16'
    }`}>
      <div className="container mx-auto flex items-center justify-between px-4 h-full">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <PawLogo className="h-7 w-7 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-orange-500 tracking-tight">Šapica</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button />} className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1">
              Usluge <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem render={<Link href="/pretraga" />} className="cursor-pointer">
                <Search className="mr-2 h-4 w-4" />
                Sitteri
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/njega" />} className="cursor-pointer">
                <Scissors className="mr-2 h-4 w-4" />
                Grooming
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dresura" />} className="cursor-pointer">
                <GraduationCap className="mr-2 h-4 w-4" />
                Dresura
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/zajednica" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Blog
          </Link>
          <Link href="/forum" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Forum
          </Link>
          <Link href="/izgubljeni" className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 relative">
            <AlertTriangle className="h-4 w-4" />
            Izgubljeni 🚨
            <span className="absolute -top-1 -right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
            <div className="flex items-center gap-2">
              <Link href="/poruke">
                <Button variant="ghost" size="icon" className="relative hover:bg-orange-50 hover:text-orange-500">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-orange-100 hover:ring-orange-300 transition-all" />}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">
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
                  {user.role === 'owner' && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><PawPrint className="h-3 w-3" /> Moji ljubimci</p>
                      </div>
                      {mockPets.filter(p => p.owner_id === user.id).map(pet => (
                        <DropdownMenuItem key={pet.id} render={<Link href={`/ljubimac/${pet.id}/karton`} />} className="cursor-pointer">
                            <FileHeart className="mr-2 h-4 w-4" />
                            {pet.name} — karton
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
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
                <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600">Prijava</Button>
              </Link>
              <Link href="/registracija">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200/50 btn-hover">Registracija</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center gap-2 md:hidden">
          {!loading && !user && (
            <Link href="/prijava">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 h-8">
                Prijava
              </Button>
            </Link>
          )}
          {user && (
            <Link href="/poruke">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </Link>
          )}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden">
              <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-4 mt-8">
              {user && (
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-12 w-12 ring-2 ring-orange-100">
                    <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              <Link href="/pretraga" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                <Search className="h-5 w-5" />
                Pretraži sittere
              </Link>
              <Link href="/njega" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                <Scissors className="h-5 w-5" />
                Grooming
              </Link>
              <Link href="/dresura" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                <GraduationCap className="h-5 w-5" />
                Dresura
              </Link>
              <Link href="/zajednica" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                <BookOpen className="h-5 w-5" />
                Blog
              </Link>
              <Link href="/forum" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                <MessageSquare className="h-5 w-5" />
                Forum
              </Link>
              <Link href="/izgubljeni" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-red-500 hover:text-red-600 font-semibold transition-colors">
                <AlertTriangle className="h-5 w-5" />
                Izgubljeni 🚨
              </Link>
              {user ? (
                <>
                  <Link href={dashboardLink} onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                    <User className="h-5 w-5" />
                    Nadzorna ploča
                  </Link>
                  <Link href="/poruke" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-orange-500 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    Poruke
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="flex items-center gap-3 py-2.5 text-red-600 hover:text-red-700 transition-colors">
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
      </div>
    </header>
  );
}
