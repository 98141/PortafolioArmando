import { z } from "zod";

const projectCategoryEnum = z.enum([
  "fullstack",
  "frontend",
  "backend",
  "ecommerce",
  "cybersecurity",
  "appsec",
  "devops",
  "other",
]);

const projectStatusEnum = z.enum(["planned", "in_progress", "completed", "archived"]);

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "URL inválida");

export const projectFormSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(150),
  subtitle: z.string().trim().max(200),
  shortDescription: z.string().trim().min(20, "Mínimo 20 caracteres").max(500),
  longDescription: z.string().trim().max(10000),
  category: projectCategoryEnum,
  status: projectStatusEnum,
  technologiesInput: z.string(),
  featuresInput: z.string(),
  challengesInput: z.string(),
  learningsInput: z.string(),
  imageUrl: optionalUrl,
  imageAlt: z.string().trim().max(200),
  linksDemo: optionalUrl,
  linksGithub: optionalUrl,
  linksDocumentation: optionalUrl,
  linksCaseStudy: optionalUrl,
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
  startedAt: z.string(),
  completedAt: z.string(),
});

export type ProjectFormSchema = z.infer<typeof projectFormSchema>;
