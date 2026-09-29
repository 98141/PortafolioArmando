import type { Metadata } from "next";
import type { SiteBranding, SiteSeo } from "@/src/types/siteSettings";
import { siteOrigin } from "@/src/lib/publicConfig";
import { httpUrl } from "./publicLinks";

export const defaultSeoFallback = {
  siteName: "Armando Mora",
  defaultTitle: "Armando Mora | Desarrollo Full Stack y Ciberseguridad",
  defaultDescription:
    "Armando Mora: desarrollador full stack con enfoque en ciberseguridad. Proyectos de desarrollo web, APIs, e-commerce y seguridad de aplicaciones.",
  canonicalBaseUrl: siteOrigin,
  keywords: [
    "Armando Mora",
    "MERN",
    "Next.js",
    "AppSec",
    "ciberseguridad",
    "desarrollo full stack",
    "desarrollador full stack",
    "desarrollo web",
    "seguridad de aplicaciones web",
  ],
};

export const truncateDescription = (text?: string, max = 160) => {
  if (!text) return undefined;
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trimEnd()}...`;
};

export const buildCanonicalUrl = (baseUrl: string | undefined, path = "/") => {
  try {
    return new URL(path, baseUrl || defaultSeoFallback.canonicalBaseUrl).toString();
  } catch {
    return `${defaultSeoFallback.canonicalBaseUrl}${path}`;
  }
};

export const buildOpenGraph = ({
  title,
  description,
  canonical,
  imageUrl,
  siteName,
}: {
  title: string;
  description?: string;
  canonical: string;
  imageUrl?: string;
  siteName?: string;
}) => ({
  title,
  description,
  url: canonical,
  type: "website" as const,
  locale: "es_CO",
  siteName: siteName || defaultSeoFallback.siteName,
  images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
});

export const resolveOgImageUrl = (
  seo?: Partial<SiteSeo>,
  branding?: Partial<SiteBranding>,
  explicit?: string
) =>
  httpUrl(explicit) ||
  httpUrl(seo?.ogImage?.url) ||
  httpUrl(branding?.avatar?.url) ||
  httpUrl(branding?.logo?.url) ||
  `${siteOrigin}/og`;

export const buildMetadata = ({
  title,
  description,
  path = "/",
  seo,
  branding,
  imageUrl,
  noIndex = false,
  article,
}: {
  title?: string;
  description?: string;
  path?: string;
  seo?: Partial<SiteSeo>;
  branding?: Partial<SiteBranding>;
  imageUrl?: string;
  noIndex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[]; tags?: string[] };
}): Metadata => {
  const baseUrl = siteOrigin;
  const canonical = buildCanonicalUrl(baseUrl, path);
  const resolvedTitle = title || seo?.defaultTitle || defaultSeoFallback.defaultTitle;
  const resolvedDescription = truncateDescription(
    description || seo?.defaultDescription || defaultSeoFallback.defaultDescription
  );
  const keywords = seo?.keywords?.length ? seo.keywords : defaultSeoFallback.keywords;
  const resolvedOgImage = resolveOgImageUrl(seo, branding, imageUrl);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { ...buildOpenGraph({
      title: resolvedTitle,
      description: resolvedDescription,
      canonical,
      imageUrl: resolvedOgImage,
      siteName: seo?.siteName,
    }), ...(article ? { type: "article", ...article } : {}) },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedOgImage ? [resolvedOgImage] : undefined,
      creator: seo?.twitterHandle,
    },
  };
};
