import type { Metadata } from "next";
import BlogPostPageClient from "@/src/app/(public)/blog/[slug]/BlogPostPageClient";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  try {
    const res = await fetch(`${apiUrl}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("not found");
    const json = await res.json();
    const post = json.data?.post;
    return {
      title: post?.seo?.title ?? `${post?.title ?? "Artículo"} | Armando Mora`,
      description: post?.seo?.description ?? post?.excerpt,
    };
  } catch {
    return {
      title: "Knowledge Hub | Armando Mora",
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return <BlogPostPageClient slug={slug} />;
}
