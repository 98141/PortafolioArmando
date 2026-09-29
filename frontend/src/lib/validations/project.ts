import { z } from "zod";
import { httpUrl } from "@/src/lib/publicLinks";

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
  .refine((v) => v === "" || !!httpUrl(v), "Usa una URL HTTP(S) válida sin credenciales");

export const projectFormSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(150),
  subtitle: z.string().trim().max(200),
  shortDescription: z.string().trim().min(20, "Mínimo 20 caracteres").max(500),
  longDescription: z.string().trim().max(10000),
  caseStudy: z.object({
    role: z.string().trim().max(1000),
    problem: z.string().trim().max(6000),
    solution: z.string().trim().max(6000),
    architecture: z.string().trim().max(6000),
    results: z.string().trim().max(6000),
  }),
  gallery: z.array(z.object({ url: optionalUrl.refine(Boolean, "Añade una imagen o elimina esta fila"), publicId: z.string().optional(), alt: z.string().trim().min(1, "Describe la captura").max(200) })).max(12),
  category: projectCategoryEnum,
  status: projectStatusEnum,
  technologiesInput: z.string(),
  featuresInput: z.string(),
  challengesInput: z.string(),
  learningsInput: z.string(),
  imageUrl: optionalUrl,
  imagePublicId: z.string().trim().optional(),
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
