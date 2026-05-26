import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/src/components/ui/SocialIcons";
import type { Project } from "@/src/types/project";
import { projectCategoryLabels } from "@/src/lib/projectLabels";
import GlassCard from "@/src/components/ui/GlassCard";
import TechBadge from "@/src/components/ui/TechBadge";
import ProjectStatusBadge from "@/src/components/admin/projects/ProjectStatusBadge";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const year =
    project.completedAt?.slice(0, 4) ||
    project.startedAt?.slice(0, 4) ||
    project.createdAt.slice(0, 4);

  return (
    <GlassCard as="article" className="flex h-full flex-col overflow-hidden" hover>
      {project.image?.url && (
        <div className="relative h-40 w-full border-b border-white/5 bg-white/5">
          <Image
            src={project.image.url}
            alt={project.image.alt || project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-zinc-100">{project.title}</h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <TechBadge label={projectCategoryLabels[project.category]} variant="blue" />
          {project.isFeatured && <TechBadge label="Destacado" variant="cyan" />}
        </div>
        <p className="mt-1 text-xs text-zinc-500">{year}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
          {project.shortDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>
        <div className="mt-5 flex gap-4 border-t border-white/5 pt-4">
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Demo
            </a>
          )}
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              Repositorio
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
