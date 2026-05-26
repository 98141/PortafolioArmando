const { z } = require("zod");

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const logoSchema = z
  .object({
    url: optionalUrl,
    alt: z.string().trim().max(200).optional(),
  })
  .optional();

const stringArray = z.array(z.string().trim().min(1)).optional().default([]);

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

const createEducationSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  institution: z.string().trim().min(2, "Institution is required").max(200),
  academicLevel: academicLevelEnum.default("undergraduate"),
  fieldOfStudy: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  achievements: stringArray,
  focusAreas: stringArray,
  logo: logoSchema,
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  isCurrent: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
});

const updateEducationSchema = createEducationSchema.partial();

const educationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  academicLevel: academicLevelEnum.optional(),
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
  createEducationSchema,
  updateEducationSchema,
  educationQuerySchema,
  academicLevelEnum,
};
