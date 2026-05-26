"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CyberLabForm from "@/src/components/admin/cyber-labs/CyberLabForm";
import { cyberLabService } from "@/src/services/cyberLabService";
import { labToFormValues } from "@/src/lib/cyberLabForm";
import type { CyberLabFormValues } from "@/src/types/cyberLab";

export default function EditCyberLabPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formValues, setFormValues] = useState<CyberLabFormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLab = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const lab = await cyberLabService.getAdminCyberLabById(id);
      setFormValues(labToFormValues(lab));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo cargar el security case.";
      setError(message);
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    loadLab();
  }, [loadLab]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      await cyberLabService.updateCyberLab(id, payload);
      router.push("/admin/cyber-labs");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo actualizar el security case.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Editar security case</h2>
          <p className="mt-1 text-sm text-zinc-400">ID: {id}</p>
        </div>

        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
          </div>
        ) : formValues ? (
          <CyberLabForm
            defaultValues={formValues}
            submitLabel="Guardar cambios"
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/cyber-labs")}
          />
        ) : (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error ?? "Security case no encontrado."}
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
