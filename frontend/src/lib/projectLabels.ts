import type { ProjectCategory, ProjectStatus } from "@/src/types/project";

export const projectCategoryLabels: Record<ProjectCategory, string> = {
  fullstack: "Full Stack",
  frontend: "Frontend",
  backend: "Backend",
  ecommerce: "E-Commerce",
  cybersecurity: "Ciberseguridad",
  appsec: "AppSec",
  devops: "DevOps",
  other: "Otro",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planned: "Planificado",
  in_progress: "En progreso",
  completed: "Completado",
  archived: "Archivado",
};

export const projectCategoryFilters = [
  { id: "all", label: "Todos" },
  ...(
    Object.entries(projectCategoryLabels) as [ProjectCategory, string][]
  ).map(([id, label]) => ({ id, label })),
];

export const projectStatusFilters = [
  { id: "all", label: "Todos" },
  ...(
    Object.entries(projectStatusLabels) as [ProjectStatus, string][]
  ).map(([id, label]) => ({ id, label })),
];
