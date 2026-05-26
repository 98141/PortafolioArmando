"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import ProjectForm from "@/src/components/admin/projects/ProjectForm";
import { projectService } from "@/src/services/projectService";
import { projectToFormValues } from "@/src/lib/projectForm";
import type { ProjectFormValues } from "@/src/types/project";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formValues, setFormValues] = useState<ProjectFormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const project = await projectService.getAdminProjectById(id);
      setFormValues(projectToFormValues(project));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo cargar el proyecto.";
      setError(message);
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      await projectService.updateProject(id, payload);
      router.push("/admin/projects");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo actualizar el proyecto.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Editar proyecto</h2>
          <p className="mt-1 text-sm text-zinc-400">ID: {id}</p>
        </div>

        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
          </div>
        ) : formValues ? (
          <ProjectForm
            defaultValues={formValues}
            submitLabel="Guardar cambios"
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/projects")}
          />
        ) : (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error ?? "Proyecto no encontrado."}
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
