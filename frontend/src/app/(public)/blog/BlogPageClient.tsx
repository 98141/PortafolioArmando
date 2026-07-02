"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { blogPostService } from "@/src/services/blogPostService";
import { blogPosts as fallbackPosts } from "@/src/data/portfolioData";
import { mapLegacyBlogPost } from "@/src/lib/legacyBlogPostMapper";
import type { BlogPost } from "@/src/types/blogPost";
import BlogFilters, { type BlogPublicFilterState } from "@/src/components/blog/BlogFilters";
import BlogGrid from "@/src/components/blog/BlogGrid";

const defaultFilters: BlogPublicFilterState = {
  search: "",
  category: "all",
  tag: "",
};

export default function BlogPageClient() {
  const [filters, setFilters] = useState<BlogPublicFilterState>(defaultFilters);
  const [fallback, setFallback] = useState<BlogPost[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-blog", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: 50 };
      if (filters.search) params.search = filters.search;
      if (filters.category !== "all") params.category = filters.category;
      if (filters.tag) params.tag = filters.tag;
      const result = await blogPostService.getBlogPosts(params);
      return result.posts;
    },
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (isError) {
      setFallback(fallbackPosts.map(mapLegacyBlogPost));
    }
  }, [isError]);

  const posts = data ?? fallback ?? [];

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [posts]);

  const filteredLocally = useMemo(() => {
    if (!fallback || data) return posts;
    return posts.filter((p) => {
      if (filters.category !== "all" && p.category !== filters.category) return false;
      if (filters.tag && !p.tags.includes(filters.tag)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [posts, filters, fallback, data]);

  const displayPosts = fallback && !data ? filteredLocally : posts;

  return (
    <section className="px-4 pb-20 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {isError && fallback && (
          <p className="text-xs text-amber-200/80" role="status">
            Mostrando datos de respaldo — la API no está disponible.
          </p>
        )}

        <BlogFilters
          filters={filters}
          availableTags={availableTags}
          onChange={setFilters}
        />

        {isLoading && !fallback ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
          </div>
        ) : (
          <BlogGrid posts={displayPosts} featuredFirst={displayPosts.some((p) => p.isFeatured)} />
        )}
      </div>
    </section>
  );
}
