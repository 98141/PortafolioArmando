"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteCyberLabDialogProps {
  open: boolean;
  title: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCyberLabDialog({
  open,
  title,
  loading,
  onConfirm,
  onCancel,
}: DeleteCyberLabDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-lab-title"
    >
      <div className="glass-panel w-full max-w-md rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div>
              <h2 id="delete-lab-title" className="font-semibold text-zinc-100">
                Eliminar security case
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                ¿Eliminar <span className="text-zinc-200">{title}</span>? Acción irreversible
                (hard delete).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-300"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600/90 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
