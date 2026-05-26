"use client";

import { useMemo, useState } from "react";
import { cyberLabs, labCategories } from "@/src/data/portfolioData";
import CyberLabCard from "@/src/components/portfolio/CyberLabCard";
import { cn } from "@/src/lib/cn";

export default function CyberLabsGrid() {
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    if (active === "all") return cyberLabs;
    return cyberLabs.filter((l) => l.category === active);
  }, [active]);

  return (
    <>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrar laboratorios por categoría"
      >
        {labCategories.map((cat) => (
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

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {filtered.map((lab) => (
          <CyberLabCard key={lab.id} lab={lab} />
        ))}
      </div>
    </>
  );
}
