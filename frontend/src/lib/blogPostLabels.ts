import type { BlogCategory, BlogStatus } from "@/src/types/blogPost";

export const blogCategoryLabels: Record<BlogCategory, string> = {
  cybersecurity: "Ciberseguridad",
  software_development: "Desarrollo de software",
  appsec: "AppSec",
  devsecops: "DevSecOps",
  web_security: "Web Security",
  forensics: "Forensics",
  cloud_security: "Cloud Security",
  architecture: "Arquitectura",
  backend: "Backend",
  frontend: "Frontend",
  databases: "Bases de datos",
  tutorials: "Tutoriales",
  case_study: "Case Study",
  writeup: "Writeup",
  career: "Carrera",
  other: "Otro",
};

export const blogStatusLabels: Record<BlogStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export const blogStatusVariants: Record<BlogStatus, "status" | "cyan" | "default"> = {
  draft: "default",
  published: "status",
  archived: "default",
};
