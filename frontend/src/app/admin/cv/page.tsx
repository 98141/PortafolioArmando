"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, CheckCircle, Upload } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import FileUploadField from "@/src/components/admin/uploads/FileUploadField";
import type { UploadResponse } from "@/src/services/uploadService";
import { siteSettingsService } from "@/src/services/siteSettingsService";

interface CvState {
  url: string;
  publicId: string;
  fileName?: string;
  updatedAt?: string;
}

export default function AdminCvUploadPage() {
  const [current, setCurrent] = useState<CvState | null>(null);
  const [pendingUpload, setPendingUpload] = useState<UploadResponse | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    siteSettingsService
      .getAdminSettings()
      .then((s) => {
        const cv = (s as { cv?: CvState }).cv;
        if (cv?.url) setCurrent(cv);
      })
      .catch(() => {})
      .finally(() => setLoadingInit(false));
  }, []);

  const handleUploadComplete = (asset: UploadResponse | null) => {
    setPendingUpload(asset);
    setError(null);
    setSaved(false);
    if (asset) {
      setCurrent({
        url: asset.secureUrl,
        publicId: asset.publicId,
        fileName: asset.originalName,
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setPendingUpload(null);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    setError(null);
    setSaved(false);
    try {
      await siteSettingsService.deleteCv();
      setCurrent(null);
      setPendingUpload(null);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "No se pudo eliminar el CV.";
      setError(msg);
    } finally {
      setLoadingDelete(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">CV Profesional</h2>
            <p className="mt-1 text-sm text-zinc-400">
              El PDF subido queda enlazado al botón de descarga del portfolio público.
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

          {saved && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              CV actualizado y enlazado al portfolio.
            </div>
          )}

          {loadingInit ? (
            <div className="glass-panel rounded-2xl p-6 text-sm text-zinc-500">
              Cargando estado del CV…
            </div>
          ) : current ? (
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {current.fileName || "cv.pdf"}
                    </p>
                    {current.updatedAt && (
                      <p className="text-xs text-zinc-500">
                        Subido el {formatDate(current.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ver PDF
                  </a>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loadingDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {loadingDelete ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="mb-3 text-xs text-zinc-500 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Reemplazar con un nuevo PDF
                </p>
                <FileUploadField
                  label=""
                  value={pendingUpload}
                  onChange={handleUploadComplete}
                  uploadType="cv"
                  accept="application/pdf"
                  maxSize={10 * 1024 * 1024}
                  helperText="Máx. 10 MB · PDF"
                  previewType="pdf"
                />
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6">
              <FileUploadField
                label="CV (PDF)"
                value={pendingUpload}
                onChange={handleUploadComplete}
                uploadType="cv"
                accept="application/pdf"
                maxSize={10 * 1024 * 1024}
                helperText="Máx. 10 MB · PDF · Se enlaza automáticamente al portfolio."
                previewType="pdf"
              />
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
