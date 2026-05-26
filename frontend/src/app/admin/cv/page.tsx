"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import FileUploadField from "@/src/components/admin/uploads/FileUploadField";
import type { UploadResponse } from "@/src/services/uploadService";
import { uploadService } from "@/src/services/uploadService";

export default function AdminCvUploadPage() {
  const [cvValue, setCvValue] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!cvValue) return;
    setLoading(true);
    setError(null);
    try {
      await uploadService.deleteUploadedAsset(cvValue.publicId, cvValue.resourceType);
      setCvValue(null);
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "No se pudo eliminar el archivo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Subir CV</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Temporal: sube el PDF y registra la URL en el futuro (SiteSettings en Sprint 8+).
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div className="glass-panel rounded-2xl p-6">
            <FileUploadField
              label="CV (PDF)"
              value={cvValue}
              onChange={(asset) => {
                setCvValue(asset);
                setError(null);
              }}
              uploadType="cv"
              accept="application/pdf"
              maxSize={10 * 1024 * 1024}
              helperText="Se sube a Cloudinary. Actualmente no queda enlazado al botón público del CV."
              previewType="pdf"
              disabled={loading}
            />

            {cvValue?.secureUrl && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500">Enlace generado:</p>
                <a
                  href={cvValue.secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Abrir PDF
                </a>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!cvValue || loading}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 disabled:opacity-40"
              >
                {loading ? "Eliminando…" : "Eliminar en Cloudinary"}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

