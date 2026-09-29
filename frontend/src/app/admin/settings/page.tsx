"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/authStore";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import SiteSettingsForm from "@/src/components/admin/settings/SiteSettingsForm";
import { siteSettingsService } from "@/src/services/siteSettingsService";
import type { SiteSettings } from "@/src/types/siteSettings";

export default function AdminSiteSettingsPage() {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const queryKey = ["admin-settings", user?._id];
  const query = useQuery({ queryKey, queryFn: () => siteSettingsService.getAdminSettings(), enabled: !!user, staleTime: 0, gcTime: 0, retry: false });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (payload: SiteSettings) => {
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await siteSettingsService.updateAdminSettings(payload);
      queryClient.setQueryData(queryKey, updated);
      setSaved(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo guardar Site Settings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Site Settings</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Configuración central del perfil público, SEO base y CV.
            </p>
          </div>
          {saved && <p role="status" className="text-sm text-emerald-300">Configuración guardada.</p>}
          {query.isPending ? (
            <div className="glass-panel rounded-2xl p-6 text-sm text-zinc-400">
              Cargando configuración...
            </div>
          ) : query.isError || !query.data ? (
            <div role="alert" className="text-rose-300"><p>No se pudo cargar la configuración.</p><button onClick={() => void query.refetch()} className="mt-3 text-cyan-300">Reintentar</button></div>
          ) : (
            <SiteSettingsForm
              key={query.data.updatedAt || "initial"}
              initialSettings={query.data}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
