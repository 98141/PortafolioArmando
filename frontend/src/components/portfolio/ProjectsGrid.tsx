"use client";

import { useCallback, useEffect, useState } from "react";
import { projectService } from "@/src/services/projectService";
import { projects as fallbackProjects, projectCategories as legacyCategories } from "@/src/data/portfolioData";
import { projectCategoryFilters } from "@/src/lib/projectLabels";
import type { Project, ProjectCategory } from "@/src/types/project";
import ProjectCard from "@/src/components/portfolio/ProjectCard";
import { cn } from "@/src/lib/cn";

/** Fallback documentado — solo si la API no responde (Sprint 2 mock). */
function mapLegacyToProject(
  p: (typeof fallbackProjects)[0]
): Project {
  return {
    _id: p.id,
    title: p.title,
    slug: p.id,
    shortDescription: p.description,
    category: p.category === "api" || p.category === "automation" || p.category === "security"
      ? "other"
      : (p.category as ProjectCategory),
    status:
      p.status === "in-progress"
        ? "in_progress"
        : p.status === "maintained"
          ? "completed"
          : "completed",
    technologies: p.stack,
    features: [],
    challenges: [],
    learnings: [],
    links: { demo: p.demoUrl, github: p.repoUrl },
    isFeatured: !!p.featured,
    isActive: true,
    priority: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function ProjectsGrid() {
  const [active, setActive] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    try {
      const params =
        active !== "all" ? { category: active as ProjectCategory, limit: 50 } : { limit: 50 };
      const data = await projectService.getProjects(params);
      setProjects(data.projects);
    } catch {
      setUsingFallback(true);
      const legacy = fallbackProjects.map(mapLegacyToProject);
      setProjects(
        active === "all"
          ? legacy
          : legacy.filter((p) => p.category === active || p.slug === active)
      );
      setError(
        "No se pudo conectar con la API. Mostrando datos de respaldo locales."
      );
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filters =
    projectCategoryFilters.length > 1
      ? projectCategoryFilters
      : legacyCategories.map((c) => ({ id: c.id, label: c.label }));

  return (
    <>
      {error && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          {error}
          {usingFallback && (
            <span className="block mt-1 text-xs text-amber-200/70">
              Origen: portfolioData.ts (fallback Sprint 2)
            </span>
          )}
        </div>
      )}

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrar proyectos por categoría"
      >
        {filters.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active === cat.id}
            onClick={() => setActive(cat.id)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm transition",
              active === cat.id
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="mt-8 text-center text-zinc-500">No hay proyectos en esta categoría.</p>
      )}
    </>
  );
}
