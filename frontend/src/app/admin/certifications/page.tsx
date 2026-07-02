"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Plus } from "lucide-react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import CertificationFilters, {
  type CertificationFilterState,
} from "@/src/components/admin/certifications/CertificationFilters";
import CertificationTable from "@/src/components/admin/certifications/CertificationTable";
import DeleteCertificationDialog from "@/src/components/admin/certifications/DeleteCertificationDialog";
import { certificationService } from "@/src/services/certificationService";
import type { Certification, CertificationCategory, CertificationStatus } from "@/src/types/certification";

const defaultFilters: CertificationFilterState = {
  search: "",
  category: "all",
  status: "all",
  featured: "all",
  active: "all",
};

export default function AdminCertificationsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CertificationFilterState>(defaultFilters);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = { page, limit: 20 };
    if (filters.search) params.search = filters.search;
    if (filters.category !== "all") params.category = filters.category as CertificationCategory;
    if (filters.status !== "all") params.status = filters.status as CertificationStatus;
    if (filters.featured === "yes") params.isFeatured = true;
    if (filters.featured === "no") params.isFeatured = false;
    if (filters.active === "yes") params.isActive = true;
    if (filters.active === "no") params.isActive = false;
    return params;
  }, [filters, page]);

  const loadCertifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificationService.getAdminCertifications(queryParams);
      setCertifications(data.certifications);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudieron cargar las certificaciones.";
      setError(message);
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await certificationService.deleteCertification(deleteTarget._id);
      setDeleteTarget(null);
      await loadCertifications();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo eliminar la certificación.";
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
              <h2 className="text-2xl font-bold text-zinc-100">Certificaciones</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Credenciales profesionales, badges y enlaces de verificación.
              </p>
            </div>
            <Link
              href="/admin/certifications/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva certificación
            </Link>
          </div>

          <CertificationFilters filters={filters} onChange={setFilters} />

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
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
            </div>
          ) : certifications.length === 0 ? (
            <div className="glass-panel flex flex-col items-center rounded-2xl py-16 text-center">
              <Award className="mb-4 h-12 w-12 text-zinc-600" aria-hidden="true" />
              <p className="text-zinc-400">No hay certificaciones con estos filtros.</p>
              <button
                type="button"
                onClick={() => router.push("/admin/certifications/new")}
                className="mt-4 text-sm text-amber-400 hover:text-amber-300"
              >
                Crear la primera →
              </button>
            </div>
          ) : (
            <>
              <CertificationTable
                certifications={certifications}
                onDelete={setDeleteTarget}
              />
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

        <DeleteCertificationDialog
          certification={deleteTarget}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
