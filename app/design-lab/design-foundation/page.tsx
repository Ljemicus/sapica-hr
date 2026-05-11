import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  Input,
  LeafDecoration,
  PawDecoration,
  PetParkLogo,
  Rating,
  SearchBar,
  Select,
  Tabs,
} from '@/components/shared/petpark/design-foundation';
import { Heart, MapPin } from 'lucide-react';

export default function DesignFoundationPreviewPage() {
  return (
    <main className="min-h-screen bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader />
      <section className="relative mx-auto max-w-[var(--pp-content-width)] overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <LeafDecoration className="right-8 top-24" />
        <PawDecoration className="bottom-16 right-20" />

        <div className="relative z-10 mb-10 max-w-3xl">
          <Badge variant="teal">Design foundation</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-6xl">
            Topao PetPark sustav za marketplace, kalendar i Pet Passport.
          </h1>
          <p className="mt-4 text-lg font-semibold leading-8 text-[color:var(--pp-color-muted-text)]">
            Privremeni preview reusable tokena i komponenti prema Figma frameovima za usluge.
          </p>
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card radius="28" className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <PetParkLogo />
              <div className="flex gap-2">
                <Button>Rezerviraj termin</Button>
                <IconButton aria-label="Spremi uslugu">
                  <Heart className="size-5" />
                </IconButton>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Input placeholder="Ime ljubimca" />
              <Select defaultValue="grooming" aria-label="Vrsta usluge">
                <option value="grooming">Grooming</option>
                <option value="cuvanje">Čuvanje</option>
                <option value="trening">Grupni trening</option>
                <option value="passport">Pet Passport</option>
              </Select>
            </div>
            <SearchBar className="mt-5" />
            <Tabs
              className="mt-5"
              active={1}
              items={[
                { label: 'Marketplace', count: 24 },
                { label: 'Kalendar', count: 8 },
                { label: 'Treninzi' },
                { label: 'Passport' },
              ]}
            />
          </Card>

          <Card tone="sage" radius="24" className="p-6">
            <div className="flex items-start gap-4">
              <Avatar initials="LM" size="lg" />
              <div>
                <Badge variant="success">Provjeren pružatelj</Badge>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">Šetnje uz more Rijeka</h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--pp-color-muted-text)]">
                  <MapPin className="size-4 text-[color:var(--pp-color-teal-accent)]" />
                  Trsat, Pećine, centar
                </p>
                <Rating value={4.9} count={37} className="mt-4" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="orange">Danas dostupno</Badge>
              <Badge variant="info">Pet Passport spremno</Badge>
              <Badge variant="warning">Još 2 termina</Badge>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
