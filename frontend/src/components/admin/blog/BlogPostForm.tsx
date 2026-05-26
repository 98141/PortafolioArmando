"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostFormSchema } from "@/src/lib/validations/blogPost";
import { defaultBlogPostFormValues, formValuesToPayload } from "@/src/lib/blogPostForm";
import type { BlogPostFormValues, BlogCategory, BlogStatus } from "@/src/types/blogPost";
import { blogCategoryLabels, blogStatusLabels } from "@/src/lib/blogPostLabels";
import MarkdownPreview from "@/src/components/admin/blog/MarkdownPreview";
import { cn } from "@/src/lib/cn";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20";
const labelClass = "mb-1.5 block text-sm text-zinc-400";

interface BlogPostFormProps {
  defaultValues?: BlogPostFormValues;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function BlogPostForm({
  defaultValues = defaultBlogPostFormValues,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: BlogPostFormProps) {
  const [showPreview, setShowPreview] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues,
  });

  const contentValue = watch("content");

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(formValuesToPayload(values)))}
      className="space-y-8"
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Contenido principal</h2>
        <div className="grid gap-4">
          <div>
            <label htmlFor="title" className={labelClass}>
              Título *
            </label>
            <input id="title" className={inputClass} {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Extracto (resumen) *
            </label>
            <textarea
              id="excerpt"
              rows={3}
              className={cn(inputClass, "resize-y")}
              {...register("excerpt")}
            />
            {errors.excerpt && (
              <p className="mt-1 text-xs text-red-400">{errors.excerpt.message}</p>
            )}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="content" className={labelClass}>
                Contenido (Markdown) *
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                {showPreview ? "Ocultar preview" : "Mostrar preview"}
              </button>
            </div>
            <textarea
              id="content"
              rows={14}
              className={cn(inputClass, "resize-y font-mono text-xs")}
              placeholder="## Introducción&#10;&#10;Escribe tu artículo en Markdown..."
              {...register("content")}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
            )}
          </div>
          {showPreview && <MarkdownPreview content={contentValue ?? ""} />}
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Cover y taxonomía</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="coverUrl" className={labelClass}>
              Cover image URL
            </label>
            <input
              id="coverUrl"
              type="url"
              placeholder="https://..."
              className={inputClass}
              {...register("coverUrl")}
            />
            {errors.coverUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.coverUrl.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="coverAlt" className={labelClass}>
              Cover alt
            </label>
            <input id="coverAlt" className={inputClass} {...register("coverAlt")} />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Categoría
            </label>
            <select id="category" className={inputClass} {...register("category")}>
              {(Object.entries(blogCategoryLabels) as [BlogCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="tagsInput" className={labelClass}>
              Tags (coma)
            </label>
            <input
              id="tagsInput"
              placeholder="appsec, owasp, nodejs"
              className={inputClass}
              {...register("tagsInput")}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="relatedTopicsInput" className={labelClass}>
              Related topics (coma)
            </label>
            <input id="relatedTopicsInput" className={inputClass} {...register("relatedTopicsInput")} />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="seoTitle" className={labelClass}>
              SEO title
            </label>
            <input id="seoTitle" className={inputClass} {...register("seoTitle")} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="seoDescription" className={labelClass}>
              SEO description
            </label>
            <textarea
              id="seoDescription"
              rows={2}
              className={cn(inputClass, "resize-y")}
              {...register("seoDescription")}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="canonicalUrl" className={labelClass}>
              Canonical URL
            </label>
            <input
              id="canonicalUrl"
              type="url"
              className={inputClass}
              {...register("canonicalUrl")}
            />
            {errors.canonicalUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.canonicalUrl.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Autor</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="authorName" className={labelClass}>
              Nombre *
            </label>
            <input id="authorName" className={inputClass} {...register("authorName")} />
            {errors.authorName && (
              <p className="mt-1 text-xs text-red-400">{errors.authorName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="authorRole" className={labelClass}>
              Rol
            </label>
            <input id="authorRole" className={inputClass} {...register("authorRole")} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="authorAvatarUrl" className={labelClass}>
              Avatar URL
            </label>
            <input
              id="authorAvatarUrl"
              type="url"
              className={inputClass}
              {...register("authorAvatarUrl")}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Publicación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className={labelClass}>
              Estado
            </label>
            <select id="status" className={inputClass} {...register("status")}>
              {(Object.entries(blogStatusLabels) as [BlogStatus, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className={labelClass}>
              Prioridad
            </label>
            <input
              id="priority"
              type="number"
              min={0}
              className={inputClass}
              {...register("priority", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label htmlFor="publishedAt" className={labelClass}>
              Fecha publicación
            </label>
            <input id="publishedAt" type="date" className={inputClass} {...register("publishedAt")} />
          </div>
          <div>
            <label htmlFor="lastReviewedAt" className={labelClass}>
              Última revisión
            </label>
            <input
              id="lastReviewedAt"
              type="date"
              className={inputClass}
              {...register("lastReviewedAt")}
            />
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 text-violet-500"
                {...register("isFeatured")}
              />
              <Star className="h-4 w-4 text-violet-400" aria-hidden="true" />
              Destacado
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 text-cyan-500"
                {...register("isActive")}
              />
              Activo en sitio
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5"
                {...register("allowComments")}
              />
              Comentarios (placeholder)
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {loading ? "Guardando…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-white/10 px-6 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
