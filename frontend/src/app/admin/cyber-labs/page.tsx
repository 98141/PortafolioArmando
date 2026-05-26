"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Shield } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CyberLabFilters, {
  type CyberLabFilterState,
} from "@/src/components/admin/cyber-labs/CyberLabFilters";
import CyberLabTable from "@/src/components/admin/cyber-labs/CyberLabTable";
import DeleteCyberLabDialog from "@/src/components/admin/cyber-labs/DeleteCyberLabDialog";
import { cyberLabService } from "@/src/services/cyberLabService";
import type { CyberLab } from "@/src/types/cyberLab";
import type { CyberLabCategory, CyberLabStatus, CyberSeverity } from "@/src/types/cyberLab";

const defaultFilters: CyberLabFilterState = {
  search: "",
  category: "all",
  severity: "all",
  status: "all",
  featured: "all",
  active: "all",
};

export default function AdminCyberLabsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CyberLabFilterState>(defaultFilters);
  const [labs, setLabs] = useState<CyberLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CyberLab | null>(null);
  const [deleting, setDeleting] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = { page, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.category !== "all") params.category = filters.category as CyberLabCategory;
    if (filters.severity !== "all") params.severity = filters.severity as CyberSeverity;
    if (filters.status !== "all") params.status = filters.status as CyberLabStatus;
    if (filters.featured === "yes") params.isFeatured = true;
    if (filters.featured === "no") params.isFeatured = false;
    if (filters.active === "yes") params.isActive = true;
    if (filters.active === "no") params.isActive = false;
    return params;
  }, [filters, page]);

  const loadLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cyberLabService.getAdminCyberLabs(queryParams);
      setLabs(data.labs);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudieron cargar los labs.";
      setError(message);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cyberLabService.deleteCyberLab(deleteTarget._id);
      setDeleteTarget(null);
      await loadLabs();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo eliminar el lab.";
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
              <h2 className="text-2xl font-bold text-zinc-100">Cyber Labs</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Security cases documentados — enfoque defensivo y profesional.
              </p>
            </div>
            <Link
              href="/admin/cyber-labs/new"
              className="inline-flex items-center gap-2 rounded-xl gradient-accent px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo security case
            </Link>
          </div>

          <CyberLabFilters filters={filters} onChange={setFilters} />

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
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
            </div>
          ) : labs.length === 0 ? (
            <div className="glass-panel flex flex-col items-center rounded-2xl py-16 text-center">
              <Shield className="mb-4 h-12 w-12 text-zinc-600" aria-hidden="true" />
              <p className="text-zinc-400">No hay security cases con estos filtros.</p>
              <button
                type="button"
                onClick={() => router.push("/admin/cyber-labs/new")}
                className="mt-4 text-sm text-purple-400 hover:text-purple-300"
              >
                Crear el primero →
              </button>
            </div>
          ) : (
            <>
              <CyberLabTable labs={labs} onDelete={setDeleteTarget} />
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

        <DeleteCyberLabDialog
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
