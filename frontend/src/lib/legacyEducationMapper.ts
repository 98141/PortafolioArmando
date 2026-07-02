import type { Education, AcademicLevel } from "@/src/types/education";
import type { EducationEntry as LegacyEducation } from "@/src/types/portfolio";

const inferAcademicLevel = (degree: string): AcademicLevel => {
  const lower = degree.toLowerCase();
  if (lower.includes("maestr") || lower.includes("master")) return "masters";
  if (lower.includes("doctor")) return "doctorate";
  if (lower.includes("especializ")) return "specialization";
  if (lower.includes("bootcamp")) return "bootcamp";
  if (lower.includes("técnico") || lower.includes("tecnico")) return "technical";
  return "undergraduate";
};

/** Maps Sprint 2 portfolioData EducationEntry → API Education (fallback only). */
export function mapLegacyEducation(legacy: LegacyEducation): Education {
  const [startPart, endPart] = legacy.period.split("—").map((s) => s.trim());

  return {
    _id: legacy.id,
    title: legacy.degree,
    slug: legacy.id,
    institution: legacy.institution,
    academicLevel: inferAcademicLevel(legacy.degree),
    fieldOfStudy: legacy.focus,
    description: legacy.focus,
    achievements: legacy.achievements,
    focusAreas: [],
    isCurrent: legacy.status === "in-progress",
    isFeatured: legacy.status === "in-progress",
    isActive: true,
    priority: legacy.status === "in-progress" ? 10 : 100,
    startedAt: startPart ? `${startPart.trim()}-01-01` : undefined,
    completedAt:
      endPart && endPart.toLowerCase() !== "presente"
        ? `${endPart.trim()}-01-01`
        : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
