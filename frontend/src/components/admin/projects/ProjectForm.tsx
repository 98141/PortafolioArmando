"use client";

import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectFormSchema } from "@/src/lib/validations/project";
import {
  defaultProjectFormValues,
  formValuesToPayload,
} from "@/src/lib/projectForm";
import type { ProjectFormValues } from "@/src/types/project";
import { projectCategoryLabels, projectStatusLabels } from "@/src/lib/projectLabels";
import type { ProjectCategory, ProjectStatus } from "@/src/types/project";
import { cn } from "@/src/lib/cn";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm text-zinc-400";

interface ProjectFormProps {
  defaultValues?: ProjectFormValues;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({
  defaultValues = defaultProjectFormValues,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const handleFormSubmit = async (values: ProjectFormValues) => {
    await onSubmit(formValuesToPayload(values));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Información general</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Título *
            </label>
            <input id="title" className={inputClass} {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="subtitle" className={labelClass}>
              Subtítulo
            </label>
            <input id="subtitle" className={inputClass} {...register("subtitle")} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="shortDescription" className={labelClass}>
              Descripción corta *
            </label>
            <textarea
              id="shortDescription"
              rows={3}
              className={cn(inputClass, "resize-y")}
              {...register("shortDescription")}
            />
            {errors.shortDescription && (
              <p className="mt-1 text-xs text-red-400">
                {errors.shortDescription.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="longDescription" className={labelClass}>
              Descripción larga
            </label>
            <textarea
              id="longDescription"
              rows={6}
              className={cn(inputClass, "resize-y")}
              {...register("longDescription")}
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Categoría
            </label>
            <select id="category" className={inputClass} {...register("category")}>
              {(Object.entries(projectCategoryLabels) as [ProjectCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Estado
            </label>
            <select id="status" className={inputClass} {...register("status")}>
              {(Object.entries(projectStatusLabels) as [ProjectStatus, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Tecnologías y contenido</h2>
        <div>
          <label htmlFor="technologiesInput" className={labelClass}>
            Tecnologías (separadas por coma)
          </label>
          <input
            id="technologiesInput"
            className={inputClass}
            placeholder="Next.js, TypeScript, MongoDB"
            {...register("technologiesInput")}
          />
        </div>
        <div>
          <label htmlFor="featuresInput" className={labelClass}>
            Features (una por línea)
          </label>
          <textarea
            id="featuresInput"
            rows={4}
            className={cn(inputClass, "resize-y")}
            {...register("featuresInput")}
          />
        </div>
        <div>
          <label htmlFor="challengesInput" className={labelClass}>
            Challenges (una por línea)
          </label>
          <textarea
            id="challengesInput"
            rows={3}
            className={cn(inputClass, "resize-y")}
            {...register("challengesInput")}
          />
        </div>
        <div>
          <label htmlFor="learningsInput" className={labelClass}>
            Learnings (una por línea)
          </label>
          <textarea
            id="learningsInput"
            rows={3}
            className={cn(inputClass, "resize-y")}
            {...register("learningsInput")}
          />
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Imagen y enlaces</h2>
        <p className="text-xs text-zinc-500">
          URLs por ahora. Subida Cloudinary en sprint posterior.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="imageUrl" className={labelClass}>
              Imagen principal (URL)
            </label>
            <input id="imageUrl" className={inputClass} {...register("imageUrl")} />
            {errors.imageUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.imageUrl.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="imageAlt" className={labelClass}>
              Alt text imagen
            </label>
            <input id="imageAlt" className={inputClass} {...register("imageAlt")} />
          </div>
          <div>
            <label htmlFor="linksDemo" className={labelClass}>
              Demo
            </label>
            <input id="linksDemo" className={inputClass} {...register("linksDemo")} />
          </div>
          <div>
            <label htmlFor="linksGithub" className={labelClass}>
              GitHub
            </label>
            <input id="linksGithub" className={inputClass} {...register("linksGithub")} />
          </div>
          <div>
            <label htmlFor="linksDocumentation" className={labelClass}>
              Documentación
            </label>
            <input
              id="linksDocumentation"
              className={inputClass}
              {...register("linksDocumentation")}
            />
          </div>
          <div>
            <label htmlFor="linksCaseStudy" className={labelClass}>
              Case study
            </label>
            <input
              id="linksCaseStudy"
              className={inputClass}
              {...register("linksCaseStudy")}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Publicación</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="priority" className={labelClass}>
              Prioridad (menor = primero)
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
            <label htmlFor="startedAt" className={labelClass}>
              Inicio
            </label>
            <input
              id="startedAt"
              type="date"
              className={inputClass}
              {...register("startedAt")}
            />
          </div>
          <div>
            <label htmlFor="completedAt" className={labelClass}>
              Finalización
            </label>
            <input
              id="completedAt"
              type="date"
              className={inputClass}
              {...register("completedAt")}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              className="rounded border-white/20 bg-white/5"
              {...register("isFeatured")}
            />
            <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
            Destacado
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              className="rounded border-white/20 bg-white/5"
              {...register("isActive")}
            />
            Activo (visible en web pública)
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl gradient-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
