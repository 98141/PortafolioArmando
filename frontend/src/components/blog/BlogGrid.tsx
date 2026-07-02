"use client";

import type { BlogPost } from "@/src/types/blogPost";
import BlogCard from "@/src/components/blog/BlogCard";

interface BlogGridProps {
  posts: BlogPost[];
  featuredFirst?: boolean;
}

export default function BlogGrid({ posts, featuredFirst = false }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-zinc-500">
        No hay artículos que coincidan con tu búsqueda.
      </p>
    );
  }

  const hero = featuredFirst ? posts.find((p) => p.isFeatured) ?? posts[0] : null;

  if (featuredFirst && hero) {
    const rest = posts.filter((p) => p._id !== hero._id);
    return (
      <div className="space-y-8">
        <div className="max-w-3xl">
          <BlogCard post={hero} featured />
        </div>
        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
