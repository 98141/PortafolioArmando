"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { educationService } from "@/src/services/educationService";
import { education as fallbackEducation } from "@/src/data/portfolioData";
import { mapLegacyEducation } from "@/src/lib/legacyEducationMapper";
import type { Education } from "@/src/types/education";
import SectionHeader from "@/src/components/ui/SectionHeader";
import EducationEntryCard from "@/src/components/portfolio/EducationEntryCard";

export default function EducationTimeline() {
  const [fallback, setFallback] = useState<Education[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-education"],
    queryFn: () => educationService.getFeaturedEducation(3),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackEducation.map(mapLegacyEducation));
    }
  }, [isError]);

  const entries = data ?? fallback ?? [];
  const showFallbackNote = isError && fallback;

  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Educación"
            title="Trayectoria académica"
            description="Formación formal y especialización técnica."
          />
          <Link
            href="/education"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            Ver detalle
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {showFallbackNote && (
          <p className="mt-4 text-xs text-amber-200/80" role="status">
            Datos de respaldo (API no disponible) — portfolioData.ts
          </p>
        )}

        {isLoading && !fallback ? (
          <div className="mt-10 flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
          </div>
        ) : (
          <div className="relative mt-10">
            <div
              className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent sm:block"
              aria-hidden="true"
            />
            <div className="space-y-8">
              {entries.map((entry, i) => (
                <article key={entry._id} className="relative sm:pl-12">
                  <div className="absolute left-2.5 top-1.5 hidden h-3 w-3 rounded-full border-2 border-cyan-400 bg-[#050508] sm:block" />
                  <EducationEntryCard
                    entry={entry}
                    showAchievements={i === 0 ? 2 : undefined}
                  />
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
