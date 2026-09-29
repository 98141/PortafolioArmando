"use client";

import { createContext, useContext, useId, useState, useSyncExternalStore } from "react";
import type { ButtonHTMLAttributes, FormEvent, FormHTMLAttributes } from "react";
import { createUploadCoordinator } from "@/src/lib/uploadCoordinator";

const UploadContext = createContext<{
  coordinator: ReturnType<typeof createUploadCoordinator>;
  busy: boolean;
  pending: number;
  statusId: string;
} | null>(null);

export const useUploadForm = () => useContext(UploadContext);

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  saving?: boolean;
};

export default function UploadForm({ onSubmit, saving = false, children, className, ...props }: Props) {
  const [coordinator] = useState(createUploadCoordinator);
  const snapshot = useSyncExternalStore(coordinator.subscribe, coordinator.getSnapshot, coordinator.getSnapshot);
  const statusId = useId();
  const busy = saving || snapshot.saving;
  return <UploadContext.Provider value={{ coordinator, busy, pending: snapshot.pending, statusId }}>
    <form {...props} onSubmit={async (event) => {
      event.preventDefault();
      if (saving) return;
      // Hold the lock during validation AND persistence, including Enter/requestSubmit.
      await coordinator.submit(() => onSubmit(event));
    }}>
      <p id={statusId} role="status" className="mb-3 text-sm text-cyan-300">
        {snapshot.pending > 0
          ? `Subiendo ${snapshot.pending} archivo(s). Espera a que terminen antes de guardar.`
          : busy ? "Guardando formulario… No cambies los archivos hasta terminar." : ""}
      </p>
      <fieldset disabled={busy} className={className} aria-busy={busy}>
        {children}
      </fieldset>
    </form>
  </UploadContext.Provider>;
}

export function UploadSubmitButton({ disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const form = useUploadForm();
  return <button {...props} type="submit" disabled={disabled || form?.busy || !!form?.pending}
    aria-describedby={form?.statusId} />;
}
