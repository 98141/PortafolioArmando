import { api } from "@/src/services/api";
import type { SiteSettings, SiteSettingsResponse } from "@/src/types/siteSettings";

export const siteSettingsService = {
  async getPublicSettings() {
    const { data } = await api.get<SiteSettingsResponse>("/site-settings");
    return data.data.settings;
  },

  async getAdminSettings() {
    const { data } = await api.get<SiteSettingsResponse>("/admin/site-settings");
    return data.data.settings;
  },

  async updateAdminSettings(payload: SiteSettings) {
    const { data } = await api.put<SiteSettingsResponse>("/admin/site-settings", payload);
    return data.data.settings;
  },

  async deleteCv() {
    await api.delete("/admin/site-settings/cv");
  },
};
