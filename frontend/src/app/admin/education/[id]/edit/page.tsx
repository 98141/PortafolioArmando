"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import EducationForm from "@/src/components/admin/education/EducationForm";
import { educationService } from "@/src/services/educationService";
import { educationToFormValues } from "@/src/lib/educationForm";

export default function EditEducationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState(
    educationToFormValues({
      _id: id,
      title: "",
      slug: "",
      institution: "",
      academicLevel: "undergraduate",
      achievements: [],
      focusAreas: [],
      isCurrent: false,
      isFeatured: false,
      isActive: true,
      priority: 100,
      createdAt: "",
      updatedAt: "",
    })
  );

  useEffect(() => {
    const load = async () => {
      try {
        const entry = await educationService.getAdminEducationById(id);
        setDefaultValues(educationToFormValues(entry));
      } catch {
        setError("No se pudo cargar el registro.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      await educationService.updateEducation(id, payload);
      router.push("/admin/education");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo actualizar el registro.";
      setError(message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Editar formación</h2>
        </div>
        <EducationForm
          key={id}
          defaultValues={defaultValues}
          submitLabel="Guardar cambios"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/education")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
