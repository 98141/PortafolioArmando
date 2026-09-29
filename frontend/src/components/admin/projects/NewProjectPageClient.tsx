"use client";

import Link from "next/link";
import type { ProjectFormValues } from "@/src/types/project";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import ProjectForm from "@/src/components/admin/projects/ProjectForm";
import { projectService } from "@/src/services/projectService";

export default function NewProjectPage({ initialValues }: { initialValues?: ProjectFormValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectService.createProject(payload);
      router.push(`/admin/projects/${project._id}/edit`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo crear el proyecto.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Nuevo proyecto</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Completa el formulario para publicar en el portafolio.
          </p>
        </div>
        {initialValues ? <p className="mb-6 text-sm text-amber-200">Contenido inicial de Tejiendo Raíces. Revisa y completa los datos antes de activar su visibilidad. Guardarlo no publica la tienda ni cambia su contenido.</p> : <Link href="/admin/projects/new?draft=tejiendo-raices" className="mb-6 inline-block text-sm text-cyan-300">Empezar con Tejiendo Raíces →</Link>}
        <ProjectForm
          defaultValues={initialValues}
          submitLabel="Crear proyecto"
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/projects")}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
