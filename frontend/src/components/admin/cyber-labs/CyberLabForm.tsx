"use client";

import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cyberLabFormSchema } from "@/src/lib/validations/cyberLab";
import {
  defaultCyberLabFormValues,
  formValuesToPayload,
} from "@/src/lib/cyberLabForm";
import type { CyberLabFormValues } from "@/src/types/cyberLab";
import {
  cyberLabCategoryLabels,
  cyberLabStatusLabels,
  cyberSeverityLabels,
} from "@/src/lib/cyberLabLabels";
import type { CyberLabCategory, CyberLabStatus, CyberSeverity } from "@/src/types/cyberLab";
import { cn } from "@/src/lib/cn";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20";
const labelClass = "mb-1.5 block text-sm text-zinc-400";

interface CyberLabFormProps {
  defaultValues?: CyberLabFormValues;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function CyberLabForm({
  defaultValues = defaultCyberLabFormValues,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: CyberLabFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CyberLabFormValues>({
    resolver: zodResolver(cyberLabFormSchema),
    defaultValues,
  });

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
        <h2 className="font-semibold text-zinc-100">Identificación del caso</h2>
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
              Resumen ejecutivo *
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
            <label htmlFor="fullDescription" className={labelClass}>
              Descripción técnica completa
            </label>
            <textarea
              id="fullDescription"
              rows={8}
              className={cn(inputClass, "resize-y font-mono text-xs")}
              {...register("fullDescription")}
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Categoría
            </label>
            <select id="category" className={inputClass} {...register("category")}>
              {(Object.entries(cyberLabCategoryLabels) as [CyberLabCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="severity" className={labelClass}>
              Severidad
            </label>
            <select id="severity" className={inputClass} {...register("severity")}>
              {(Object.entries(cyberSeverityLabels) as [CyberSeverity, string][]).map(
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
              {(Object.entries(cyberLabStatusLabels) as [CyberLabStatus, string][]).map(
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
              Tags (clasificación defensiva, coma)
            </label>
            <input
              id="tagsInput"
              className={inputClass}
              placeholder="defensive, owasp, appsec"
              {...register("tagsInput")}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Metodología y análisis</h2>
        <div>
          <label htmlFor="methodologyInput" className={labelClass}>
            Metodología (una fase por línea)
          </label>
          <textarea
            id="methodologyInput"
            rows={4}
            className={cn(inputClass, "resize-y")}
            placeholder="Reconocimiento&#10;Análisis de superficie&#10;Validación de controles"
            {...register("methodologyInput")}
          />
        </div>
        <div>
          <label htmlFor="toolsInput" className={labelClass}>
            Herramientas (separadas por coma)
          </label>
          <input
            id="toolsInput"
            className={inputClass}
            {...register("toolsInput")}
          />
        </div>
        <div>
          <label htmlFor="findingsInput" className={labelClass}>
            Hallazgos (uno por línea)
          </label>
          <textarea
            id="findingsInput"
            rows={5}
            className={cn(inputClass, "resize-y")}
            {...register("findingsInput")}
          />
        </div>
        <div>
          <label htmlFor="mitigationsInput" className={labelClass}>
            Mitigaciones (una por línea)
          </label>
          <textarea
            id="mitigationsInput"
            rows={4}
            className={cn(inputClass, "resize-y")}
            {...register("mitigationsInput")}
          />
        </div>
        <div>
          <label htmlFor="referencesInput" className={labelClass}>
            Referencias (OWASP, NIST, CVE, etc.)
          </label>
          <textarea
            id="referencesInput"
            rows={3}
            className={cn(inputClass, "resize-y")}
            {...register("referencesInput")}
          />
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Evidencia y reporte</h2>
        <p className="text-xs text-zinc-500">
          URLs por ahora. Formato evidencia por línea:{" "}
          <code className="text-purple-300">url|alt|caption</code>. Cloudinary en sprint
          posterior.
        </p>
        <div>
          <label htmlFor="evidenceInput" className={labelClass}>
            Evidencia visual
          </label>
          <textarea
            id="evidenceInput"
            rows={4}
            className={cn(inputClass, "resize-y font-mono text-xs")}
            placeholder="https://example.com/screenshot.png|Burp request|SQLi proof"
            {...register("evidenceInput")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reportUrl" className={labelClass}>
              Reporte PDF (URL)
            </label>
            <input id="reportUrl" className={inputClass} {...register("reportUrl")} />
            {errors.reportUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.reportUrl.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="reportLabel" className={labelClass}>
              Etiqueta del reporte
            </label>
            <input id="reportLabel" className={inputClass} {...register("reportLabel")} />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Publicación</h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
            <label htmlFor="startedAt" className={labelClass}>
              Inicio
            </label>
            <input id="startedAt" type="date" className={inputClass} {...register("startedAt")} />
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
            <input type="checkbox" className="rounded" {...register("isFeatured")} />
            <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
            Destacado
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" className="rounded" {...register("isActive")} />
            Activo (visible en web)
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300"
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
