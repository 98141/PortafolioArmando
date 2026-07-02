import { z } from "zod";

const blogCategoryEnum = z.enum([
  "cybersecurity",
  "software_development",
  "appsec",
  "devsecops",
  "web_security",
  "forensics",
  "cloud_security",
  "architecture",
  "backend",
  "frontend",
  "databases",
  "tutorials",
  "case_study",
  "writeup",
  "career",
  "other",
]);

const blogStatusEnum = z.enum(["draft", "published", "archived"]);

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "URL inválida");

export const blogPostFormSchema = z.object({
  title: z.string().trim().min(5, "Mínimo 5 caracteres").max(200),
  excerpt: z.string().trim().min(30, "Mínimo 30 caracteres").max(600),
  content: z.string().trim().min(100, "Mínimo 100 caracteres").max(80000),
  coverUrl: optionalUrl,
  coverPublicId: z.string().trim().optional(),
  coverAlt: z.string().trim().max(200),
  category: blogCategoryEnum,
  tagsInput: z.string(),
  status: blogStatusEnum,
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(320),
  canonicalUrl: optionalUrl,
  authorName: z.string().trim().min(2, "Nombre requerido").max(120),
  authorRole: z.string().trim().max(200),
  authorAvatarUrl: optionalUrl,
  authorAvatarPublicId: z.string().trim().optional(),
  relatedTopicsInput: z.string(),
  allowComments: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
  publishedAt: z.string(),
  lastReviewedAt: z.string(),
});
