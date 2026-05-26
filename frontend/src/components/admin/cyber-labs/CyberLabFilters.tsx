"use client";

import { Search } from "lucide-react";
import type { CyberLabCategory, CyberLabStatus, CyberSeverity } from "@/src/types/cyberLab";
import {
  cyberLabCategoryLabels,
  cyberLabStatusLabels,
  cyberSeverityLabels,
} from "@/src/lib/cyberLabLabels";
import { cn } from "@/src/lib/cn";

export interface CyberLabFilterState {
  search: string;
  category: CyberLabCategory | "all";
  severity: CyberSeverity | "all";
  status: CyberLabStatus | "all";
  featured: "all" | "yes" | "no";
  active: "all" | "yes" | "no";
}

interface CyberLabFiltersProps {
  filters: CyberLabFilterState;
  onChange: (filters: CyberLabFilterState) => void;
}

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500/50";

export default function CyberLabFilters({ filters, onChange }: CyberLabFiltersProps) {
  const update = (partial: Partial<CyberLabFilterState>) =>
    onChange({ ...filters, ...partial });

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="grid gap-4 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar labs, tools, hallazgos..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className={cn(selectClass, "w-full pl-10")}
            aria-label="Buscar labs"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) =>
            update({ category: e.target.value as CyberLabCategory | "all" })
          }
          className={selectClass}
          aria-label="Categoría"
        >
          <option value="all">Todas las categorías</option>
          {(Object.entries(cyberLabCategoryLabels) as [CyberLabCategory, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <select
          value={filters.severity}
          onChange={(e) =>
            update({ severity: e.target.value as CyberSeverity | "all" })
          }
          className={selectClass}
          aria-label="Severidad"
        >
          <option value="all">Todas las severidades</option>
          {(Object.entries(cyberSeverityLabels) as [CyberSeverity, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value as CyberLabStatus | "all" })}
          className={selectClass}
          aria-label="Estado"
        >
          <option value="all">Todos los estados</option>
          {(Object.entries(cyberLabStatusLabels) as [CyberLabStatus, string][]).map(
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
              update({ featured: e.target.value as CyberLabFilterState["featured"] })
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
              update({ active: e.target.value as CyberLabFilterState["active"] })
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
