"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cyberLabService } from "@/src/services/cyberLabService";
import { featuredLabs as fallbackFeatured } from "@/src/data/portfolioData";
import { mapLegacyCyberLab } from "@/src/lib/legacyCyberLabMapper";
import type { CyberLab } from "@/src/types/cyberLab";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";
import CyberSeverityBadge from "@/src/components/admin/cyber-labs/CyberSeverityBadge";
import { cyberLabCategoryLabels } from "@/src/lib/cyberLabLabels";

export default function CyberLabsPreview() {
  const [fallback, setFallback] = useState<CyberLab[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-cyber-labs"],
    queryFn: () => cyberLabService.getFeaturedCyberLabs(6),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackFeatured.map(mapLegacyCyberLab));
    }
  }, [isError]);

  const labs = data ?? fallback ?? [];
  const showFallbackNote = isError && fallback;

  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Ciberseguridad"
            title="Laboratorios técnicos"
            description="Security cases documentados con enfoque defensivo, metodología rigurosa y remediación priorizada."
          />
          <Link
            href="/cybersecurity"
            className="inline-flex items-center gap-1 text-sm text-purple-400 transition hover:text-purple-300"
          >
            Explorar labs
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
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {labs.map((lab) => (
              <GlassCard key={lab._id} as="article" className="flex flex-col p-6" hover>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-400" aria-hidden="true" />
                    <TechBadge
                      label={cyberLabCategoryLabels[lab.category]}
                      variant="purple"
                    />
                  </div>
                  <CyberSeverityBadge severity={lab.severity} />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-100">{lab.title}</h3>
                <p className="mt-2 flex-1 text-sm text-zinc-400">{lab.shortDescription}</p>
                {lab.findings[0] && (
                  <p className="mt-3 text-xs text-zinc-500 line-clamp-2">
                    <span className="text-zinc-400">Hallazgo:</span> {lab.findings[0]}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {lab.tools.slice(0, 3).map((tool) => (
                    <TechBadge key={tool} label={tool} />
                  ))}
                </div>
                {lab.report?.url && (
                  <a
                    href={lab.report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-purple-400"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Reporte
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
