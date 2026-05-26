import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armandomora.dev";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const staticRoutes = [
  "",
  "/projects",
  "/cybersecurity",
  "/certifications",
  "/education",
  "/blog",
  "/about",
  "/contact",
];

const fetchSlugs = async (endpoint: string, key: string): Promise<string[]> => {
  try {
    const res = await fetch(`${apiUrl}${endpoint}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data?.[key] || [];
    return items.map((item: { slug?: string }) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [projects, labs, certs, education, posts] = await Promise.all([
    fetchSlugs("/projects?limit=200", "projects"),
    fetchSlugs("/cyber-labs?limit=200", "labs"),
    fetchSlugs("/certifications?limit=200", "certifications"),
    fetchSlugs("/education?limit=200", "education"),
    fetchSlugs("/blog?status=published&limit=200", "posts"),
  ]);

  const dynamicRoutes = [
    ...projects.map((slug) => `/projects/${slug}`),
    ...labs.map((slug) => `/cybersecurity/${slug}`),
    ...certs.map((slug) => `/certifications/${slug}`),
    ...education.map((slug) => `/education/${slug}`),
    ...posts.map((slug) => `/blog/${slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path.includes("/blog/") ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
