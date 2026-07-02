"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { certificationService } from "@/src/services/certificationService";
import { certifications as fallbackCerts } from "@/src/data/portfolioData";
import { mapLegacyCertification } from "@/src/lib/legacyCertificationMapper";
import type { Certification } from "@/src/types/certification";
import CertificationCard from "@/src/components/portfolio/CertificationCard";

export default function CertificationsPageClient() {
  const [fallback, setFallback] = useState<Certification[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-certifications"],
    queryFn: async () => {
      const result = await certificationService.getCertifications({ limit: 50 });
      return result.certifications;
    },
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackCerts.map(mapLegacyCertification));
    }
  }, [isError]);

  const certifications = data ?? fallback ?? [];

  return (
    <section className="px-4 pb-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {isError && fallback && (
          <p className="mb-6 text-xs text-amber-200/80" role="status">
            Mostrando datos de respaldo — la API no está disponible en este momento.
          </p>
        )}

        {isLoading && !fallback ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
          </div>
        ) : certifications.length === 0 ? (
          <p className="text-center text-zinc-500">No hay certificaciones publicadas aún.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {certifications.map((cert) => (
              <CertificationCard key={cert._id} certification={cert} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
