import { z } from "zod";

const academicLevelEnum = z.enum([
  "diploma",
  "technical",
  "technologist",
  "undergraduate",
  "specialization",
  "masters",
  "doctorate",
  "bootcamp",
  "certification_program",
  "other",
]);

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "URL inválida");

export const educationFormSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(200),
  institution: z.string().trim().min(2, "Institución requerida").max(200),
  academicLevel: academicLevelEnum,
  fieldOfStudy: z.string().trim().max(200),
  description: z.string().trim().max(5000),
  achievementsInput: z.string(),
  focusAreasInput: z.string(),
  logoUrl: optionalUrl,
  logoAlt: z.string().trim().max(200),
  startedAt: z.string(),
  completedAt: z.string(),
  isCurrent: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
});
