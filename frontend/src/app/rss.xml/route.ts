import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { defaultSeoFallback } from "@/src/lib/seo";

import { siteOrigin as siteUrl, apiBaseUrl as apiUrl } from "@/src/lib/publicConfig";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const settings = await getPublicSiteSettings();
  let posts: Array<{ slug: string; title: string; excerpt: string; publishedAt?: string; updatedAt?: string }> = [];

  try {
    const res = await fetch(`${apiUrl}/blog?status=published&limit=50`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      posts = json?.data?.posts || [];
    }
  } catch {
    posts = [];
  }

  const channelTitle = settings.seo?.siteName || defaultSeoFallback.siteName;
  const channelDescription =
    settings.seo?.defaultDescription || defaultSeoFallback.defaultDescription;

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt || post.updatedAt || Date.now()).toUTCString();
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
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
