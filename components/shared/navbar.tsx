'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, MessageCircle, User, LogOut, Search, PawPrint, FileHeart, Scissors, GraduationCap, BookOpen, ChevronDown, MessageSquare, AlertTriangle, MapPin, Camera, Heart, ShoppingBag, ShoppingCart } from 'lucide-react';
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
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/lib/cart-context';

function PawLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none">
      {/* Heart */}
      <path d="M256 390 C 150 310 90 230 130 170 C 170 110 230 130 256 180 C 282 130 342 110 382 170 C 422 230 362 310 256 390Z" fill="#FFB347"/>
      {/* Paw - teal */}
      <ellipse cx="256" cy="290" rx="40" ry="35" fill="#14b8a6"/>
      <ellipse cx="225" cy="245" rx="16" ry="20" fill="#14b8a6" transform="rotate(-15 225 245)"/>
      <ellipse cx="256" cy="235" rx="15" ry="18" fill="#14b8a6"/>
      <ellipse cx="287" cy="242" rx="15" ry="18" fill="#14b8a6" transform="rotate(10 287 242)"/>
      <ellipse cx="305" cy="262" rx="14" ry="17" fill="#14b8a6" transform="rotate(25 305 262)"/>
    </svg>
  );
}

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { getItemCount } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const dashboardLink = user?.role === 'sitter' ? '/dashboard/sitter' : user?.role === 'admin' ? '/admin' : '/dashboard/vlasnik';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-strong shadow-sm border-b border-border/50 h-14'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent h-16'
      }`}
      role="banner"
    >
      <div className="container mx-auto flex items-center justify-between px-4 h-full">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl group" aria-label="PetPark početna">
          <div className="relative">
            <PawLogo className="h-10 w-10 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="font-[var(--font-heading)] tracking-tight">
            <span className="text-orange-500">Pet</span><span className="text-teal-600 dark:text-teal-400">Park</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Glavna navigacija">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button />} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-accent">
              Usluge <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-xl">
              <DropdownMenuItem render={<Link href="/pretraga" />} className="cursor-pointer rounded-lg">
                <Search className="mr-2 h-4 w-4 text-orange-500" />
                Sitteri
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/njega" />} className="cursor-pointer rounded-lg">
                <Scissors className="mr-2 h-4 w-4 text-pink-500" />
                Grooming
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dresura" />} className="cursor-pointer rounded-lg">
                <GraduationCap className="mr-2 h-4 w-4 text-indigo-500" />
                Dresura
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/setnja/walk1111-1111-1111-1111-111111111111" />} className="cursor-pointer rounded-lg">
                <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                GPS Tracking šetnji
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/azuriranja/book1111-1111-1111-1111-111111111111" />} className="cursor-pointer rounded-lg">
                <Camera className="mr-2 h-4 w-4 text-blue-500" />
                Foto ažuriranja
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/ljubimac/pet11111-1111-1111-1111-111111111111/karton" />} className="cursor-pointer rounded-lg">
                <Heart className="mr-2 h-4 w-4 text-rose-500" />
                Zdravstveni karton
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent">
            <ShoppingBag className="h-4 w-4" />
            Shop
          </Link>
          <Link href="/zajednica" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent">
            <BookOpen className="h-4 w-4" />
            Blog
          </Link>
          <Link href="/forum" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent">
            <MessageSquare className="h-4 w-4" />
            Forum
          </Link>
          <Link href="/izgubljeni" className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 relative">
            <AlertTriangle className="h-4 w-4" />
            Izgubljeni
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </Link>
          {!user && (
            <Link href="/registracija?role=sitter" className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/20">
              Postani sitter
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/kontakt">
            <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl" aria-label="Pomoć">
              <MessageCircle className="h-5 w-5 text-orange-500" />
            </Button>
          </Link>
          <Link href="/shop/kosarica">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-xl" aria-label="Košarica">
              <ShoppingCart className="h-5 w-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {getItemCount() > 99 ? '99+' : getItemCount()}
                </span>
              )}
            </Button>
          </Link>
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-1">
              <Link href="/poruke">
                <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-xl" aria-label="Poruke">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-orange-200 dark:ring-orange-800 hover:ring-orange-400 dark:hover:ring-orange-600 transition-all" />}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-teal-400 text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <div className="flex items-center gap-2 p-3">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href={dashboardLink} />} className="cursor-pointer rounded-lg">
                      <User className="mr-2 h-4 w-4" />
                      Nadzorna ploča
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/poruke" />} className="cursor-pointer rounded-lg">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Poruke
                  </DropdownMenuItem>
                  {user.role === 'owner' && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><PawPrint className="h-3 w-3" /> Moji ljubimci</p>
                      </div>
                      <DropdownMenuItem render={<Link href="/dashboard/vlasnik" />} className="cursor-pointer rounded-lg">
                          <FileHeart className="mr-2 h-4 w-4" />
                          Pogledaj ljubimce
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    Odjavi se
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/prijava">
                <Button variant="ghost" size="sm" className="hover:bg-accent rounded-lg">Prijava</Button>
              </Link>
              <Link href="/registracija">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30 btn-hover rounded-lg font-semibold">Registracija</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav — hamburger + sheet */}
        <div className="flex items-center gap-1.5 md:hidden">
          <Link href="/kontakt">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent rounded-xl" aria-label="Pomoć">
              <MessageCircle className="h-4.5 w-4.5 text-orange-500" />
            </Button>
          </Link>
          <Link href="/shop/kosarica">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent rounded-xl" aria-label="Košarica">
              <ShoppingCart className="h-4.5 w-4.5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {getItemCount() > 99 ? '99+' : getItemCount()}
                </span>
              )}
            </Button>
          </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden rounded-xl" aria-label="Otvori izbornik">
              <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <div className="flex flex-col h-full">
              {/* Sheet header */}
              <div className="p-5 border-b border-border/50">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800">
                      <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-teal-400 text-white font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <PawLogo className="h-9 w-9 text-orange-500" />
                    <span className="font-extrabold text-lg">
                      <span className="text-orange-500">Pet</span><span className="text-teal-600 dark:text-teal-400">Park</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Sheet links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Usluge</p>
                <Link href="/pretraga" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <Search className="h-5 w-5 text-orange-500" />
                  Pretraži sittere
                </Link>
                <Link href="/njega" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <Scissors className="h-5 w-5 text-pink-500" />
                  Grooming
                </Link>
                <Link href="/dresura" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <GraduationCap className="h-5 w-5 text-indigo-500" />
                  Dresura
                </Link>

                <div className="border-t border-border/50 my-3" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Značajke</p>
                <Link href="/setnja/walk1111-1111-1111-1111-111111111111" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  GPS Tracking šetnji
                </Link>
                <Link href="/azuriranja/book1111-1111-1111-1111-111111111111" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <Camera className="h-5 w-5 text-blue-500" />
                  Foto ažuriranja
                </Link>
                <Link href="/ljubimac/pet11111-1111-1111-1111-111111111111/karton" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Zdravstveni karton
                </Link>

                <div className="border-t border-border/50 my-3" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Zajednica</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <ShoppingBag className="h-5 w-5 text-amber-500" />
                  Shop
                </Link>
                <Link href="/zajednica" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Blog
                </Link>
                <Link href="/forum" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                  <MessageSquare className="h-5 w-5 text-teal-500" />
                  Forum
                </Link>
                <Link href="/izgubljeni" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition-colors">
                  <AlertTriangle className="h-5 w-5" />
                  Izgubljeni ljubimci
                </Link>

                {user && (
                  <>
                    <div className="border-t border-border/50 my-3" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Račun</p>
                    <Link href={dashboardLink} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                      <User className="h-5 w-5 text-orange-500" />
                      Nadzorna ploča
                    </Link>
                    <Link href="/poruke" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      Poruke
                    </Link>
                    <button onClick={() => { handleLogout(); setOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left">
                      <LogOut className="h-5 w-5" />
                      Odjavi se
                    </button>
                  </>
                )}
              </div>

              {/* Sheet footer */}
              {!user && (
                <div className="p-4 border-t border-border/50 space-y-2">
                  <Link href="/prijava" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">Prijava</Button>
                  </Link>
                  <Link href="/registracija" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold">Registracija</Button>
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
