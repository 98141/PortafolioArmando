"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/src/services/projectService";
import { featuredProjects as fallbackFeatured } from "@/src/data/portfolioData";
import type { Project, ProjectCategory } from "@/src/types/project";
import GlassCard from "@/src/components/ui/GlassCard";
import SectionHeader from "@/src/components/ui/SectionHeader";
import TechBadge from "@/src/components/ui/TechBadge";
import ProjectStatusBadge from "@/src/components/admin/projects/ProjectStatusBadge";
import { projectCategoryLabels } from "@/src/lib/projectLabels";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/src/components/ui/SocialIcons";

function mapLegacyFeatured(): Project[] {
  return fallbackFeatured.map((p) => ({
    _id: p.id,
    title: p.title,
    slug: p.id,
    shortDescription: p.description,
    category: (p.category === "fullstack" ? "fullstack" : "other") as ProjectCategory,
    status: "in_progress" as const,
    technologies: p.stack,
    features: [],
    challenges: [],
    learnings: [],
    links: { demo: p.demoUrl, github: p.repoUrl },
    isFeatured: true,
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export default function FeaturedProjects() {
  const [fallback, setFallback] = useState<Project[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: () => projectService.getFeaturedProjects(6),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(mapLegacyFeatured());
    }
  }, [isError]);

  const projects = data ?? fallback ?? [];
  const showFallbackNote = isError && fallback;

  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Proyectos"
            title="Proyectos destacados"
            description="Soluciones full stack con calidad de producción."
          />
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            Ver todos
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
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <GlassCard key={project._id} as="article" className="flex flex-col p-6" hover>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-100">{project.title}</h3>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <div className="mt-2">
                  <TechBadge
                    label={projectCategoryLabels[project.category]}
                    variant="blue"
                  />
                </div>
                <p className="mt-3 flex-1 text-sm text-zinc-400">
                  {project.shortDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <TechBadge key={tech} label={tech} />
                  ))}
                </div>
                <div className="mt-5 flex gap-3">
                  {project.links?.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Demo
                    </a>
                  )}
                  {project.links?.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-zinc-400"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      Repo
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
