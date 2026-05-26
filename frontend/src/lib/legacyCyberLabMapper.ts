import type { CyberLab, CyberLabCategory, CyberSeverity } from "@/src/types/cyberLab";
import type { CyberLab as LegacyCyberLab } from "@/src/types/portfolio";

const legacyCategoryMap: Record<string, CyberLabCategory> = {
  "web-appsec": "web_security",
  forensics: "forensics",
  network: "network_security",
  "cloud-security": "cloud_security",
  "secure-coding": "secure_coding",
};

const legacySeverityMap: Record<string, CyberSeverity> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

/** Maps Sprint 2 portfolioData CyberLab → API CyberLab (fallback only). */
export function mapLegacyCyberLab(legacy: LegacyCyberLab): CyberLab {
  const methodology = legacy.methodology
    ? legacy.methodology.split("→").map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    _id: legacy.id,
    title: legacy.title,
    slug: legacy.id,
    shortDescription: legacy.description,
    category: legacyCategoryMap[legacy.category] ?? "other",
    severity: legacy.severity ? legacySeverityMap[legacy.severity] ?? "medium" : "medium",
    status: "completed",
    methodology,
    tools: legacy.tools,
    findings: legacy.outcome ? [legacy.outcome] : [],
    mitigations: [],
    references: [],
    evidence: [],
    tags: [legacy.focus, "defensive"],
    isFeatured: !!legacy.featured,
    isActive: true,
    priority: legacy.featured ? 10 : 100,
    completedAt: legacy.year ? `${legacy.year}-01-01` : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
