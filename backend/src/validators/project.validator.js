const { z } = require("zod");

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const imageSchema = z
  .object({
    url: optionalUrl,
    publicId: z.string().trim().optional(),
    alt: z.string().trim().max(200).optional(),
  })
  .optional();

const galleryItemSchema = z.object({
  url: optionalUrl,
  publicId: z.string().trim().optional(),
  alt: z.string().trim().max(200).optional(),
});

const linksSchema = z
  .object({
    demo: optionalUrl,
    github: optionalUrl,
    documentation: optionalUrl,
    caseStudy: optionalUrl,
  })
  .optional();

const stringArray = z.array(z.string().trim().min(1)).optional().default([]);

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

const createProjectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  subtitle: z.string().trim().max(200).optional(),
  shortDescription: z
    .string()
    .trim()
    .min(20, "Short description must be at least 20 characters")
    .max(500),
  longDescription: z.string().trim().max(10000).optional(),
  category: projectCategoryEnum.default("fullstack"),
  status: projectStatusEnum.default("planned"),
  technologies: stringArray,
  features: stringArray,
  challenges: stringArray,
  learnings: stringArray,
  image: imageSchema,
  gallery: z.array(galleryItemSchema).optional().default([]),
  links: linksSchema,
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  category: projectCategoryEnum.optional(),
  status: projectStatusEnum.optional(),
  isFeatured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  search: z.string().trim().optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectCategoryEnum,
  projectStatusEnum,
};
