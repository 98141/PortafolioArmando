"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { blogPostService } from "@/src/services/blogPostService";
import { blogPosts as fallbackPosts } from "@/src/data/portfolioData";
import { mapLegacyBlogPost } from "@/src/lib/legacyBlogPostMapper";
import type { BlogPost } from "@/src/types/blogPost";
import BlogDetail from "@/src/components/blog/BlogDetail";
import RelatedPosts from "@/src/components/blog/RelatedPosts";

interface BlogPostPageClientProps {
  slug: string;
}

export default function BlogPostPageClient({ slug }: BlogPostPageClientProps) {
  const [fallback, setFallback] = useState<BlogPost | null>(null);
  const [relatedFallback, setRelatedFallback] = useState<BlogPost[]>([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogPostService.getBlogPostBySlug(slug),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["blog-related", slug],
    queryFn: async () => {
      const result = await blogPostService.getBlogPosts({ limit: 6 });
      return result.posts;
    },
    staleTime: 60_000,
    enabled: !!data || !!fallback,
  });

  useEffect(() => {
    if (isError) {
      const legacy = fallbackPosts.find((p) => p.id === slug);
      if (legacy) {
        setFallback(mapLegacyBlogPost(legacy));
        setRelatedFallback(
          fallbackPosts.filter((p) => p.id !== slug).map(mapLegacyBlogPost)
        );
      }
    }
  }, [isError, slug]);

  const post = data ?? fallback;

  if (isLoading && !fallback) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-zinc-100">Artículo no encontrado</h1>
        <p className="mt-2 text-zinc-500">El contenido solicitado no existe o no está publicado.</p>
      </div>
    );
  }

  const related = relatedPosts ?? relatedFallback;

  return (
    <section className="px-4 pb-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {isError && fallback && (
          <p className="mb-6 text-xs text-amber-200/80" role="status">
            Contenido de respaldo — API no disponible.
          </p>
        )}
        <BlogDetail post={post} />
        <RelatedPosts posts={related} currentSlug={slug} />
      </div>
    </section>
  );
}
