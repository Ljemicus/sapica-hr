import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <span className="text-2xl">🐾</span>
              <span className="text-orange-400">Šapica</span>
            </Link>
            <p className="text-sm text-gray-400">
              Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu.
              Vaš ljubimac zaslužuje najbolju brigu.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Šapica</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pretraga" className="hover:text-orange-400 transition-colors">Pretraži sittere</Link></li>
              <li><Link href="/registracija?role=sitter" className="hover:text-orange-400 transition-colors">Postani sitter</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Kako funkcionira</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Podrška</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Česta pitanja</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Kontakt</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Sigurnost</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Pravne informacije</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Uvjeti korištenja</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Politika privatnosti</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Kolačići</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Šapica. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
}
