"use client";

import { Search } from "lucide-react";
import type { AcademicLevel } from "@/src/types/education";
import { academicLevelLabels } from "@/src/lib/educationLabels";
import { cn } from "@/src/lib/cn";

export interface EducationFilterState {
  search: string;
  academicLevel: AcademicLevel | "all";
  featured: "all" | "yes" | "no";
  active: "all" | "yes" | "no";
}

interface EducationFiltersProps {
  filters: EducationFilterState;
  onChange: (filters: EducationFilterState) => void;
}

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-cyan-500/50";

export default function EducationFilters({ filters, onChange }: EducationFiltersProps) {
  const update = (partial: Partial<EducationFilterState>) =>
    onChange({ ...filters, ...partial });

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar título, institución, enfoque..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className={cn(selectClass, "w-full pl-10")}
            aria-label="Buscar educación"
          />
        </div>
        <select
          value={filters.academicLevel}
          onChange={(e) =>
            update({ academicLevel: e.target.value as AcademicLevel | "all" })
          }
          className={selectClass}
          aria-label="Nivel académico"
        >
          <option value="all">Todos los niveles</option>
          {(Object.entries(academicLevelLabels) as [AcademicLevel, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <div className="flex gap-2">
          <select
            value={filters.featured}
            onChange={(e) =>
              update({ featured: e.target.value as EducationFilterState["featured"] })
            }
            className={cn(selectClass, "flex-1")}
            aria-label="Destacados"
          >
            <option value="all">Destacados</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
          <select
            value={filters.active}
            onChange={(e) =>
              update({ active: e.target.value as EducationFilterState["active"] })
            }
            className={cn(selectClass, "flex-1")}
            aria-label="Activos"
          >
            <option value="all">Activos</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </div>
  );
}
