"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import ProjectFilters, {
  type ProjectFilterState,
} from "@/src/components/admin/projects/ProjectFilters";
import ProjectTable from "@/src/components/admin/projects/ProjectTable";
import DeleteProjectDialog from "@/src/components/admin/projects/DeleteProjectDialog";
import { projectService } from "@/src/services/projectService";
import type { Project } from "@/src/types/project";
import type { ProjectCategory, ProjectStatus } from "@/src/types/project";

const defaultFilters: ProjectFilterState = {
  search: "",
  category: "all",
  status: "all",
  featured: "all",
  active: "all",
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFilterState>(defaultFilters);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = { page, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.category !== "all") params.category = filters.category as ProjectCategory;
    if (filters.status !== "all") params.status = filters.status as ProjectStatus;
    if (filters.featured === "yes") params.isFeatured = true;
    if (filters.featured === "no") params.isFeatured = false;
    if (filters.active === "yes") params.isActive = true;
    if (filters.active === "no") params.isActive = false;
    return params;
  }, [filters, page]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAdminProjects(queryParams);
      setProjects(data.projects);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudieron cargar los proyectos.";
      setError(message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteTarget._id);
      setDeleteTarget(null);
      await loadProjects();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo eliminar el proyecto.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Proyectos</h2>
              <p className="mt-1 text-sm text-zinc-400">
                CMS de proyectos de software — crear, editar y publicar.
              </p>
            </div>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-xl gradient-accent px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo proyecto
            </Link>
          </div>

          <ProjectFilters filters={filters} onChange={setFilters} />

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-panel flex flex-col items-center rounded-2xl py-16 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-zinc-600" aria-hidden="true" />
              <p className="text-zinc-400">No hay proyectos con estos filtros.</p>
              <button
                type="button"
                onClick={() => router.push("/admin/projects/new")}
                className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
              >
                Crear el primero →
              </button>
            </div>
          ) : (
            <>
              <ProjectTable projects={projects} onDelete={setDeleteTarget} />
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="flex items-center px-4 text-sm text-zinc-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <DeleteProjectDialog
          open={!!deleteTarget}
          title={deleteTarget?.title ?? ""}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
