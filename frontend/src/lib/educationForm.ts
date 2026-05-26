import type { Education, EducationFormValues } from "@/src/types/education";

export const parseLines = (value: string): string[] =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const joinLines = (items: string[] = []): string => items.join("\n");

export const toDateInput = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const defaultEducationFormValues: EducationFormValues = {
  title: "",
  institution: "",
  academicLevel: "undergraduate",
  fieldOfStudy: "",
  description: "",
  achievementsInput: "",
  focusAreasInput: "",
  logoUrl: "",
  logoPublicId: "",
  logoAlt: "",
  startedAt: "",
  completedAt: "",
  isCurrent: false,
  isFeatured: false,
  isActive: true,
  priority: 100,
};

export const formValuesToPayload = (values: EducationFormValues) => {
  const payload: Record<string, unknown> = {
    title: values.title,
    institution: values.institution,
    academicLevel: values.academicLevel,
    fieldOfStudy: values.fieldOfStudy || undefined,
    description: values.description || undefined,
    achievements: parseLines(values.achievementsInput),
    focusAreas: parseLines(values.focusAreasInput),
    isCurrent: values.isCurrent,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    priority: values.priority,
  };

  if (values.logoUrl) {
    payload.logo = {
      url: values.logoUrl,
      publicId: values.logoPublicId || undefined,
      alt: values.logoAlt || undefined,
    };
  }

  if (values.startedAt) {
    payload.startedAt = new Date(values.startedAt).toISOString();
  }
  if (values.completedAt && !values.isCurrent) {
    payload.completedAt = new Date(values.completedAt).toISOString();
  }

  return payload;
};

export const educationToFormValues = (entry: Education): EducationFormValues => ({
  title: entry.title,
  institution: entry.institution,
  academicLevel: entry.academicLevel,
  fieldOfStudy: entry.fieldOfStudy ?? "",
  description: entry.description ?? "",
  achievementsInput: joinLines(entry.achievements),
  focusAreasInput: joinLines(entry.focusAreas),
  logoUrl: entry.logo?.url ?? "",
  logoPublicId: entry.logo?.publicId ?? "",
  logoAlt: entry.logo?.alt ?? "",
  startedAt: toDateInput(entry.startedAt),
  completedAt: toDateInput(entry.completedAt),
  isCurrent: entry.isCurrent,
  isFeatured: entry.isFeatured,
  isActive: entry.isActive,
  priority: entry.priority,
});
