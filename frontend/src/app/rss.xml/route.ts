import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { defaultSeoFallback } from "@/src/lib/seo";

import { getPublicList } from "@/src/lib/publicContent";
import { siteOrigin as siteUrl } from "@/src/lib/publicConfig";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const settings = await getPublicSiteSettings();
  const result = await getPublicList("blog", { limit: 50 }).catch(() => null);
  if (!result) return new Response("El feed no está disponible temporalmente.", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "120" } });
  const posts = result.items;

  const channelTitle = settings.seo?.siteName || defaultSeoFallback.siteName;
  const channelDescription =
    settings.seo?.defaultDescription || defaultSeoFallback.defaultDescription;

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.publishedAt || post.updatedAt;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      ${pubDate && !Number.isNaN(Date.parse(pubDate)) ? `<pubDate>${new Date(pubDate).toUTCString()}</pubDate>` : ""}
      <description>${escapeXml(post.excerpt || "")}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)} — Blog</title>
    <link>${escapeXml(siteUrl)}/blog</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>es</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
