"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { educationService } from "@/src/services/educationService";
import { education as fallbackEducation } from "@/src/data/portfolioData";
import { mapLegacyEducation } from "@/src/lib/legacyEducationMapper";
import type { Education } from "@/src/types/education";
import EducationEntryCard from "@/src/components/portfolio/EducationEntryCard";

export default function EducationPageClient() {
  const [fallback, setFallback] = useState<Education[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-education"],
    queryFn: async () => {
      const result = await educationService.getEducation({ limit: 50 });
      return result.education;
    },
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackEducation.map(mapLegacyEducation));
    }
  }, [isError]);

  const entries = data ?? fallback ?? [];

  return (
    <section className="px-4 pb-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {isError && fallback && (
          <p className="mb-6 text-xs text-amber-200/80" role="status">
            Mostrando datos de respaldo — la API no está disponible en este momento.
          </p>
        )}

        {isLoading && !fallback ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-zinc-500">No hay formación publicada aún.</p>
        ) : (
          <div className="relative space-y-10">
            <div
              className="absolute left-[1.125rem] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/60 via-purple-500/40 to-transparent"
              aria-hidden="true"
            />
            {entries.map((entry) => (
              <article key={entry._id} className="relative pl-12">
                <div className="absolute left-3 top-2 h-4 w-4 rounded-full border-2 border-cyan-400 bg-[#080c18] shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
                <EducationEntryCard entry={entry} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
