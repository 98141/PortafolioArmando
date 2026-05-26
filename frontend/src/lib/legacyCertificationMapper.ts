import type { Certification, CertificationCategory } from "@/src/types/certification";
import type { Certification as LegacyCertification } from "@/src/types/portfolio";

const legacyCategoryMap: Record<string, CertificationCategory> = {
  cybersecurity: "cybersecurity",
  development: "software_development",
  cloud: "cloud",
  academic: "other",
};

const legacyStatusMap: Record<string, "active" | "expired" | "archived"> = {
  completed: "active",
  "in-progress": "active",
  planned: "archived",
};

/** Maps Sprint 2 portfolioData Certification → API Certification (fallback only). */
export function mapLegacyCertification(legacy: LegacyCertification): Certification {
  return {
    _id: legacy.id,
    title: legacy.title,
    slug: legacy.id,
    issuer: legacy.issuer,
    credentialId: legacy.credentialId,
    credentialUrl: legacy.url,
    category: legacyCategoryMap[legacy.category] ?? "other",
    skills: [],
    issuedAt: legacy.date ? `${legacy.date}-01-01` : undefined,
    status: legacyStatusMap[legacy.status] ?? "active",
    isFeatured: legacy.status === "completed",
    isActive: true,
    priority: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
