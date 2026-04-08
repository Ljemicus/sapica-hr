"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2, MapPin } from "lucide-react";
import type { Veterinarian } from "@/lib/db/veterinarian-helpers";

// Dynamic import for Leaflet map to reduce initial bundle size
const VeterinariMapClient = dynamic(
  () => import("./veterinari-map").then((mod) => mod.VeterinariMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Učitavanje karte...</p>
      </div>
    ),
  }
);

interface LazyVeterinariMapProps {
  veterinarians: Veterinarian[];
  selectedCity: string;
}

export function LazyVeterinariMap({ veterinarians, selectedCity }: LazyVeterinariMapProps) {
  return (
    <Suspense
      fallback={
        <div className="h-[500px] w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
          <MapPin className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Pripremanje karte...</p>
        </div>
      }
    >
      <VeterinariMapClient veterinarians={veterinarians} selectedCity={selectedCity} />
    </Suspense>
  );
}
