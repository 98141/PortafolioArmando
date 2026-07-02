const { z } = require("zod");
const { validateCanonicalBaseUrl } = require("../utils/canonicalUrl");

const optionalUrl = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalString = (max = 255) =>
  z
    .union([z.string().trim().max(max), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const optionalColor = z
  .union([z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid color"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const mediaAssetSchema = z
  .object({
    url: optionalUrl,
    publicId: optionalString(300),
    alt: optionalString(200),
  })
  .optional();

const profileSchema = z
  .object({
    fullName: optionalString(120),
    professionalTitle: optionalString(200),
    tagline: optionalString(240),
    shortBio: optionalString(400),
    longBio: optionalString(5000),
    location: optionalString(120),
    email: z
      .union([z.string().trim().email("Must be a valid email"), z.literal("")])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    phone: optionalString(40),
    whatsapp: optionalString(40),
    linkedin: optionalUrl,
    github: optionalUrl,
    website: optionalUrl,
  })
  .optional();

const brandingSchema = z
  .object({
    logo: mediaAssetSchema,
    avatar: mediaAssetSchema,
    primaryColor: optionalColor,
    accentColor: optionalColor,
  })
  .optional();

const cvSchema = z
  .object({
    url: optionalUrl,
    publicId: optionalString(300),
    fileName: optionalString(255),
    updatedAt: z.coerce.date().optional(),
  })
  .optional();

const seoSchema = z
  .object({
    siteName: optionalString(120),
    defaultTitle: optionalString(160),
    defaultDescription: optionalString(320),
    keywords: z.array(z.string().trim().min(1).max(80)).optional().default([]),
    ogImage: mediaAssetSchema,
    twitterHandle: optionalString(80),
    canonicalBaseUrl: optionalUrl,
  })
  .superRefine((data, ctx) => {
    if (!data?.canonicalBaseUrl) return;
    try {
      validateCanonicalBaseUrl(data.canonicalBaseUrl, { optional: false });
    } catch (err) {
      ctx.addIssue({
        code: "custom",
        message: err.message || "Invalid canonical base URL",
        path: ["canonicalBaseUrl"],
      });
    }
  })
  .optional();

const socialItemSchema = z.object({
  platform: optionalString(80),
  label: optionalString(120),
  url: optionalUrl,
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
});

const availabilitySchema = z
  .object({
    status: z.enum(["available", "limited", "unavailable"]).optional().default("available"),
    message: optionalString(240),
  })
  .optional();

const updateSiteSettingsSchema = z.object({
  profile: profileSchema,
  branding: brandingSchema,
  cv: cvSchema,
  seo: seoSchema,
  social: z.array(socialItemSchema).optional().default([]),
  availability: availabilitySchema,
  isActive: z.boolean().optional().default(true),
});

module.exports = {
  updateSiteSettingsSchema,
};
