const { z } = require("zod");

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const coverImageSchema = z
  .object({
    url: optionalUrl,
    alt: z.string().trim().max(200).optional(),
  })
  .optional();

const seoSchema = z
  .object({
    title: z.string().trim().max(120).optional(),
    description: z.string().trim().max(320).optional(),
    canonicalUrl: optionalUrl,
  })
  .optional();

const authorSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    role: z.string().trim().max(200).optional(),
    avatarUrl: optionalUrl,
  })
  .optional();

const stringArray = z.array(z.string().trim().min(1)).optional().default([]);

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

const createBlogPostSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  excerpt: z.string().trim().min(30, "Excerpt must be at least 30 characters").max(600),
  content: z.string().trim().min(100, "Content must be at least 100 characters").max(80000),
  coverImage: coverImageSchema,
  category: blogCategoryEnum.default("other"),
  tags: stringArray,
  status: blogStatusEnum.default("draft"),
  seo: seoSchema,
  author: authorSchema,
  readingTime: z.coerce.number().int().min(1).optional(),
  relatedTopics: stringArray,
  allowComments: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
  publishedAt: z.coerce.date().optional(),
  lastReviewedAt: z.coerce.date().optional(),
});

const updateBlogPostSchema = createBlogPostSchema.partial();

const blogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  category: blogCategoryEnum.optional(),
  status: blogStatusEnum.optional(),
  tag: z.string().trim().optional(),
  isFeatured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  search: z.string().trim().optional(),
});

module.exports = {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogQuerySchema,
  blogCategoryEnum,
  blogStatusEnum,
};
