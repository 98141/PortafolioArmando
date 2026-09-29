import type { UploadResponse } from "@/src/services/uploadService";

export interface CvState {
  url: string;
  publicId: string;
  fileName?: string;
  updatedAt?: string;
}
type Snapshot = {
  current: CvState | null;
  read: "loading" | "error" | "ready";
  operation: "idle" | "upload" | "delete";
  uncertain: boolean;
  error: string | null;
  success: string | null;
};
type Service = {
  getAdminSettings: () => Promise<{ cv?: Partial<CvState> | null }>;
  deleteCv: () => Promise<void>;
};

/** One owner for reads and writes; stale completions never replace newer state. */
export function createCvController(service: Service) {
  let snapshot: Snapshot = { current: null, read: "loading", operation: "idle", uncertain: false, error: null, success: null };
  let epoch = 0;
  let active = true;
  const listeners = new Set<() => void>();
  const update = (patch: Partial<Snapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  };
  const canWrite = () => active && snapshot.operation === "idle" && snapshot.read === "ready" && !snapshot.uncertain;
  const failWrite = (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const uncertain = !status || status >= 500;
    update({ operation: "idle", uncertain, success: null,
      error: uncertain
        ? "No se pudo confirmar el resultado. Comprueba el estado actual del CV antes de repetir la operación."
        : "No se pudo actualizar el CV. Se conserva la última información confirmada; puedes reintentar." });
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    activate() { active = true; },
    dispose() { active = false; epoch++; },
    async refresh() {
      if (!active || snapshot.operation !== "idle") return;
      const request = ++epoch;
      update({ read: "loading", error: null, success: null });
      try {
        const settings = await service.getAdminSettings();
        if (!active || request !== epoch) return;
        update({ current: settings.cv?.url ? { ...settings.cv, url: settings.cv.url, publicId: settings.cv.publicId || "" } : null,
          read: "ready", uncertain: false });
      } catch {
        if (!active || request !== epoch) return;
        update({ read: "error", error: "No se pudo consultar el CV. Reintenta para comprobar su estado; esto no significa que no exista." });
      }
    },
    beginUpload() {
      if (!canWrite()) return false;
      epoch++;
      update({ operation: "upload", error: null, success: null });
      return true;
    },
    completeUpload(asset: UploadResponse | null) {
      if (!active || snapshot.operation !== "upload" || !asset) return;
      // POST /uploads/cv already persisted this reference. No second settings write.
      update({ current: { url: asset.secureUrl || asset.url, publicId: asset.publicId, fileName: asset.originalName },
        operation: "idle", read: "ready", success: "CV actualizado y enlazado al portfolio." });
    },
    failUpload(error: unknown) {
      if (active && snapshot.operation === "upload") failWrite(error);
    },
    async remove() {
      if (!canWrite() || !snapshot.current) return;
      const request = ++epoch;
      update({ operation: "delete", error: null, success: null });
      try {
        await service.deleteCv();
        if (!active || request !== epoch) return;
        update({ current: null, operation: "idle", read: "ready", success: "CV eliminado." });
      } catch (error) {
        if (active && request === epoch) failWrite(error);
      }
    },
  };
}
