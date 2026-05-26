import { z } from "zod";

const certificationCategoryEnum = z.enum([
  "cybersecurity",
  "software_development",
  "devops",
  "cloud",
  "networking",
  "database",
  "programming",
  "appsec",
  "compliance",
  "other",
]);

const certificationStatusEnum = z.enum(["active", "expired", "archived"]);

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "URL inválida");

export const certificationFormSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(200),
  issuer: z.string().trim().min(2, "Emisor requerido").max(200),
  credentialId: z.string().trim().max(120),
  credentialUrl: optionalUrl,
  badgeUrl: optionalUrl,
  badgePublicId: z.string().trim().optional(),
  badgeAlt: z.string().trim().max(200),
  description: z.string().trim().max(3000),
  category: certificationCategoryEnum,
  skillsInput: z.string(),
  issuedAt: z.string(),
  expiresAt: z.string(),
  status: certificationStatusEnum,
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
});
