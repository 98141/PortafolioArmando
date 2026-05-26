"use client";

import { useCallback, useEffect, useState } from "react";
import { cyberLabService } from "@/src/services/cyberLabService";
import { cyberLabs as fallbackLabs } from "@/src/data/portfolioData";
import { mapLegacyCyberLab } from "@/src/lib/legacyCyberLabMapper";
import { cyberLabCategoryFilters } from "@/src/lib/cyberLabLabels";
import type { CyberLab, CyberLabCategory, CyberSeverity } from "@/src/types/cyberLab";
import CyberLabCard from "@/src/components/portfolio/CyberLabCard";
import { cn } from "@/src/lib/cn";

export default function CyberLabsGrid() {
  const [active, setActive] = useState<string>("all");
  const [labs, setLabs] = useState<CyberLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    try {
      const params: {
        category?: CyberLabCategory;
        severity?: CyberSeverity;
        limit: number;
      } = { limit: 50 };
      if (active !== "all") params.category = active as CyberLabCategory;
      const data = await cyberLabService.getCyberLabs(params);
      setLabs(data.labs);
    } catch {
      setUsingFallback(true);
      const legacy = fallbackLabs.map(mapLegacyCyberLab);
      setLabs(
        active === "all"
          ? legacy
          : legacy.filter((l) => l.category === active || l.slug === active)
      );
      setError(
        "No se pudo conectar con la API. Mostrando datos de respaldo locales (portfolioData.ts)."
      );
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  return (
    <>
      {error && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          {error}
          {usingFallback && (
            <span className="mt-1 block text-xs text-amber-200/70">
              Fallback Sprint 2 — portfolioData.ts
            </span>
          )}
        </div>
      )}

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrar laboratorios por categoría"
      >
        {cyberLabCategoryFilters.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active === cat.id}
            onClick={() => setActive(cat.id)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm transition",
              active === cat.id
                ? "border-purple-500/40 bg-purple-500/15 text-purple-200"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {labs.map((lab) => (
            <CyberLabCard key={lab._id} lab={lab} />
          ))}
        </div>
      )}

      {!loading && labs.length === 0 && (
        <p className="mt-8 text-center text-zinc-500">
          No hay security cases en esta categoría.
        </p>
      )}
    </>
  );
}
