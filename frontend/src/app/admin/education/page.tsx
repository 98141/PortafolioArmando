"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Plus } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import EducationFilters, {
  type EducationFilterState,
} from "@/src/components/admin/education/EducationFilters";
import EducationTable from "@/src/components/admin/education/EducationTable";
import DeleteEducationDialog from "@/src/components/admin/education/DeleteEducationDialog";
import { educationService } from "@/src/services/educationService";
import type { Education, AcademicLevel } from "@/src/types/education";

const defaultFilters: EducationFilterState = {
  search: "",
  academicLevel: "all",
  featured: "all",
  active: "all",
};

export default function AdminEducationPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<EducationFilterState>(defaultFilters);
  const [entries, setEntries] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);
  const [deleting, setDeleting] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = { page, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.academicLevel !== "all")
      params.academicLevel = filters.academicLevel as AcademicLevel;
    if (filters.featured === "yes") params.isFeatured = true;
    if (filters.featured === "no") params.isFeatured = false;
    if (filters.active === "yes") params.isActive = true;
    if (filters.active === "no") params.isActive = false;
    return params;
  }, [filters, page]);

  const loadEducation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await educationService.getAdminEducation(queryParams);
      setEntries(data.education);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo cargar la formación académica.";
      setError(message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadEducation();
  }, [loadEducation]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await educationService.deleteEducation(deleteTarget._id);
      setDeleteTarget(null);
      await loadEducation();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo eliminar el registro.";
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
              <h2 className="text-2xl font-bold text-zinc-100">Educación</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Formación académica, logros y trayectoria institucional.
              </p>
            </div>
            <Link
              href="/admin/education/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva formación
            </Link>
          </div>

          <EducationFilters filters={filters} onChange={setFilters} />

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
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
            </div>
          ) : entries.length === 0 ? (
            <div className="glass-panel flex flex-col items-center rounded-2xl py-16 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-zinc-600" aria-hidden="true" />
              <p className="text-zinc-400">No hay registros con estos filtros.</p>
              <button
                type="button"
                onClick={() => router.push("/admin/education/new")}
                className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
              >
                Crear el primero →
              </button>
            </div>
          ) : (
            <>
              <EducationTable entries={entries} onDelete={setDeleteTarget} />
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

        <DeleteEducationDialog
          entry={deleteTarget}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
