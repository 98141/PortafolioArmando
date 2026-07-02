"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/src/components/admin/ProtectedRoute";
import AdminLayout from "@/src/components/admin/AdminLayout";
import SiteSettingsForm from "@/src/components/admin/settings/SiteSettingsForm";
import { siteSettingsService } from "@/src/services/siteSettingsService";
import type { SiteSettings } from "@/src/types/siteSettings";

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setFetching(true);
        const data = await siteSettingsService.getAdminSettings();
        setSettings(data || {});
      } catch {
        setError("No se pudo cargar Site Settings.");
      } finally {
        setFetching(false);
      }
    };
    void run();
  }, []);

  const handleSubmit = async (payload: SiteSettings) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await siteSettingsService.updateAdminSettings(payload);
      setSettings(updated || {});
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
          {fetching ? (
            <div className="glass-panel rounded-2xl p-6 text-sm text-zinc-400">
              Cargando configuración...
            </div>
          ) : (
            <SiteSettingsForm
              initialSettings={settings}
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
