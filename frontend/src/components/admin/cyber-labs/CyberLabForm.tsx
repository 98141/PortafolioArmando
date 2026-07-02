"use client";

import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import FileUploadField from "@/src/components/admin/uploads/FileUploadField";
import type { UploadResponse } from "@/src/services/uploadService";

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
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CyberLabFormValues>({
    resolver: zodResolver(cyberLabFormSchema),
    defaultValues,
  });

  const [evidenceAlt, setEvidenceAlt] = useState("");
  const [evidenceCaption, setEvidenceCaption] = useState("");
  const [evidenceUploadValue, setEvidenceUploadValue] = useState<UploadResponse | null>(null);

  const currentReportUrl = watch("reportUrl");
  const currentReportPublicId = watch("reportPublicId") || "";
  const reportPreviewValue = currentReportUrl
    ? {
        url: currentReportUrl,
        secureUrl: currentReportUrl,
        publicId: currentReportPublicId,
        resourceType: "raw" as const,
        originalName: "Reporte PDF",
      }
    : null;

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
          Evidencia por línea. Soporta manual:
          <span className="text-purple-300"> url|alt|caption</span> y también
          imágenes subidas con Cloudinary: <span className="text-purple-300">url|publicId|alt|caption</span>.
        </p>

        <div className="space-y-4">
          <FileUploadField
            label="Subir evidencia (imagen)"
            value={evidenceUploadValue}
            onChange={(asset) => {
              setEvidenceUploadValue(asset);
              if (!asset?.secureUrl && !asset?.url) return;

              const prev = getValues("evidenceInput") ?? "";
              const line = `${asset.secureUrl || asset.url}|${asset.publicId || ""}|${evidenceAlt || ""}|${evidenceCaption || ""}`.replace(
                /\s+$/,
                ""
              );

              const next = prev ? `${prev}\n${line}` : line;
              setValue("evidenceInput", next, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            uploadType="cyber-evidence"
            accept="image/png,image/jpeg,image/webp,image/gif"
            maxSize={5 * 1024 * 1024}
            helperText="Tamaño máx: 5MB. Se guardará como línea en el textarea."
            previewType="image"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="evidenceAlt" className={labelClass}>
                Alt (opcional)
              </label>
              <input
                id="evidenceAlt"
                className={inputClass}
                value={evidenceAlt}
                onChange={(e) => setEvidenceAlt(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="evidenceCaption" className={labelClass}>
                Caption (opcional)
              </label>
              <input
                id="evidenceCaption"
                className={inputClass}
                value={evidenceCaption}
                onChange={(e) => setEvidenceCaption(e.target.value)}
              />
            </div>
          </div>
        </div>

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
            <input type="hidden" {...register("reportPublicId")} />
          </div>
          <div>
            <label htmlFor="reportLabel" className={labelClass}>
              Etiqueta del reporte
            </label>
            <input id="reportLabel" className={inputClass} {...register("reportLabel")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FileUploadField
            label="Subir reporte PDF"
            value={reportPreviewValue}
            onChange={(asset) => {
              if (!asset) {
                setValue("reportUrl", "", { shouldValidate: true, shouldDirty: true });
                setValue("reportPublicId", "", { shouldValidate: true, shouldDirty: true });
                return;
              }

              setValue("reportUrl", asset.secureUrl || asset.url, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setValue("reportPublicId", asset.publicId, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            uploadType="cyber-report"
            accept="application/pdf"
            maxSize={10 * 1024 * 1024}
            helperText="Tamaño máx: 10MB. Se guardará en URL + publicId."
            previewType="pdf"
          />

          <div className="glass-panel rounded-2xl p-4">
            <p className="text-xs text-zinc-500">
              Puedes dejar el campo manual si ya tienes un PDF en un host propio.
            </p>
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

