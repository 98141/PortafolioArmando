"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FileText, X } from "lucide-react";
import type { UploadResponse } from "@/src/services/uploadService";
import { uploadService } from "@/src/services/uploadService";
import { useUploadForm } from "./UploadForm";

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
  onUploadStart?: () => boolean;
  onUploadError?: (error: unknown) => void;
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
  onUploadStart,
  onUploadError,
}: FileUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const id = useId();
  const form = useUploadForm();
  const operation = useRef<{ release: () => void } | null>(null);
  const blocked = disabled || !!form?.busy;

  useEffect(() => () => {
    operation.current?.release();
    operation.current = null;
  }, [uploadType]);

  const uploadFn = useMemo(() => pickUploadFn(uploadType), [uploadType]);

  const handleFile = async (file: File | null) => {
    if (blocked || operation.current || form?.coordinator.getSnapshot().saving) return;
    setError(null);
    setCompleted(false);
    if (!file) return;

    if (file.size > maxSize) {
      setError(`El archivo supera el límite (${bytesToMB(maxSize)}).`);
      return;
    }

    const release = form ? form.coordinator.beginUpload() : () => {};
    if (!release) return;
    if (onUploadStart && !onUploadStart()) { release(); return; }
    const active = { release };
    operation.current = active;

    try {
      setLoading(true);
      const uploaded = await uploadFn(file);
      if (operation.current !== active) return;

      // Entity uploads are staged; CV is persisted by its upload endpoint. Never delete assets here.
      onChange(uploaded);
      if (operation.current === active) setCompleted(true);
    } catch (e: unknown) {
      if (operation.current !== active) return;
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "No se pudo subir el archivo.";
      setError(uploadType === "cv" ? message : `${message} Selecciona el archivo de nuevo para reintentar.`);
      onUploadError?.(e);
      // Preserve the current form value if the upload fails.
    } finally {
      // Incorporate URL and publicId before enabling submit again.
      active.release();
      if (operation.current === active) {
        operation.current = null;
        setLoading(false);
      }
    }
  };

  const clear = () => {
    if (blocked || operation.current || form?.coordinator.getSnapshot().saving) return;
    onChange(null);
    setError(null);
    setCompleted(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={id} className="mb-1 block text-sm text-zinc-300">{label}</label>
        <input
          id={id}
          type="file"
          accept={accept}
          disabled={blocked || loading}
          aria-invalid={!!error}
          aria-describedby={`${id}-status${helperText ? ` ${id}-help` : ""}${error ? ` ${id}-error` : ""}`}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = "";
            return handleFile(file);
          }}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-zinc-200 hover:file:bg-white/10 disabled:opacity-50"
        />
        {helperText && (
          <p id={`${id}-help`} className="mt-1 text-xs text-zinc-400">{helperText}</p>
        )}
        <p id={`${id}-status`} role="status" className="mt-1 text-xs text-cyan-300">
          {loading ? "Subiendo archivo…" : completed && uploadType !== "cv" ? "Archivo subido. Guarda el formulario para publicar esta referencia." : ""}
        </p>
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
                disabled={blocked || loading}
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
                disabled={blocked || loading}
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
        <p id={`${id}-error`} role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

