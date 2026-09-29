"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FileText, Trash2, CheckCircle, Upload } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import FileUploadField from "@/src/components/admin/uploads/FileUploadField";
import { createCvController } from "@/src/lib/cvController";
import { siteSettingsService } from "@/src/services/siteSettingsService";

export default function AdminCvUploadPage() {
  const [controller] = useState(() => createCvController(siteSettingsService));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const { current, error } = state;
  const busy = state.operation !== "idle";
  const blocked = busy || state.read !== "ready" || state.uncertain;

  useEffect(() => {
    controller.activate();
    void controller.refresh();
    return () => controller.dispose();
  }, [controller]);

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
            <h1 className="text-2xl font-bold text-zinc-100">CV Profesional</h1>
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

          {state.success && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              {state.success}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="button" disabled={busy || state.read === "loading"}
              onClick={() => void controller.refresh()}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm disabled:opacity-40">
              {state.read === "error" ? "Reintentar consulta" : "Comprobar estado actual"}
            </button>
            <p role="status" className="text-sm text-cyan-300">
              {state.read === "loading" ? "Cargando información del CV…"
                : state.operation === "upload" ? "Reemplazando CV… Espera antes de eliminar o subir otro archivo."
                : state.operation === "delete" ? "Eliminando CV… Espera antes de subir otro archivo."
                : current ? "CV disponible (última información confirmada)."
                : state.read === "ready" && !state.uncertain ? "Consulta correcta: no hay un CV publicado." : ""}
            </p>
          </div>

          {current ? (
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
                      <p className="text-xs text-zinc-400">
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
                    onClick={() => void controller.remove()}
                    disabled={blocked}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {state.operation === "delete" ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="mb-3 text-xs text-zinc-400 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Reemplazar con un nuevo PDF
                </p>
                <FileUploadField
                  key={current.publicId || current.url}
                  label="Reemplazar CV (PDF)"
                  value={null}
                  onChange={controller.completeUpload}
                  onUploadStart={controller.beginUpload}
                  onUploadError={controller.failUpload}
                  disabled={blocked}
                  uploadType="cv"
                  accept="application/pdf"
                  maxSize={10 * 1024 * 1024}
                  helperText="Máx. 10 MB · PDF"
                  previewType="pdf"
                />
              </div>
            </div>
          ) : state.read === "ready" && !state.uncertain ? (
            <div className="glass-panel rounded-2xl p-6">
              <FileUploadField
                label="CV (PDF)"
                value={null}
                onChange={controller.completeUpload}
                onUploadStart={controller.beginUpload}
                onUploadError={controller.failUpload}
                disabled={blocked}
                uploadType="cv"
                accept="application/pdf"
                maxSize={10 * 1024 * 1024}
                helperText="Máx. 10 MB · PDF · Se enlaza automáticamente al portfolio."
                previewType="pdf"
              />
            </div>
          ) : null}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
