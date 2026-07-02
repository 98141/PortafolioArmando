import { z } from "zod";

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

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "URL inválida");

export const cyberLabFormSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(150),
  subtitle: z.string().trim().max(200),
  shortDescription: z.string().trim().min(20, "Mínimo 20 caracteres").max(600),
  fullDescription: z.string().trim().max(15000),
  category: cyberLabCategoryEnum,
  severity: cyberSeverityEnum,
  status: cyberLabStatusEnum,
  methodologyInput: z.string(),
  toolsInput: z.string(),
  findingsInput: z.string(),
  mitigationsInput: z.string(),
  referencesInput: z.string(),
  tagsInput: z.string(),
  reportUrl: optionalUrl,
  reportLabel: z.string().trim().max(150),
  reportPublicId: z.string().trim().optional(),
  evidenceInput: z.string(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
  startedAt: z.string(),
  completedAt: z.string(),
});

export type CyberLabFormSchema = z.infer<typeof cyberLabFormSchema>;
