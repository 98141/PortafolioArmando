"use client";

import { FileText } from "lucide-react";
import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { SiteSettingsFormValues } from "@/src/lib/validations/siteSettings";
import FileUploadField from "@/src/components/admin/uploads/FileUploadField";
import type { UploadResponse } from "@/src/services/uploadService";

interface Props {
  register: UseFormRegister<SiteSettingsFormValues>;
  setValue: UseFormSetValue<SiteSettingsFormValues>;
  cvUrl?: string;
  cvPublicId?: string;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";

export default function CvSettingsForm({ register, setValue, cvUrl, cvPublicId }: Props) {
  const value: UploadResponse | null = cvUrl
    ? {
        url: cvUrl,
        secureUrl: cvUrl,
        publicId: cvPublicId || "",
        resourceType: "raw",
        originalName: "CV",
      }
    : null;

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h3 className="mb-4 text-base font-semibold text-zinc-100">CV público</h3>
      <div className="space-y-4">
        <FileUploadField
          label="CV (PDF)"
          value={value}
          onChange={(asset) => {
            setValue("cv.url", asset?.secureUrl || asset?.url || "");
            setValue("cv.publicId", asset?.publicId || "");
            setValue("cv.fileName", asset?.originalName || "");
            setValue("cv.updatedAt", new Date().toISOString());
          }}
          uploadType="cv"
          accept="application/pdf"
          maxSize={10 * 1024 * 1024}
          helperText="Este enlace alimenta el botón Descargar CV en la web pública."
          previewType="pdf"
        />
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-zinc-500">
            URL manual de respaldo
          </label>
          <input className={inputClass} {...register("cv.url")} />
        </div>
        {cvUrl && (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300"
          >
            <FileText className="h-3.5 w-3.5" />
            Abrir CV actual
          </a>
        )}
      </div>
    </section>
  );
}
