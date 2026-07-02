"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { certificationService } from "@/src/services/certificationService";
import { featuredCertifications as fallbackFeatured } from "@/src/data/portfolioData";
import { mapLegacyCertification } from "@/src/lib/legacyCertificationMapper";
import type { Certification } from "@/src/types/certification";
import SectionHeader from "@/src/components/ui/SectionHeader";
import CertificationCard from "@/src/components/portfolio/CertificationCard";

export default function CertificationsPreview() {
  const [fallback, setFallback] = useState<Certification[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-certifications"],
    queryFn: () => certificationService.getFeaturedCertifications(4),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackFeatured.map(mapLegacyCertification));
    }
  }, [isError]);

  const certifications = data ?? fallback ?? [];
  const showFallbackNote = isError && fallback;

  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Formación"
            title="Certificaciones"
            description="Aprendizaje continuo en desarrollo y seguridad."
          />
          <Link
            href="/certifications"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            Ver todas
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
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {certifications.map((cert) => (
              <CertificationCard key={cert._id} certification={cert} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
