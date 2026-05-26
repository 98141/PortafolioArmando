"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/src/types/blogPost";
import { blogCategoryLabels } from "@/src/lib/blogPostLabels";
import GlassCard from "@/src/components/ui/GlassCard";

interface RelatedPostsProps {
  posts: BlogPost[];
  currentSlug: string;
}

export default function RelatedPosts({ posts, currentSlug }: RelatedPostsProps) {
  const related = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/10 pt-12">
      <h2 className="text-lg font-semibold text-zinc-100">Artículos relacionados</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {related.map((post) => (
          <GlassCard key={post._id} className="p-5" hover>
            <p className="text-xs text-violet-400">{blogCategoryLabels[post.category]}</p>
            <h3 className="mt-2 font-medium text-zinc-100 line-clamp-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-violet-300">
                {post.title}
              </Link>
            </h3>
            <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400"
            >
              Leer
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
