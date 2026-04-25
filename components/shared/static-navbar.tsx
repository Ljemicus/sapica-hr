import Link from 'next/link';

function PawIcon() {
  return (
    <svg className="h-7 w-7 text-orange-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
    </svg>
  );
}

const navItems = [
  { href: '/pretraga', label: 'Pretraga' },
  { href: '/blog', label: 'Blog' },
  { href: '/postani-sitter', label: 'Postani sitter' },
];

export function StaticNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link prefetch={false} href="/" className="flex items-center gap-2 font-extrabold text-xl" aria-label="PetPark početna">
          <PawIcon />
          <span>PetPark</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex" aria-label="Glavna navigacija">
          {navItems.map((item) => (
            <Link key={item.href} prefetch={false} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link prefetch={false} href="/pretraga" className="inline-flex items-center gap-2 rounded-full bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800">
          Pretraži
        </Link>
      </div>
    </header>
  );
}
