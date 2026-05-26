const { z } = require("zod");

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const badgeSchema = z
  .object({
    url: optionalUrl,
    alt: z.string().trim().max(200).optional(),
  })
  .optional();

const stringArray = z.array(z.string().trim().min(1)).optional().default([]);

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

const createCertificationSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  issuer: z.string().trim().min(2, "Issuer is required").max(200),
  credentialId: z.string().trim().max(120).optional(),
  credentialUrl: optionalUrl,
  badge: badgeSchema,
  description: z.string().trim().max(3000).optional(),
  category: certificationCategoryEnum.default("other"),
  skills: stringArray,
  issuedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  status: certificationStatusEnum.default("active"),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
});

const updateCertificationSchema = createCertificationSchema.partial();

const certificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  category: certificationCategoryEnum.optional(),
  status: certificationStatusEnum.optional(),
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
  createCertificationSchema,
  updateCertificationSchema,
  certificationQuerySchema,
  certificationCategoryEnum,
  certificationStatusEnum,
};
