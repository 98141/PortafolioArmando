"use client";

import { Search } from "lucide-react";
import type { ProjectCategory, ProjectStatus } from "@/src/types/project";
import { projectCategoryLabels, projectStatusLabels } from "@/src/lib/projectLabels";
import { cn } from "@/src/lib/cn";

export interface ProjectFilterState {
  search: string;
  category: ProjectCategory | "all";
  status: ProjectStatus | "all";
  featured: "all" | "yes" | "no";
  active: "all" | "yes" | "no";
}

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onChange: (filters: ProjectFilterState) => void;
}

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50";

export default function ProjectFilters({ filters, onChange }: ProjectFiltersProps) {
  const update = (partial: Partial<ProjectFilterState>) =>
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
            placeholder="Buscar por título, descripción, tech..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className={cn(selectClass, "w-full pl-10")}
            aria-label="Buscar proyectos"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) =>
            update({ category: e.target.value as ProjectCategory | "all" })
          }
          className={selectClass}
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          {(Object.entries(projectCategoryLabels) as [ProjectCategory, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value as ProjectStatus | "all" })}
          className={selectClass}
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          {(Object.entries(projectStatusLabels) as [ProjectStatus, string][]).map(
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
              update({ featured: e.target.value as ProjectFilterState["featured"] })
            }
            className={cn(selectClass, "flex-1")}
            aria-label="Filtrar destacados"
          >
            <option value="all">Destacados</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
          <select
            value={filters.active}
            onChange={(e) =>
              update({ active: e.target.value as ProjectFilterState["active"] })
            }
            className={cn(selectClass, "flex-1")}
            aria-label="Filtrar activos"
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
