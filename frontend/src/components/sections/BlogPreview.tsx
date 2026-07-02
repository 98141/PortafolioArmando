"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { blogPostService } from "@/src/services/blogPostService";
import { featuredBlogPosts as fallbackFeatured } from "@/src/data/portfolioData";
import { mapLegacyBlogPost } from "@/src/lib/legacyBlogPostMapper";
import type { BlogPost } from "@/src/types/blogPost";
import SectionHeader from "@/src/components/ui/SectionHeader";
import BlogCard from "@/src/components/blog/BlogCard";

export default function BlogPreview() {
  const [fallback, setFallback] = useState<BlogPost[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-blog"],
    queryFn: () => blogPostService.getFeaturedBlogPosts(3),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackFeatured.map(mapLegacyBlogPost));
    }
  }, [isError]);

  const posts = data ?? fallback ?? [];
  const showFallbackNote = isError && fallback;

  if (!isLoading && posts.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Knowledge Hub"
            title="Últimos artículos"
            description="Writeups técnicos, AppSec y arquitectura de software."
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-violet-400 transition hover:text-violet-300"
          >
            Ver blog
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {showFallbackNote && (
          <p className="mt-4 text-xs text-amber-200/80" role="status">
            Datos de respaldo (API no disponible) — portfolioData.ts
          </p>
        )}

        {isLoading && !fallback ? (
          <div className="mt-10 flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-sm text-violet-300 hover:bg-violet-500/20"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Explorar Knowledge Hub
          </Link>
        </div>
      </div>
    </section>
  );
}
