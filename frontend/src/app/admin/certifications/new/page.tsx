"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CertificationForm from "@/src/components/admin/certifications/CertificationForm";
import { certificationService } from "@/src/services/certificationService";

export default function NewCertificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const cert = await certificationService.createCertification(payload);
      router.push(`/admin/certifications/${cert._id}/edit`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo crear la certificación.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Nueva certificación</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Credencial verificable con badge, categoría y skills asociadas.
          </p>
        </div>
        <CertificationForm
          submitLabel="Crear certificación"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/certifications")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
