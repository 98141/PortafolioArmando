"use client";

import { Search } from "lucide-react";
import type { BlogCategory } from "@/src/types/blogPost";
import { blogCategoryLabels } from "@/src/lib/blogPostLabels";
import { cn } from "@/src/lib/cn";

export interface BlogPublicFilterState {
  search: string;
  category: BlogCategory | "all";
  tag: string;
}

interface BlogFiltersProps {
  filters: BlogPublicFilterState;
  availableTags?: string[];
  onChange: (filters: BlogPublicFilterState) => void;
}

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500/50";

export default function BlogFilters({
  filters,
  availableTags = [],
  onChange,
}: BlogFiltersProps) {
  const update = (partial: Partial<BlogPublicFilterState>) =>
    onChange({ ...filters, ...partial });

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar artículos..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className={cn(selectClass, "w-full pl-10")}
            aria-label="Buscar"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value as BlogCategory | "all" })}
          className={selectClass}
          aria-label="Categoría"
        >
          <option value="all">Todas las categorías</option>
          {(Object.entries(blogCategoryLabels) as [BlogCategory, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
        <select
          value={filters.tag}
          onChange={(e) => update({ tag: e.target.value })}
          className={selectClass}
          aria-label="Tag"
        >
          <option value="">Todos los tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
