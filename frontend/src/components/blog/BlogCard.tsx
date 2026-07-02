"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import type { BlogPost } from "@/src/types/blogPost";
import GlassCard from "@/src/components/ui/GlassCard";
import TechBadge from "@/src/components/ui/TechBadge";
import { blogCategoryLabels } from "@/src/lib/blogPostLabels";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <GlassCard as="article" className="flex h-full flex-col overflow-hidden" hover>
      {post.coverImage?.url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/5">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {featured && (
            <span className="absolute left-3 top-3 rounded-lg bg-violet-600/90 px-2 py-0.5 text-xs font-medium text-white">
              Destacado
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <TechBadge label={blogCategoryLabels[post.category]} variant="purple" />
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {post.readingTime} min
          </span>
        </div>
        <h2
          className={`mt-3 font-semibold text-zinc-100 ${featured ? "text-xl" : "text-lg"}`}
        >
          <Link href={`/blog/${post.slug}`} className="hover:text-violet-300">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <TechBadge key={tag} label={tag} />
            ))}
          </div>
          {post.publishedAt && (
            <time className="text-xs text-zinc-500" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Leer artículo
        </Link>
      </div>
    </GlassCard>
  );
}
