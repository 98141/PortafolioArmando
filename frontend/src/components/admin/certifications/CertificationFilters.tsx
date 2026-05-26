"use client";

import { Search } from "lucide-react";
import type { CertificationCategory, CertificationStatus } from "@/src/types/certification";
import {
  certificationCategoryLabels,
  certificationStatusLabels,
} from "@/src/lib/certificationLabels";
import { cn } from "@/src/lib/cn";

export interface CertificationFilterState {
  search: string;
  category: CertificationCategory | "all";
  status: CertificationStatus | "all";
  featured: "all" | "yes" | "no";
  active: "all" | "yes" | "no";
}

interface CertificationFiltersProps {
  filters: CertificationFilterState;
  onChange: (filters: CertificationFilterState) => void;
}

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-amber-500/50";

export default function CertificationFilters({
  filters,
  onChange,
}: CertificationFiltersProps) {
  const update = (partial: Partial<CertificationFilterState>) =>
    onChange({ ...filters, ...partial });

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar título, emisor, credential ID..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className={cn(selectClass, "w-full pl-10")}
            aria-label="Buscar certificaciones"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) =>
            update({ category: e.target.value as CertificationCategory | "all" })
          }
          className={selectClass}
          aria-label="Categoría"
        >
          <option value="all">Todas las categorías</option>
          {(
            Object.entries(certificationCategoryLabels) as [CertificationCategory, string][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) =>
            update({ status: e.target.value as CertificationStatus | "all" })
          }
          className={selectClass}
          aria-label="Estado"
        >
          <option value="all">Todos los estados</option>
          {(
            Object.entries(certificationStatusLabels) as [CertificationStatus, string][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            value={filters.featured}
            onChange={(e) =>
              update({ featured: e.target.value as CertificationFilterState["featured"] })
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
              update({ active: e.target.value as CertificationFilterState["active"] })
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
