import type { BlogPost, BlogCategory } from "@/src/types/blogPost";
import type { LegacyBlogPost } from "@/src/types/portfolio";

const legacyCategoryMap: Record<string, BlogCategory> = {
  cybersecurity: "cybersecurity",
  development: "software_development",
  appsec: "appsec",
  tutorial: "tutorials",
  writeup: "writeup",
};

/** Maps Sprint 2 portfolioData LegacyBlogPost → API BlogPost (fallback only). */
export function mapLegacyBlogPost(legacy: LegacyBlogPost): BlogPost {
  return {
    _id: legacy.id,
    title: legacy.title,
    slug: legacy.id,
    excerpt: legacy.excerpt,
    content: legacy.content,
    coverImage: legacy.coverUrl ? { url: legacy.coverUrl, alt: legacy.title } : undefined,
    category: legacyCategoryMap[legacy.category] ?? "other",
    tags: legacy.tags,
    status: "published",
    author: {
      name: "Armando Mora",
      role: "Software Developer | Cybersecurity Specialist",
    },
    readingTime: legacy.readingTime,
    relatedTopics: legacy.tags,
    allowComments: false,
    isFeatured: !!legacy.featured,
    isActive: true,
    priority: legacy.featured ? 10 : 100,
    publishedAt: legacy.date ? `${legacy.date}T12:00:00.000Z` : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
