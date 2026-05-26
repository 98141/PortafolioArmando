"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CertificationForm from "@/src/components/admin/certifications/CertificationForm";
import { certificationService } from "@/src/services/certificationService";
import { certificationToFormValues } from "@/src/lib/certificationForm";

export default function EditCertificationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState(
    certificationToFormValues({
      _id: id,
      title: "",
      slug: "",
      issuer: "",
      category: "other",
      skills: [],
      status: "active",
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
        const cert = await certificationService.getAdminCertificationById(id);
        setDefaultValues(certificationToFormValues(cert));
      } catch {
        setError("No se pudo cargar la certificación.");
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
      await certificationService.updateCertification(id, payload);
      router.push("/admin/certifications");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo actualizar la certificación.";
      setError(message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Editar certificación</h2>
        </div>
        <CertificationForm
          key={id}
          defaultValues={defaultValues}
          submitLabel="Guardar cambios"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/certifications")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
