import Link from 'next/link';

function PawIcon() {
  return (
    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
    </svg>
  );
}

const links = [
  { href: '/pretraga', label: 'Pretraga' },
  { href: '/blog', label: 'Blog' },
  { href: '/postani-sitter', label: 'Postani sitter' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/privatnost', label: 'Privatnost' },
  { href: '/uvjeti', label: 'Uvjeti' },
];

export function StaticFooter() {
  return (
    <footer className="border-t border-border/60 bg-slate-950 text-slate-300">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-lg font-extrabold text-white">
              <PawIcon />
              PetPark
            </div>
            <p className="max-w-md text-sm text-slate-400">Pronađite pouzdane sittere, groomere i trenere u svom gradu.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer navigacija">
            {links.map((link) => (
              <Link key={link.href} prefetch={false} href={link.href} className="hover:text-white">{link.label}</Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} PetPark. Sva prava pridržana.</p>
      </div>
    </footer>
  );
}
