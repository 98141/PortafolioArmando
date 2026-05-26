"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import type { BlogPost } from "@/src/types/blogPost";
import { blogCategoryLabels } from "@/src/lib/blogPostLabels";
import MarkdownRenderer from "@/src/components/blog/MarkdownRenderer";
import TechBadge from "@/src/components/ui/TechBadge";

interface BlogDetailProps {
  post: BlogPost;
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function BlogDetail({ post }: BlogDetailProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Knowledge Hub
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <TechBadge label={blogCategoryLabels[post.category]} variant="purple" />
          {post.tags.map((tag) => (
            <TechBadge key={tag} label={tag} variant="cyan" />
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          {post.author?.name && (
            <span className="inline-flex items-center gap-2">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <User className="h-4 w-4 text-violet-400" aria-hidden="true" />
              )}
              <span>
                <span className="text-zinc-300">{post.author.name}</span>
                {post.author.role && (
                  <span className="block text-xs text-zinc-500">{post.author.role}</span>
                )}
              </span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {post.readingTime} min de lectura
          </span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.lastReviewedAt && (
            <span className="text-xs">Revisado: {formatDate(post.lastReviewedAt)}</span>
          )}
        </div>
      </header>

      {post.coverImage?.url && (
        <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="mt-10">
        <MarkdownRenderer content={post.content} />
      </div>

      {post.relatedTopics.length > 0 && (
        <footer className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Temas relacionados
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.relatedTopics.map((topic) => (
              <TechBadge key={topic} label={topic} variant="default" />
            ))}
          </div>
        </footer>
      )}

      {post.allowComments && (
        <p className="mt-8 text-xs text-zinc-600 italic">
          Comentarios — próximamente (Sprint 7+).
        </p>
      )}
    </article>
  );
}
