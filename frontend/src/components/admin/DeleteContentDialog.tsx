"use client";

import { useId } from "react";
import Modal from "@/src/components/ui/Modal";

export default function DeleteContentDialog({ open, title, resource, loading = false, onConfirm, onCancel, error }: {
  open: boolean; title: string; resource: string; loading?: boolean; error?: string | null; onConfirm: () => void; onCancel: () => void;
}) {
  const id = useId();
  return <Modal open={open} onClose={onCancel} titleId={`${id}-title`} descriptionId={`${id}-description`} busy={loading}
    className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/20 bg-[#101527] p-6 text-zinc-100">
    <h2 id={`${id}-title`} className="text-lg font-semibold">Eliminar {resource}</h2>
    <p id={`${id}-description`} className="mt-3 text-sm text-zinc-300">
      ¿Eliminar <strong>{title}</strong>? Dejará de mostrarse en el sitio y en los listados activos.
    </p>
    {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button type="button" data-autofocus disabled={loading} onClick={onCancel}
        className="rounded-xl border border-white/20 px-4 py-2 text-sm">Cancelar</button>
      <button type="button" disabled={loading} onClick={onConfirm}
        className="rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {loading ? "Eliminando…" : "Eliminar"}
      </button>
    </div>
    <p role="status" className="sr-only">{loading ? "Eliminando. Espera a que termine la operación." : ""}</p>
  </Modal>;
}
