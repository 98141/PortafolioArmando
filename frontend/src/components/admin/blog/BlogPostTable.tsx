"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { BlogPost } from "@/src/types/blogPost";
import { blogCategoryLabels } from "@/src/lib/blogPostLabels";
import BlogStatusBadge from "@/src/components/admin/blog/BlogStatusBadge";
import TechBadge from "@/src/components/ui/TechBadge";

interface BlogPostTableProps {
  posts: BlogPost[];
  onDelete: (post: BlogPost) => void;
}

export default function BlogPostTable({ posts, onDelete }: BlogPostTableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Artículo</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Lectura</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post._id}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-zinc-100">{post.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{post.slug}</p>
                </td>
                <td className="px-4 py-4">
                  <TechBadge label={blogCategoryLabels[post.category]} variant="purple" />
                </td>
                <td className="px-4 py-4">
                  <BlogStatusBadge status={post.status} />
                </td>
                <td className="px-4 py-4 text-zinc-400">{post.readingTime} min</td>
                <td className="px-4 py-4 text-zinc-300">{post.priority}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.isFeatured && <TechBadge label="Destacado" variant="cyan" />}
                    {!post.isActive && <TechBadge label="Inactivo" variant="default" />}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/blog/${post._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-500/40"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(post)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
