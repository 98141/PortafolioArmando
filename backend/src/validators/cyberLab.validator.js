const { z } = require("zod");

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const evidenceItemSchema = z.object({
  url: optionalUrl,
  alt: z.string().trim().max(200).optional(),
  caption: z.string().trim().max(300).optional(),
});

const reportSchema = z
  .object({
    url: optionalUrl,
    label: z.string().trim().max(150).optional(),
  })
  .optional();

const stringArray = z.array(z.string().trim().min(1)).optional().default([]);

const cyberLabCategoryEnum = z.enum([
  "web_security",
  "pentesting",
  "forensics",
  "malware_analysis",
  "network_security",
  "appsec",
  "devsecops",
  "secure_coding",
  "incident_response",
  "threat_detection",
  "cloud_security",
  "mobile_security",
  "other",
]);

const cyberSeverityEnum = z.enum([
  "informational",
  "low",
  "medium",
  "high",
  "critical",
]);

const cyberLabStatusEnum = z.enum(["planned", "in_progress", "completed", "archived"]);

const createCyberLabSchema = z.object({
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
    .max(600),
  fullDescription: z.string().trim().max(15000).optional(),
  category: cyberLabCategoryEnum.default("web_security"),
  severity: cyberSeverityEnum.default("medium"),
  status: cyberLabStatusEnum.default("planned"),
  methodology: stringArray,
  tools: stringArray,
  findings: stringArray,
  mitigations: stringArray,
  references: stringArray,
  evidence: z.array(evidenceItemSchema).optional().default([]),
  report: reportSchema,
  tags: stringArray,
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

const updateCyberLabSchema = createCyberLabSchema.partial();

const cyberLabQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  category: cyberLabCategoryEnum.optional(),
  severity: cyberSeverityEnum.optional(),
  status: cyberLabStatusEnum.optional(),
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
  createCyberLabSchema,
  updateCyberLabSchema,
  cyberLabQuerySchema,
  cyberLabCategoryEnum,
  cyberSeverityEnum,
  cyberLabStatusEnum,
};
