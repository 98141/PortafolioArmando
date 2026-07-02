import type { Metadata } from "next";
import BlogPostPageClient from "@/src/app/(public)/blog/[slug]/BlogPostPageClient";
import JsonLd from "@/src/components/seo/JsonLd";
import { blogPostingJsonLd } from "@/src/lib/jsonLd";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  try {
    const [res, settings] = await Promise.all([
      fetch(`${apiUrl}/blog/${slug}`, { next: { revalidate: 60 } }),
      getPublicSiteSettings(),
    ]);
    if (!res.ok) throw new Error("not found");
    const json = await res.json();
    const post = json.data?.post;
    return buildMetadata({
      title: post?.seo?.title ?? `${post?.title ?? "Artículo"} | Armando Mora`,
      description: post?.seo?.description ?? post?.excerpt,
      path: `/blog/${slug}`,
      seo: settings.seo,
      branding: settings.branding,
      imageUrl: post?.coverImage?.url,
    });
  } catch {
    return buildMetadata({
      title: "Knowledge Hub | Armando Mora",
      path: `/blog/${slug}`,
    });
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  const settings = await getPublicSiteSettings();
  const base = settings.seo?.canonicalBaseUrl || "https://armandomora.dev";
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const res = await fetch(`${apiUrl}/blog/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      const post = json.data?.post;
      if (post) {
        jsonLd = blogPostingJsonLd(post, base);
      }
    }
  } catch {
    jsonLd = null;
  }

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <BlogPostPageClient slug={slug} />
    </>
  );
}
