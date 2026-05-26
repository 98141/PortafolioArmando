import type { BlogPost } from "@/src/types/blogPost";
import type { Certification } from "@/src/types/certification";
import type { CyberLab } from "@/src/types/cyberLab";
import type { Education } from "@/src/types/education";
import type { Project } from "@/src/types/project";
import type { SiteSettings } from "@/src/types/siteSettings";

export const personJsonLd = (settings: SiteSettings, baseUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: settings.profile?.fullName || "Armando Mora",
  jobTitle: settings.profile?.professionalTitle,
  email: settings.profile?.email,
  url: settings.profile?.website || baseUrl,
  sameAs: [settings.profile?.linkedin, settings.profile?.github].filter(Boolean),
});

export const websiteJsonLd = (settings: SiteSettings, baseUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: settings.seo?.siteName || "Armando Mora",
  url: baseUrl,
  description: settings.seo?.defaultDescription,
});

export const blogPostingJsonLd = (post: BlogPost, baseUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.seo?.description || post.excerpt,
  image: post.coverImage?.url,
  datePublished: post.publishedAt || post.createdAt,
  dateModified: post.updatedAt,
  author: { "@type": "Person", name: post.author?.name || "Armando Mora" },
  mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
});

export const creativeWorkJsonLd = (
  item: Project | CyberLab,
  baseUrl: string,
  section: string,
  description?: string
) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: item.title,
  description: description || item.shortDescription,
  url: `${baseUrl}/${section}/${item.slug}`,
});

export const certificationJsonLd = (cert: Certification) => ({
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalCredential",
  name: cert.title,
  credentialCategory: cert.category,
  recognizedBy: cert.issuer,
  url: cert.credentialUrl,
});

export const educationJsonLd = (entry: Education) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: entry.title,
  provider: {
    "@type": "EducationalOrganization",
    name: entry.institution,
  },
  description: entry.description || entry.fieldOfStudy,
});
