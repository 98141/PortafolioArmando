"use client";

import type { Education } from "@/src/types/education";

interface DeleteEducationDialogProps {
  entry: Education | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteEducationDialog({
  entry,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteEducationDialogProps) {
  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-edu-title"
    >
      <div className="glass-panel w-full max-w-md rounded-2xl p-6">
        <h2 id="delete-edu-title" className="text-lg font-semibold text-zinc-100">
          Eliminar formación
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          ¿Eliminar permanentemente <strong className="text-zinc-200">{entry.title}</strong>? Esta
          acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
