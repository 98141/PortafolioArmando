import { api } from "@/src/services/api";
import type {
  CyberLabListResponse,
  CyberLabQueryParams,
  CyberLabResponse,
  FeaturedCyberLabsResponse,
} from "@/src/types/cyberLab";

const buildParams = (params?: CyberLabQueryParams) => {
  const search = new URLSearchParams();
  if (!params) return search;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  });

  return search;
};

export const cyberLabService = {
  async getCyberLabs(params?: CyberLabQueryParams) {
    const { data } = await api.get<CyberLabListResponse>("/cyber-labs", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getFeaturedCyberLabs(limit = 6) {
    const { data } = await api.get<FeaturedCyberLabsResponse>("/cyber-labs/featured", {
      params: { limit },
    });
    return data.data.labs;
  },

  async getCyberLabBySlug(slug: string) {
    const { data } = await api.get<CyberLabResponse>(`/cyber-labs/${slug}`);
    return data.data.lab;
  },

  async getAdminCyberLabs(params?: CyberLabQueryParams) {
    const { data } = await api.get<CyberLabListResponse>("/admin/cyber-labs", {
      params: buildParams(params),
    });
    return data.data;
  },

  async getAdminCyberLabById(id: string) {
    const { data } = await api.get<CyberLabResponse>(`/admin/cyber-labs/${id}`);
    return data.data.lab;
  },

  async createCyberLab(payload: Record<string, unknown>) {
    const { data } = await api.post<CyberLabResponse>("/admin/cyber-labs", payload);
    return data.data.lab;
  },

  async updateCyberLab(id: string, payload: Record<string, unknown>) {
    const { data } = await api.patch<CyberLabResponse>(`/admin/cyber-labs/${id}`, payload);
    return data.data.lab;
  },

  async deleteCyberLab(id: string) {
    await api.delete(`/admin/cyber-labs/${id}`);
  },
};
