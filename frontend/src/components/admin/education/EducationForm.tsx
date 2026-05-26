"use client";

import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { educationFormSchema } from "@/src/lib/validations/education";
import { defaultEducationFormValues, formValuesToPayload } from "@/src/lib/educationForm";
import type { EducationFormValues, AcademicLevel } from "@/src/types/education";
import { academicLevelLabels } from "@/src/lib/educationLabels";
import { cn } from "@/src/lib/cn";
import FileUploadField from "@/src/components/admin/uploads/FileUploadField";
import type { UploadResponse } from "@/src/services/uploadService";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20";
const labelClass = "mb-1.5 block text-sm text-zinc-400";

interface EducationFormProps {
  defaultValues?: EducationFormValues;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function EducationForm({
  defaultValues = defaultEducationFormValues,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: EducationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues,
  });

  const isCurrent = watch("isCurrent");

  const logoUrl = watch("logoUrl");
  const logoPublicId = watch("logoPublicId") || "";
  const logoPreviewValue: UploadResponse | null = useMemo(
    () =>
      logoUrl
        ? {
            url: logoUrl,
            secureUrl: logoUrl,
            publicId: logoPublicId,
            resourceType: "image",
            originalName: "Logo",
          }
        : null,
    [logoUrl, logoPublicId]
  );

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
        <h2 className="font-semibold text-zinc-100">Programa académico</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Título / programa *
            </label>
            <input id="title" className={inputClass} {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="institution" className={labelClass}>
              Institución *
            </label>
            <input id="institution" className={inputClass} {...register("institution")} />
            {errors.institution && (
              <p className="mt-1 text-xs text-red-400">{errors.institution.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="academicLevel" className={labelClass}>
              Nivel académico
            </label>
            <select id="academicLevel" className={inputClass} {...register("academicLevel")}>
              {(Object.entries(academicLevelLabels) as [AcademicLevel, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fieldOfStudy" className={labelClass}>
              Campo de estudio
            </label>
            <input id="fieldOfStudy" className={inputClass} {...register("fieldOfStudy")} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Descripción
            </label>
            <textarea
              id="description"
              rows={4}
              className={cn(inputClass, "resize-y")}
              {...register("description")}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Logros y enfoque</h2>
        <div className="grid gap-4">
          <div>
            <label htmlFor="achievementsInput" className={labelClass}>
              Logros (uno por línea)
            </label>
            <textarea
              id="achievementsInput"
              rows={4}
              className={cn(inputClass, "resize-y font-mono text-xs")}
              placeholder="Proyecto integrador full stack&#10;Competencia de ciberseguridad"
              {...register("achievementsInput")}
            />
          </div>
          <div>
            <label htmlFor="focusAreasInput" className={labelClass}>
              Áreas de enfoque (una por línea)
            </label>
            <textarea
              id="focusAreasInput"
              rows={3}
              className={cn(inputClass, "resize-y font-mono text-xs")}
              {...register("focusAreasInput")}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Logo y fechas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="logoUrl" className={labelClass}>
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="url"
              placeholder="https://..."
              className={inputClass}
              {...register("logoUrl")}
            />
            {errors.logoUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.logoUrl.message}</p>
            )}
            <input type="hidden" {...register("logoPublicId")} />
          </div>
          <div>
            <label htmlFor="logoAlt" className={labelClass}>
              Logo alt text
            </label>
            <input id="logoAlt" className={inputClass} {...register("logoAlt")} />
          </div>

          <div className="sm:col-span-2">
            <FileUploadField
              label="Subir logo (imagen)"
              value={logoPreviewValue}
              onChange={(asset) => {
                setValue("logoUrl", asset?.secureUrl || asset?.url || "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue("logoPublicId", asset?.publicId || "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              uploadType="education-logo"
              accept="image/png,image/jpeg,image/webp,image/gif"
              maxSize={5 * 1024 * 1024}
              helperText="Si subes una imagen, se rellenan Logo URL + publicId. También puedes pegar una URL manual."
              previewType="image"
            />
          </div>
          <div>
            <label htmlFor="startedAt" className={labelClass}>
              Fecha inicio
            </label>
            <input id="startedAt" type="date" className={inputClass} {...register("startedAt")} />
          </div>
          <div>
            <label htmlFor="completedAt" className={labelClass}>
              Fecha fin
            </label>
            <input
              id="completedAt"
              type="date"
              className={inputClass}
              disabled={isCurrent}
              {...register("completedAt")}
            />
          </div>
          <div>
            <label htmlFor="priority" className={labelClass}>
              Prioridad (menor = más arriba)
            </label>
            <input
              id="priority"
              type="number"
              min={0}
              className={inputClass}
              {...register("priority", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30"
                {...register("isCurrent")}
              />
              En curso actualmente
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30"
                {...register("isFeatured")}
              />
              <Star className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              Destacar en home
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30"
                {...register("isActive")}
              />
              Visible en sitio público
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
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
