"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileText, X } from "lucide-react";
import type { UploadResponse } from "@/src/services/uploadService";
import { uploadService } from "@/src/services/uploadService";

export type UploadFieldType =
  | "project-image"
  | "cyber-evidence"
  | "cyber-report"
  | "certification-badge"
  | "education-logo"
  | "blog-cover"
  | "author-avatar"
  | "cv";

type PreviewType = "image" | "pdf";

interface FileUploadFieldProps {
  label: string;
  value: UploadResponse | null | undefined;
  onChange: (value: UploadResponse | null) => void;
  // folder/type (mapeado a endpoint backend en uploadService)
  uploadType: UploadFieldType;
  accept: string;
  maxSize: number; // bytes
  helperText?: string;
  previewType: PreviewType;
  disabled?: boolean;
}

const bytesToMB = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(2).replace(/\.00$/, "")}MB`;

const pickUploadFn = (uploadType: UploadFieldType) => {
  switch (uploadType) {
    case "project-image":
      return uploadService.uploadProjectImage;
    case "cyber-evidence":
      return uploadService.uploadCyberEvidence;
    case "cyber-report":
      return uploadService.uploadCyberReport;
    case "certification-badge":
      return uploadService.uploadCertificationBadge;
    case "education-logo":
      return uploadService.uploadEducationLogo;
    case "blog-cover":
      return uploadService.uploadBlogCover;
    case "author-avatar":
      return uploadService.uploadAuthorAvatar;
    case "cv":
      return uploadService.uploadCv;
  }

  // Fallback: should never happen due to the union type.
  return uploadService.uploadProjectImage;
};

export default function FileUploadField({
  label,
  value,
  onChange,
  uploadType,
  accept,
  maxSize,
  helperText,
  previewType,
  disabled = false,
}: FileUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFn = useMemo(() => pickUploadFn(uploadType), [uploadType]);

  const handleFile = async (file: File | null) => {
    setError(null);
    setWarning(null);
    if (!file) return;

    if (file.size > maxSize) {
      setError(`El archivo supera el límite (${bytesToMB(maxSize)}).`);
      return;
    }

    const previous = value?.publicId ? value : null;

    try {
      setLoading(true);
      const uploaded = await uploadFn(file);

      if (
        previous?.publicId &&
        previous.publicId !== uploaded.publicId
      ) {
        const deleted = await uploadService.tryDeleteUploadedAsset(
          previous.publicId,
          previous.resourceType
        );
        if (!deleted) {
          setWarning(
            "El nuevo archivo se subió correctamente, pero no se pudo eliminar el anterior en Cloudinary."
          );
        }
      }

      onChange(uploaded);
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "No se pudo subir el archivo.";
      setError(message);
      onChange(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    onChange(null);
    setError(null);
    setWarning(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm text-zinc-300">{label}</p>
        <input
          type="file"
          accept={accept}
          disabled={disabled || loading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-zinc-200 hover:file:bg-white/10 disabled:opacity-50"
        />
        {helperText && (
          <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
        )}
      </div>

      {(value?.url || value?.secureUrl) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          {previewType === "image" && value?.url && (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-zinc-300">
                  {value.originalName || "Archivo"}
                </div>
                <div className="mt-2 h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                  <Image
                    src={value.secureUrl || value.url}
                    alt={value.originalName || label}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={clear}
                disabled={disabled || loading}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
                aria-label="Quitar archivo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {previewType === "pdf" && (value?.secureUrl || value?.url) && (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm text-zinc-200">
                  <FileText
                    className="h-4 w-4 text-red-400"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {value.originalName || "PDF"}
                  </span>
                </div>
                <a
                  href={value.secureUrl || value.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Ver PDF
                </a>
              </div>
              <button
                type="button"
                onClick={clear}
                disabled={disabled || loading}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
                aria-label="Quitar archivo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {warning && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {warning}
        </p>
      )}
    </div>
  );
}

