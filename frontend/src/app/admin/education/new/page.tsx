"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import EducationForm from "@/src/components/admin/education/EducationForm";
import { educationService } from "@/src/services/educationService";

export default function NewEducationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const entry = await educationService.createEducation(payload);
      router.push(`/admin/education/${entry._id}/edit`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo crear el registro.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Nueva formación</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Trayectoria académica con logros, enfoque y fechas.
          </p>
        </div>
        <EducationForm
          submitLabel="Crear formación"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/education")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
