"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CyberLabForm from "@/src/components/admin/cyber-labs/CyberLabForm";
import { cyberLabService } from "@/src/services/cyberLabService";

export default function NewCyberLabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const lab = await cyberLabService.createCyberLab(payload);
      router.push(`/admin/cyber-labs/${lab._id}/edit`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo crear el security case.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Nuevo security case</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Documentación técnica con metodología, hallazgos y mitigaciones.
          </p>
        </div>
        <CyberLabForm
          submitLabel="Crear security case"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/cyber-labs")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
