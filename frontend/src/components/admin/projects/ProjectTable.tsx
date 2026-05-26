"use client";

import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import type { Project } from "@/src/types/project";
import { projectCategoryLabels } from "@/src/lib/projectLabels";
import ProjectStatusBadge from "@/src/components/admin/projects/ProjectStatusBadge";
import TechBadge from "@/src/components/ui/TechBadge";

interface ProjectTableProps {
  projects: Project[];
  onDelete: (project: Project) => void;
}

export default function ProjectTable({ projects, onDelete }: ProjectTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Proyecto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project._id}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-zinc-100">{project.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{project.slug}</p>
                </td>
                <td className="px-4 py-4">
                  <TechBadge
                    label={projectCategoryLabels[project.category]}
                    variant="blue"
                  />
                </td>
                <td className="px-4 py-4">
                  <ProjectStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-4 text-zinc-300">{project.priority}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.isFeatured && (
                      <TechBadge label="Destacado" variant="cyan" />
                    )}
                    {!project.isActive && (
                      <TechBadge label="Inactivo" variant="purple" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/projects/${project._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-blue-500/40 hover:text-blue-300"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(project)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
