"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Dynamic import for FullCalendar to reduce initial bundle size
const ProfessionalCalendar = dynamic(
  () => import("./professional-calendar").then((mod) => mod.ProfessionalCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

export function LazyCalendar() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfessionalCalendar />
    </Suspense>
  );
}
