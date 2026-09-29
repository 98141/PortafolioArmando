import type { Metadata } from "next";
import { siteOrigin } from "@/src/lib/publicConfig";
import { getPublicDetail, getPublicList } from "@/src/lib/publicContent";
import { getPublicSiteSettings } from "@/src/lib/publicSiteSettings";
import { buildMetadata } from "@/src/lib/seo";
import { blogPostingJsonLd } from "@/src/lib/jsonLd";
import JsonLd from "@/src/components/seo/JsonLd";
import BlogDetail from "@/src/components/blog/BlogDetail";
import RelatedPosts from "@/src/components/blog/RelatedPosts";
interface Props { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPublicDetail("blog", slug), getPublicSiteSettings()]);
  return buildMetadata({ title: post.seo?.title || post.title, description: post.seo?.description || post.excerpt,
    path: "/blog/" + slug, seo: settings.seo, branding: settings.branding, imageUrl: post.coverImage?.url });
}
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicDetail("blog", slug);
  const related = await getPublicList("blog", { limit: 6, category: post.category }).catch(() => null);
  return <section className="px-4 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
    <JsonLd data={blogPostingJsonLd(post, siteOrigin)} />
    <BlogDetail post={post} />
    {related && <RelatedPosts posts={related.items} currentSlug={slug} />}
  </div></section>;
}
