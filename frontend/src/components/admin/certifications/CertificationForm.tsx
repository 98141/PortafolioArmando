"use client";

import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificationFormSchema } from "@/src/lib/validations/certification";
import {
  defaultCertificationFormValues,
  formValuesToPayload,
} from "@/src/lib/certificationForm";
import type { CertificationFormValues, CertificationCategory, CertificationStatus } from "@/src/types/certification";
import {
  certificationCategoryLabels,
  certificationStatusLabels,
} from "@/src/lib/certificationLabels";
import { cn } from "@/src/lib/cn";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20";
const labelClass = "mb-1.5 block text-sm text-zinc-400";

interface CertificationFormProps {
  defaultValues?: CertificationFormValues;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function CertificationForm({
  defaultValues = defaultCertificationFormValues,
  submitLabel,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: CertificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
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
        <h2 className="font-semibold text-zinc-100">Credencial</h2>
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
          <div>
            <label htmlFor="issuer" className={labelClass}>
              Entidad emisora *
            </label>
            <input id="issuer" className={inputClass} {...register("issuer")} />
            {errors.issuer && (
              <p className="mt-1 text-xs text-red-400">{errors.issuer.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Categoría
            </label>
            <select id="category" className={inputClass} {...register("category")}>
              {(Object.entries(certificationCategoryLabels) as [CertificationCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="credentialId" className={labelClass}>
              Credential ID
            </label>
            <input id="credentialId" className={inputClass} {...register("credentialId")} />
          </div>
          <div>
            <label htmlFor="credentialUrl" className={labelClass}>
              Enlace de verificación
            </label>
            <input
              id="credentialUrl"
              type="url"
              placeholder="https://..."
              className={inputClass}
              {...register("credentialUrl")}
            />
            {errors.credentialUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.credentialUrl.message}</p>
            )}
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
        <h2 className="font-semibold text-zinc-100">Badge y skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="badgeUrl" className={labelClass}>
              Badge URL
            </label>
            <input
              id="badgeUrl"
              type="url"
              placeholder="https://..."
              className={inputClass}
              {...register("badgeUrl")}
            />
            {errors.badgeUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.badgeUrl.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="badgeAlt" className={labelClass}>
              Badge alt text
            </label>
            <input id="badgeAlt" className={inputClass} {...register("badgeAlt")} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="skillsInput" className={labelClass}>
              Skills relacionadas (separadas por coma)
            </label>
            <input
              id="skillsInput"
              placeholder="OWASP, JWT, MongoDB"
              className={inputClass}
              {...register("skillsInput")}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-zinc-100">Fechas y publicación</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="issuedAt" className={labelClass}>
              Fecha de emisión
            </label>
            <input id="issuedAt" type="date" className={inputClass} {...register("issuedAt")} />
          </div>
          <div>
            <label htmlFor="expiresAt" className={labelClass}>
              Fecha de expiración (opcional)
            </label>
            <input id="expiresAt" type="date" className={inputClass} {...register("expiresAt")} />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Estado
            </label>
            <select id="status" className={inputClass} {...register("status")}>
              {(Object.entries(certificationStatusLabels) as [CertificationStatus, string][]).map(
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
                className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                {...register("isFeatured")}
              />
              <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
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
          className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
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
