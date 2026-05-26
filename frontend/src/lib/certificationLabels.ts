import type { CertificationCategory, CertificationStatus } from "@/src/types/certification";

export const certificationCategoryLabels: Record<CertificationCategory, string> = {
  cybersecurity: "Ciberseguridad",
  software_development: "Desarrollo de software",
  devops: "DevOps",
  cloud: "Cloud",
  networking: "Redes",
  database: "Bases de datos",
  programming: "Programación",
  appsec: "AppSec",
  compliance: "Compliance",
  other: "Otro",
};

export const certificationStatusLabels: Record<CertificationStatus, string> = {
  active: "Activa",
  expired: "Expirada",
  archived: "Archivada",
};

export const certificationStatusVariants: Record<
  CertificationStatus,
  "status" | "cyan" | "default"
> = {
  active: "status",
  expired: "default",
  archived: "default",
};
