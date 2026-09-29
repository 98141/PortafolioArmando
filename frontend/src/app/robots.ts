import type { MetadataRoute } from "next";
import { siteOrigin } from "@/src/lib/publicConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
