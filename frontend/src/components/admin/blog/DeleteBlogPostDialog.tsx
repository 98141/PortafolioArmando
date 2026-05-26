"use client";

import type { BlogPost } from "@/src/types/blogPost";

interface DeleteBlogPostDialogProps {
  post: BlogPost | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteBlogPostDialog({
  post,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteBlogPostDialogProps) {
  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-blog-title"
    >
      <div className="glass-panel w-full max-w-md rounded-2xl p-6">
        <h2 id="delete-blog-title" className="text-lg font-semibold text-zinc-100">
          Eliminar artículo
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          ¿Eliminar permanentemente <strong className="text-zinc-200">{post.title}</strong>? Esta
          acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
