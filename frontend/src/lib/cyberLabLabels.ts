import type { CyberLabCategory, CyberLabStatus, CyberSeverity } from "@/src/types/cyberLab";

export const cyberLabCategoryLabels: Record<CyberLabCategory, string> = {
  web_security: "Web Security",
  pentesting: "Pentesting",
  forensics: "Forensics",
  malware_analysis: "Malware Analysis",
  network_security: "Network Security",
  appsec: "AppSec",
  devsecops: "DevSecOps",
  secure_coding: "Secure Coding",
  incident_response: "Incident Response",
  threat_detection: "Threat Detection",
  cloud_security: "Cloud Security",
  mobile_security: "Mobile Security",
  other: "Other",
};

export const cyberSeverityLabels: Record<CyberSeverity, string> = {
  informational: "Informational",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const cyberLabStatusLabels: Record<CyberLabStatus, string> = {
  planned: "Planificado",
  in_progress: "En progreso",
  completed: "Completado",
  archived: "Archivado",
};

export const cyberLabCategoryFilters = [
  { id: "all", label: "Todos" },
  ...(Object.entries(cyberLabCategoryLabels) as [CyberLabCategory, string][]).map(
    ([id, label]) => ({ id, label })
  ),
];
