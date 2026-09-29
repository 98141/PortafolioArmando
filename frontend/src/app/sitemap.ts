import type { MetadataRoute } from "next";
import { siteOrigin } from "@/src/lib/publicConfig";
import { getAllPublicItems, resources, type Resource } from "@/src/lib/publicContent";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/projects", "/cybersecurity", "/certifications", "/education", "/blog", "/about", "/contact"];
  const dynamic = await Promise.all((Object.keys(resources) as Resource[]).map(async resource => {
    const items = await getAllPublicItems(resource);
    return items.map(item => ({
      url: siteOrigin + "/" + resource + "/" + encodeURIComponent(item.slug),
      ...(item.updatedAt && !Number.isNaN(Date.parse(item.updatedAt)) ? { lastModified: new Date(item.updatedAt) } : {}),
    }));
  }));
  return [...staticRoutes.map(path => ({ url: siteOrigin + path })), ...dynamic.flat()];
}
