import type { MetadataRoute } from "next";
import { siteOrigin } from "@/src/lib/publicConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/admin" },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
