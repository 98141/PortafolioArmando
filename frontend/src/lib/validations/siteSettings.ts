import { z } from "zod";
import { validateCanonicalBaseUrl } from "@/src/lib/validations/canonicalUrl";

const optionalUrl = z
  .union([z.string().url("URL inválida"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalString = z
  .union([z.string().trim(), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const mediaAssetSchema = z.object({
  url: optionalUrl,
  publicId: optionalString,
  alt: optionalString,
});

const socialLinkSchema = z.object({
  platform: optionalString,
  label: optionalString,
  url: optionalUrl,
  isActive: z.boolean().optional().default(true),
  priority: z.coerce.number().int().min(0).optional().default(100),
});

export const siteSettingsFormSchema = z.object({
  profile: z.object({
    fullName: optionalString,
    professionalTitle: optionalString,
    tagline: optionalString,
    shortBio: optionalString,
    longBio: optionalString,
    location: optionalString,
    email: z
      .union([z.string().trim().email("Email inválido"), z.literal("")])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    phone: optionalString,
    whatsapp: optionalString,
    linkedin: optionalUrl,
    github: optionalUrl,
    website: optionalUrl,
  }),
  branding: z.object({
    logo: mediaAssetSchema,
    avatar: mediaAssetSchema,
    primaryColor: optionalString,
    accentColor: optionalString,
  }),
  cv: z.object({
    url: optionalUrl,
    publicId: optionalString,
    fileName: optionalString,
    updatedAt: optionalString,
  }),
  seo: z.object({
    siteName: optionalString,
    defaultTitle: optionalString,
    defaultDescription: optionalString,
    keywordsText: optionalString,
    ogImage: mediaAssetSchema,
    twitterHandle: optionalString,
    canonicalBaseUrl: optionalUrl,
  }),
  social: z.array(socialLinkSchema).default([]),
  availability: z.object({
    status: z.enum(["available", "limited", "unavailable"]).default("available"),
    message: optionalString,
  }),
}).superRefine((data, ctx) => {
  const result = validateCanonicalBaseUrl(data.seo.canonicalBaseUrl);
  if (!result.ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.message,
      path: ["seo", "canonicalBaseUrl"],
    });
  }
});

export interface SiteSettingsFormValues {
  profile: {
    fullName?: string;
    professionalTitle?: string;
    tagline?: string;
    shortBio?: string;
    longBio?: string;
    location?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  branding: {
    logo: { url?: string; publicId?: string; alt?: string };
    avatar: { url?: string; publicId?: string; alt?: string };
    primaryColor?: string;
    accentColor?: string;
  };
  cv: {
    url?: string;
    publicId?: string;
    fileName?: string;
    updatedAt?: string;
  };
  seo: {
    siteName?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    keywordsText?: string;
    ogImage: { url?: string; publicId?: string; alt?: string };
    twitterHandle?: string;
    canonicalBaseUrl?: string;
  };
  social: Array<{
    platform?: string;
    label?: string;
    url?: string;
    isActive?: boolean;
    priority?: number;
  }>;
  availability: {
    status: "available" | "limited" | "unavailable";
    message?: string;
  };
}
